import { OpenAI } from 'openai';
import { Agent, User } from '@prisma/client';
import { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
import { AuthUser } from '../middlewares/authMiddleware';
import { ContextBuilder } from './contextBuilder';
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
}

export class ChatService {
  private openai: OpenAI;
  private contextBuilder: ContextBuilder;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.contextBuilder = new ContextBuilder();
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

  public async generateResponse(
    agent: Agent,
    message: InputMessage,
    previousMessages: InputMessage[] = [],
    user: AuthUser | null
  ): Promise<ChatResponse> {
    const textContent = this.getTextContent(message);
    
    // Build system context without message history
    const systemContext = await this.contextBuilder.buildContext({
      agent,
      user: user || undefined,
      messageContent: textContent
    });

    // Combine all messages including the current one
    const allMessages = [...previousMessages, message];
    
    try {
      const messages = this.convertToOpenAIMessages(allMessages, systemContext);
      writeFileSync('allMessages.json', JSON.stringify(messages, null, 2));

      const hasImages = this.hasImageContent(allMessages);
      const model = hasImages ? "gpt-4o" : "gpt-4o-mini";

      const completion = await this.openai.chat.completions.create({
        messages,
        model,
      });

      const response = completion.choices[0].message.content || '';

      return {
        response,
        messages: [
          ...allMessages,
          { role: "assistant", content: response }
        ]
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error("Failed to get response from AI");
    }
  }
} 