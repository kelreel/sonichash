import { Agent } from '@prisma/client';
import OpenAI from 'openai';
import { CONFIG } from '../config';
import { AuthUser } from '../middlewares/authMiddleware';
import axios from 'axios';
import { AlloraPredictResponse } from '../types/allora-predict';
import NodeCache from 'node-cache';

export type ActionType = 'PREDICT_PRICE'

export interface PredictPriceParams {
  ticker: string;
  timeframe: string;
}

export type ActionParams = PredictPriceParams;

export interface Action {
  type: ActionType;
  params: ActionParams;
}

const ACTION_LIST = [
  {
    type: 'PREDICT_PRICE',
    examples: [
      'predict price of BTC in 5 minutes -> {"type": "PREDICT_PRICE", "params": {"ticker": "BTC", "timeframe": "5m"}}',
      'ETH (Ethereum) price in 1 hour -> {"type": "PREDICT_PRICE", "params": {"ticker": "ETH", "timeframe": "1h"}}',
      'the price of a Solana (SOL) in an 8 hours -> {"type": "PREDICT_PRICE", "params": {"ticker": "SOL", "timeframe": "8h"}}',
    ],
    description: 'Predict the price of a cryptocurrency in a given timeframe. The ticker is the symbol of the cryptocurrency. Timeframe can be 5m or 8 hour only.'
  }
]

const cache = new NodeCache({ stdTTL: 60 });

export class ActionsService {
  private openai: OpenAI;
  private cache: NodeCache;

  constructor () {
    this.openai = new OpenAI({
      apiKey: CONFIG.OPENAI_API_KEY
    });
    this.cache = cache;
  }

  async detectAction(message: string): Promise<Action | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an action detector. Analyze the user's message and determine if it contains any related actions.
            If an action is detected, return a JSON object with the following structure as example:
            {
              "type": "PREDICT_PRICE",
              "params": {
                // Parameters specific to the action type
              }
            }
            If no action is detected, return null (it's important!).
            
            Example actions:
            ${ACTION_LIST.map(action => `${action.description}\nExamples:\n${action.examples.join('\n')}`).join('\n\n')}`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      try {
        const content = completion.choices[0].message.content || 'null';
        const response = JSON.parse(content);

        if (response !== null && (!response.type || !response.params)) {
          return null;
        }

        console.log('*** response', response);

        if (ACTION_LIST.some(action => action.type === response.type)) {
          return response;
        }
        
        return null;
      } catch (parseError) {
        console.error('Error parsing action response:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error detecting action:', error);
      return null;
    }
  }

  async executeAction(
    action: Action,
    agent: Agent,
    user: AuthUser | null
  ): Promise<string> {
    try {
      switch (action.type) {
        case 'PREDICT_PRICE':
          return await this.predictPrice(action.params as PredictPriceParams, agent);
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return ''};
    }

  private async predictPrice(
    params: PredictPriceParams,
    agent: Agent,
  ): Promise<string> {
    try {
      if (!['btc', 'eth', 'sol'].includes(params.ticker.toLowerCase())) {
        return `❌ Price prediction is not available for **${params.ticker}**.\nOnly BTC, ETH and SOL are supported.`;
      }

      if (params.timeframe.toLowerCase() !== '5m' && params.timeframe.toLowerCase() !== '8h') {
        return `❌ Price prediction timeframe **${params.timeframe}** is not supported.\nOnly 5 minutes and 8 hours are supported.`;
      }
      
      const cacheKey = `price_prediction_${params.ticker}_${params.timeframe}`;
      const cachedPrediction = this.cache.get(cacheKey);
      
      if (cachedPrediction) {
        return `🔮 Price prediction for **${params.ticker}** (${params.timeframe}):\n\`${cachedPrediction}\` (cached)`;
      }

      const data = await axios.get<AlloraPredictResponse>(`https://api.upshot.xyz/v2/allora/consumer/price/ethereum-11155111/${params.ticker.toLowerCase()}/${params.timeframe.toLowerCase()}`, {
        headers: {
          'x-api-key': CONFIG.ALLORA_API_KEY
        }
      });
      
      const prediction = data.data.data.inference_data.network_inference_normalized;
      this.cache.set(cacheKey, prediction);

      return `🔮 Price prediction for **${params.ticker}** (${params.timeframe}):\n\`${prediction}\``;
    } catch (error) {
      return `❌ Error predicting price for **${params.ticker}** in ${params.timeframe}`;
    }
  }
}