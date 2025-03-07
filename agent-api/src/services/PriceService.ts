import NodeCache from 'node-cache';
import axios from 'axios';

const PRICE_CACHE_TTL = 300; // Cache prices for 5 minutes
const cache = new NodeCache({ stdTTL: PRICE_CACHE_TTL });

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

interface TokenPrice {
  usdPrice: number;
  timestamp: number;
}

// Map our token symbols to CoinGecko IDs
const COINGECKO_ID_MAP: { [key: string]: string } = {
  'S': 'sonic-3',  // Replace with actual Sonic token ID when available
  'wS': 'sonic-3', // Same as native token
  'WETH': 'weth',
  'USDC': 'usd-coin',
  'EURC': 'euro-coin',
  'USDT': 'tether'
};

export class PriceService {
  private cache: NodeCache;

  constructor() {
    this.cache = cache;
  }

  private getCacheKey(tokenSymbol: string): string {
    return `price_${tokenSymbol.toLowerCase()}`;
  }

  private async fetchPriceFromAPI(tokenSymbol: string): Promise<number> {
    try {
      const coingeckoId = COINGECKO_ID_MAP[tokenSymbol];
      
      if (!coingeckoId) {
        console.warn(`No CoinGecko ID mapping found for token: ${tokenSymbol}`);
        return 0;
      }

      const response = await axios.get(`${COINGECKO_API_BASE}/simple/price`, {
        params: {
          ids: coingeckoId,
          vs_currencies: 'usd',
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data[coingeckoId]) {
        return response.data[coingeckoId].usd;
      }

      // Fallback to mock prices if CoinGecko doesn't have the token
      const mockPrices: { [key: string]: number } = {
        'S': 1.0,    // Native token
        'wS': 1.0,   // Wrapped native token
      };

      return mockPrices[tokenSymbol] || 0;
    } catch (error) {
      console.error(`Error fetching price from CoinGecko for ${tokenSymbol}:`, error);
      return 0;
    }
  }

  private async fetchBulkPricesFromAPI(symbols: string[]): Promise<Map<string, number>> {
    try {
      const uniqueIds = [...new Set(
        symbols
          .map(symbol => COINGECKO_ID_MAP[symbol])
          .filter(id => id) // Remove undefined mappings
      )].join(',');

      if (!uniqueIds) {
        return new Map();
      }

      const response = await axios.get(`${COINGECKO_API_BASE}/simple/price`, {
        params: {
          ids: uniqueIds,
          vs_currencies: 'usd',
        },
        timeout: 5000
      });

      const prices = new Map<string, number>();
      
      // Map CoinGecko responses back to our token symbols
      symbols.forEach(symbol => {
        const coingeckoId = COINGECKO_ID_MAP[symbol];
        if (coingeckoId && response.data[coingeckoId]) {
          prices.set(symbol, response.data[coingeckoId].usd);
        } else if (symbol === 'S' || symbol === 'wS') {
          // Fallback for native token
          prices.set(symbol, 1.0);
        }
      });

      return prices;
    } catch (error) {
      console.error('Error fetching bulk prices from CoinGecko:', error);
      return new Map();
    }
  }

  public async getTokenPrice(tokenSymbol: string): Promise<TokenPrice | null> {
    const cacheKey = this.getCacheKey(tokenSymbol);
    const cachedPrice = this.cache.get<TokenPrice>(cacheKey);

    if (cachedPrice) {
      return cachedPrice;
    }

    try {
      const usdPrice = await this.fetchPriceFromAPI(tokenSymbol);
      const priceData: TokenPrice = {
        usdPrice,
        timestamp: Date.now()
      };

      this.cache.set(cacheKey, priceData);
      return priceData;
    } catch (error) {
      console.error(`Error getting price for ${tokenSymbol}:`, error);
      return null;
    }
  }

  public async getTokenPrices(tokens: string[]): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();
    const uncachedTokens: string[] = [];
    const now = Date.now();

    // Check cache first
    tokens.forEach(symbol => {
      const cachedPrice = this.cache.get<TokenPrice>(this.getCacheKey(symbol));
      if (cachedPrice) {
        prices.set(symbol, cachedPrice);
      } else {
        uncachedTokens.push(symbol);
      }
    });

    if (uncachedTokens.length > 0) {
      // Fetch uncached prices in bulk
      const freshPrices = await this.fetchBulkPricesFromAPI(uncachedTokens);
      
      freshPrices.forEach((usdPrice, symbol) => {
        const priceData: TokenPrice = { usdPrice, timestamp: now };
        this.cache.set(this.getCacheKey(symbol), priceData);
        prices.set(symbol, priceData);
      });
    }

    return prices;
  }
} 