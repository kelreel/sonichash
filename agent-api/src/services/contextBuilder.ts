import { Agent } from '@prisma/client';
import { AuthUser } from '../middlewares/authMiddleware';
import { CryptoDataService } from './cryptoDataService';
import { PriceService } from './priceService';

export interface ContextData {
  agent: Agent;
  user?: AuthUser;
  messageContent: string;
  actionContext?: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export class ContextBuilder {
  private cryptoDataService: CryptoDataService;
  private priceService: PriceService;
  private readonly priceKeywords = [
    'buy', 'sell', 'trade', 'price', 'pricing', 'dollars',
    'position', 'portfolio', 'portfolios', 'leverage', 'margin',
    'margin used', 'unrealized', 'pnl', 'liquidation', 'entry price',
    'size', 'usd value', 'max leverage', 'funding', 'short', 'long',
    'btc', 'eth', 'цена', 'asset', '$'
  ];

  private readonly walletKeywords = [
    'balance', 'balances', 'wallet', 'holdings', 'tokens',
    'portfolio', 'assets', 'funds', 'deposit', 'withdraw'
  ];

  constructor() {
    this.cryptoDataService = new CryptoDataService();
    this.priceService = new PriceService();
  }

  private hasTradeKeywords(textContent: string): boolean {
    return this.priceKeywords.some(keyword => 
      textContent.toLowerCase().includes(keyword)
    );
  }

  private hasWalletKeywords(textContent: string): boolean {
    return this.walletKeywords.some(keyword => 
      textContent.toLowerCase().includes(keyword)
    );
  }

  private buildAgentContext(agent: Agent): string {
    const lores = agent.lore?.split('\n').filter(Boolean) || [];
    const selectedLores = lores.sort(() => Math.random() - 0.5).slice(0, 3);

    const bio = agent.bio?.split('\n').filter(Boolean) || [];
    const selectedBio = bio.sort(() => Math.random() - 0.5).slice(0, 3);

    const loreResult = selectedLores.length ? `Lore: ${selectedLores.join('. ')}.` : '';
    const bioResult = selectedBio.length ? `Biography: ${selectedBio.join('. ')}.` : '';

    return `${loreResult} ${bioResult}`.trim();
  }

  private async buildUserContext(messageContent: string, user?: AuthUser): Promise<string> {
    if (!user) return '';

    let context = `User wallet address: ${user.walletAddress}`;

    // Add wallet data if user asks about balances
    if (this.hasWalletKeywords(messageContent)) {
      const walletData = await this.cryptoDataService.getWalletData(user.walletAddress);
      if (walletData) {
        context += ` ${this.cryptoDataService.formatWalletDataForContext(walletData)}`;
      }
    }

    // Add price data if user asks about prices
    if (this.hasTradeKeywords(messageContent)) {
      const prices = await this.priceService.getTokenPrices(['S', 'WETH', 'USDC', 'USDT', 'EURC']);
      const priceContext = Array.from(prices.entries())
        .map(([symbol, price]) => `${symbol}: $${price.usdPrice.toFixed(2)}`)
        .join(', ');
      context += ` Current prices: ${priceContext}.`;
    }

    return context;
  }

  private buildMessageHistory(previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>): string {
    if (!previousMessages?.length) return '';

    return previousMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  public async buildContext(data: ContextData): Promise<string> {
    const agentContext = this.buildAgentContext(data.agent);
    const userContext = await this.buildUserContext(data.messageContent, data.user);
    const messageHistory = this.buildMessageHistory(data.previousMessages);
    const actionContext = data.actionContext || '';
    const systemPrompt = data.agent.systemPrompt || '';
    const knowledge = data.agent.knowledge || '';
    const style = data.agent.chatStyle || '';

    return [
      `You are ${data.agent.name}. You were created by SonicHash user.`,
      `Roleplay and generate interesting dialogue on behalf of ${data.agent.name}.`,
      `Never use emojis or hashtags or cringe stuff like that. Never act like an assistant.`,
      agentContext,
      systemPrompt,
      knowledge,
      style,
      userContext,
      messageHistory,
      actionContext
    ].filter(Boolean).join('\n\n');
  }
} 