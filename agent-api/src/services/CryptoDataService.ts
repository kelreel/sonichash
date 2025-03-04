import { ethers } from 'ethers';
import NodeCache from 'node-cache';
import { SONIC_TOKENS, TokenInfo } from '../constants/tokens';
import { PriceService } from './priceService';

const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL set to 1 minute

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export interface TokenBalance {
  token: string;
  balance: string;
  symbol: string;
  decimals: number;
  usdValue?: number;
  priceUsd?: number;
}

export interface PortfolioAnalytics {
  totalUsdValue: number;
  topHoldings: Array<{
    symbol: string;
    usdValue: number;
    percentage: number;
  }>;
  stablecoinsValue: number;
  stablecoinsPercentage: number;
}

export interface WalletData {
  balances: TokenBalance[];
  totalUsdValue: number;
  analytics: PortfolioAnalytics;
}

export class CryptoDataService {
  private cache: NodeCache;
  private provider: ethers.JsonRpcProvider;
  private priceService: PriceService;

  constructor() {
    this.cache = cache;
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://rpc.soniclabs.com');
    this.priceService = new PriceService();
  }

  private getCacheKey(walletAddress: string): string {
    return `wallet_data_${walletAddress.toLowerCase()}`;
  }

  private async getCachedData<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key) || null;
  }

  private async setCachedData<T>(key: string, data: T): Promise<void> {
    this.cache.set(key, data);
  }

  private async getERC20Balance(tokenInfo: TokenInfo, walletAddress: string): Promise<TokenBalance> {
    const contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(walletAddress);
    
    return {
      token: tokenInfo.address,
      balance: ethers.formatUnits(balance, tokenInfo.decimals),
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
    };
  }

  private calculatePortfolioAnalytics(balances: TokenBalance[]): PortfolioAnalytics {
    const totalUsdValue = balances.reduce((sum, b) => sum + (b.usdValue || 0), 0);
    
    // Calculate top holdings
    const holdingsWithValue = balances
      .filter(b => b.usdValue && b.usdValue > 0)
      .map(b => ({
        symbol: b.symbol,
        usdValue: b.usdValue!,
        percentage: (b.usdValue! / totalUsdValue) * 100
      }))
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 5);

    // Calculate stablecoins value
    const stablecoins = ['USDC', 'USDT', 'EURC'];
    const stablecoinsValue = balances
      .filter(b => stablecoins.includes(b.symbol))
      .reduce((sum, b) => sum + (b.usdValue || 0), 0);

    return {
      totalUsdValue,
      topHoldings: holdingsWithValue,
      stablecoinsValue,
      stablecoinsPercentage: (stablecoinsValue / totalUsdValue) * 100
    };
  }

  public async getWalletData(walletAddress: string): Promise<WalletData | null> {
    const cacheKey = this.getCacheKey(walletAddress);
    const cachedData = await this.getCachedData<WalletData>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      // Get native token balance
      const balance = await this.provider.getBalance(walletAddress);
      const nativeTokenBalance: TokenBalance = {
        token: 'native',
        balance: ethers.formatEther(balance),
        symbol: 'S',
        decimals: 18,
      };

      // Get ERC20 token balances
      const tokenBalancePromises = Object.values(SONIC_TOKENS).map(tokenInfo => 
        this.getERC20Balance(tokenInfo, walletAddress)
      );
      
      const tokenBalances = await Promise.all(tokenBalancePromises);
      const allBalances = [nativeTokenBalance, ...tokenBalances];

      // Get token prices and calculate USD values
      const symbols = allBalances.map(b => b.symbol);
      const prices = await this.priceService.getTokenPrices(symbols);

      // Add price and USD value to balances
      allBalances.forEach(balance => {
        const price = prices.get(balance.symbol);
        if (price) {
          balance.priceUsd = price.usdPrice;
          balance.usdValue = parseFloat(balance.balance) * price.usdPrice;
        }
      });

      // Calculate portfolio analytics
      const analytics = this.calculatePortfolioAnalytics(allBalances);

      const walletData: WalletData = {
        balances: allBalances,
        totalUsdValue: analytics.totalUsdValue,
        analytics
      };

      await this.setCachedData(cacheKey, walletData);
      return walletData;
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      return null;
    }
  }

  public formatWalletDataForContext(walletData: WalletData | null): string {
    if (!walletData) return '';

    const balances = walletData.balances
      .map(b => `${b.symbol}: ${b.balance}${b.usdValue ? ` ($${b.usdValue.toFixed(2)})` : ''}`)
      .join(', ');

    const analytics = walletData.analytics;
    const topHoldings = analytics.topHoldings
      .map(h => `${h.symbol}: $${h.usdValue.toFixed(2)} (${h.percentage.toFixed(1)}%)`)
      .join(', ');

    return `Wallet balances: ${balances}. ` +
           `Total portfolio value: $${analytics.totalUsdValue.toFixed(2)}. ` +
           `Top holdings: ${topHoldings}. ` +
           `Stablecoins: $${analytics.stablecoinsValue.toFixed(2)} (${analytics.stablecoinsPercentage.toFixed(1)}%).`;
  }
} 