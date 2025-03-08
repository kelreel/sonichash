import { Agent } from '@prisma/client';
import { writeFileSync } from 'fs';
import { OpenAI } from 'openai';
import { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
import { AuthUser } from '../middlewares/authMiddleware';
import { Action, ActionParams, ActionsService, ActionType } from './actionsService';
import { ContextBuilder } from './contextBuilder';
import { CONFIG } from '../config';

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
    action?: any;
  };
}

export class ChatService {
  private openai: OpenAI;
  private contextBuilder: ContextBuilder;
  private actionsService: ActionsService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: CONFIG.OPENAI_API_KEY
    });
    this.contextBuilder = new ContextBuilder();
    this.actionsService = new ActionsService();
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
    const messageContent = this.getTextContent(message);
    
    // Detect if the message contains an action
    const action = await this.actionsService.detectAction(messageContent);
    let actionContext = '';
    
    if (action) {
      actionContext = await this.actionsService.executeAction(action, agent, user);
      // console.log('*** actionContext', actionContext);
    }

    // If no action detected, proceed with normal chat response
    const systemContext = await this.contextBuilder.buildContext({
      agent,
      user: user || undefined,
      messageContent,
      actionContext
    });
    const messages = this.convertToOpenAIMessages([...previousMessages, message], systemContext);

    console.log('*** systemContext', systemContext);

    writeFileSync('messages-log--temp.json', JSON.stringify(messages, null, 2));

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
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