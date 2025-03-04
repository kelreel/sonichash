import { OpenAI } from 'openai';
import { Agent, User } from '@prisma/client';
import { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
import { AuthUser } from '../middlewares/authMiddleware';
import { ContextBuilder } from './contextBuilder';
import { ActionsService, Action, ActionResult, ActionType, ActionParams, Transaction } from './actionsService';
import { writeFileSync } from 'fs';

type InputMessage = {
  content: string | ChatCompletionContentPart[],
  role: "user" | "assistant" | "system"
}

export interface MessageContent {
  type: 'text' | 'image';
  text?: string;
  imageUrl?: string;
}

export interface ChatResponse {
  response: string;
  messages: InputMessage[];
  action?: {
    type: ActionType;
    params: ActionParams;
    transactions?: Transaction[];
  };
}

export class ChatService {
  private openai: OpenAI;
  private contextBuilder: ContextBuilder;
  private actionsService: ActionsService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.contextBuilder = new ContextBuilder();
    this.actionsService = new ActionsService();
  }

  private hasImageContent(messages: InputMessage[]): boolean {
    return messages.some(msg => {
      if (typeof msg.content === 'string') return false;
      return msg.content.some(part => part.type === 'image_url');
    });
  }

  private getTextContent(message: InputMessage): string {
    if (typeof message.content === 'string') {
      return message.content;
    }
    return message.content
      .map(part => part.type === "text" ? part.text || '' : '')
      .join('');
  }

  private convertMessageContent(content: string | ChatCompletionContentPart[]): ChatCompletionMessageParam['content'] {
    if (typeof content === 'string') {
      return content;
    }

    return content.map(part => {
      if (part.type === 'text') {
        return { type: 'text', text: part.text };
      } else if (part.type === 'image_url') {
        return {
          type: 'image_url',
          image_url: {
            url: part.image_url.url,
            detail: 'high'
          }
        };
      }
      return { type: 'text', text: '' };
    });
  }

  private convertToOpenAIMessages(
    messages: InputMessage[],
    systemContext: string
  ): ChatCompletionMessageParam[] {
    const convertedMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemContext }
    ];

    messages.forEach(msg => {
      const content = this.convertMessageContent(msg.content);
      convertedMessages.push({
        role: msg.role,
        content
      } as ChatCompletionMessageParam);
    });

    return convertedMessages;
  }

  public async validateAccess(agent: Agent, user?: AuthUser): Promise<boolean> {
    if (agent.mode === "PRIVATE" && agent.userId !== user?.id) {
      return false;
    }
    return true;
  }

  private async detectAction(message: string): Promise<Action | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an action detector. Analyze the user's message and determine if it contains any crypto-related actions.
            If an action is detected, return a JSON object with the following structure:
            {
              "type": "SWAP_TOKENS" | "SEND_TOKENS" | "GET_BALANCE" | "GET_PRICE",
              "params": {
                // Parameters specific to the action type
              }
            }
            If no action is detected, return null.
            
            Example actions:
            - "Swap 100 USDT to ETH" -> {"type": "SWAP_TOKENS", "params": {"fromToken": "USDT", "toToken": "ETH", "amount": "100"}}
            - "Send 50 ETH to 0x123..." -> {"type": "SEND_TOKENS", "params": {"token": "ETH", "to": "0x123...", "amount": "50"}}
            - "Check my ETH balance" -> {"type": "GET_BALANCE", "params": {"token": "ETH", "address": "0x..."}}
            - "What's the price of BTC?" -> {"type": "GET_PRICE", "params": {"token": "BTC"}}`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || 'null');
      return response === null ? null : response as Action;
    } catch (error) {
      console.error('Error detecting action:', error);
      return null;
    }
  }

  public async generateResponse(
    agent: Agent,
    message: InputMessage,
    previousMessages: InputMessage[] = [],
    user: AuthUser | null
  ): Promise<ChatResponse> {
    const messageContent = this.getTextContent(message);
    
    // Detect if the message contains an action
    const action = await this.detectAction(messageContent);
    
    if (action) {
      // Execute the action if user is authenticated
      if (!user) {
        return {
          response: "Please authenticate to perform this action.",
          messages: [...previousMessages, message]
        };
      }

      const result = await this.actionsService.executeAction(action, agent, user);
      
      if (!result.success) {
        return {
          response: `Action failed: ${result.error}`,
          messages: [...previousMessages, message]
        };
      }

      return {
        response: `Action prepared: ${result.data.message}. Please review and sign the transactions.`,
        messages: [...previousMessages, message],
        action: {
          ...action,
          transactions: result.transactions
        }
      };
    }

    // If no action detected, proceed with normal chat response
    const systemContext = await this.contextBuilder.buildContext({
      agent,
      user: user || undefined,
      messageContent,
    });
    const messages = this.convertToOpenAIMessages([...previousMessages, message], systemContext);

    writeFileSync('messages-log--temp.json', JSON.stringify(messages, null, 2));

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || "I apologize, but I couldn't generate a response.";

    return {
      response,
      messages: [...previousMessages, message]
    };
  }
} 