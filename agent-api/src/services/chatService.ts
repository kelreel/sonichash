import { OpenAI } from 'openai';
import { Agent, User } from '@prisma/client';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions.mjs';
import { AuthUser } from '../middlewares/authMiddleware';

type InputMessage = {
  content: ChatCompletionContentPart[],
  role: "user" | "assistant"
}

export interface MessageContent {
  type: 'text' | 'image';
  text?: string;
  imageUrl?: string;
}

export interface ChatResponse {
  response: string;
  messages: InputMessage[];
}

export class ChatService {
  private openai: OpenAI;
  private readonly priceKeywords = [
    'buy', 'sell', 'trade', 'price', 'pricing', 'dollars',
    'position', 'portfolio', 'portfolios', 'leverage', 'margin',
    'margin used', 'unrealized', 'pnl', 'liquidation', 'entry price',
    'size', 'usd value', 'max leverage', 'funding', 'short', 'long',
    'btc', 'eth', 'цена', 'asset', '$'
  ];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  private buildContext(agent: Agent): string {
    const lores = agent.lore?.split('\n').filter(Boolean) || [];
    const selectedLores = lores.sort(() => Math.random() - 0.5).slice(0, 3);

    const bio = agent.bio?.split('\n').filter(Boolean) || [];
    const selectedBio = bio.sort(() => Math.random() - 0.5).slice(0, 3);

    const loreResult = selectedLores.length ? `Lore: ${selectedLores.join('. ')}.` : '';
    const bioResult = selectedBio.length ? `Biography: ${selectedBio.join('. ')}.` : '';

    return `${loreResult} ${bioResult}`.trim();
  }

  private buildSystemPrompt(agent: Agent, context: string): string {
    return `You are ${agent.name}. You were created by SonicHash user. Roleplay and generate interesting dialogue on behalf of the ${agent.name}. Never use emojis or hashtags or cringe stuff like that. Never act like an assistant. \n ${context} \n. ${agent.systemPrompt || ''}`.trim();
  }

  private hasTradeKeywords(textContent: string): boolean {
    return this.priceKeywords.some(keyword => 
      textContent.toLowerCase().includes(keyword)
    );
  }

  private getTextContent(message: InputMessage): string {
    return message.content
      .map(part => part.type === "text" ? part.text || '' : '')
      .join('');
  }

  public async validateAccess(agent: Agent, user?: AuthUser): Promise<boolean> {
    if (agent.mode === "PRIVATE" && agent.userId !== user?.id) {
      return false;
    }
    return true;
  }

  public async generateResponse(
    agent: Agent,
    message: InputMessage,
    previousMessages: InputMessage[] = [],
    user: AuthUser | null
  ): Promise<ChatResponse> {
    const context = this.buildContext(agent);
    const textContent = this.getTextContent(message);
    let contextWithData = context;

    if (user) {
      contextWithData += `User wallet address: ${user.walletAddress}`;
    }

    if (this.hasTradeKeywords(textContent)) {
      // TODO: Add price data to context if needed
      // contextWithData += `User wallet address: ${user.walletAddress}`;
    }

    const systemPrompt = this.buildSystemPrompt(agent, contextWithData);

    // console.log(systemPrompt);

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: 'user',
            content: message.content
          }
        ],
        model: "gpt-4",
      });

      const response = completion.choices[0].message.content || '';

      return {
        response,
        messages: [
          ...previousMessages,
          message,
          { role: "assistant", content: [{ type: "text", text: response }] }
        ]
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error("Failed to get response from AI");
    }
  }
} 