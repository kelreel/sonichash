import { ethers } from 'ethers';
import { Agent, User } from '@prisma/client';
import { AuthUser } from '../middlewares/authMiddleware';

export type ActionType = 'SWAP_TOKENS' | 'SEND_TOKENS' | 'GET_BALANCE' | 'GET_PRICE';

export interface Transaction {
  to: string;
  data: string;
  value?: string;
  description: string;
}

export interface SwapTokensParams {
  fromToken: string;
  toToken: string;
  amount: string;
  transactions: Transaction[];
}

export interface SendTokensParams {
  token: string;
  to: string;
  amount: string;
  transaction: Transaction;
}

export interface GetBalanceParams {
  token: string;
  address: string;
}

export interface GetPriceParams {
  token: string;
}

export type ActionParams = SwapTokensParams | SendTokensParams | GetBalanceParams | GetPriceParams;

export interface Action {
  type: ActionType;
  params: ActionParams;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  transactions?: Transaction[];
}

export class ActionsService {
  private provider: ethers.Provider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }

  public async executeAction(
    action: Action,
    agent: Agent,
    user: AuthUser
  ): Promise<ActionResult> {
    try {
      switch (action.type) {
        case 'SWAP_TOKENS':
          return await this.swapTokens(action.params as SwapTokensParams, agent, user);
        case 'SEND_TOKENS':
          return await this.sendTokens(action.params as SendTokensParams, agent, user);
        case 'GET_BALANCE':
          return await this.getBalance(action.params as GetBalanceParams, agent, user);
        case 'GET_PRICE':
          return await this.getPrice(action.params as GetPriceParams);
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async swapTokens(
    params: SwapTokensParams,
    agent: Agent,
    user: AuthUser
  ): Promise<ActionResult> {
    // Here we would prepare the transactions for the swap
    // For example, a typical DEX swap might require:
    // 1. Approve token spending
    // 2. Execute swap
    const transactions: Transaction[] = [
      {
        to: params.fromToken, // Token contract address
        data: "0x095ea7b3000000000000000000000000...", // approve(address,uint256) encoded data
        description: "Approve token spending for swap"
      },
      {
        to: "0x...", // DEX router address
        data: "0x38ed1739000000000000000000000000...", // swapExactTokensForTokens encoded data
        description: "Execute token swap"
      }
    ];

    return {
      success: true,
      data: { 
        message: 'Swap transactions prepared',
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount
      },
      transactions
    };
  }

  private async sendTokens(
    params: SendTokensParams,
    agent: Agent,
    user: AuthUser
  ): Promise<ActionResult> {
    // Prepare the transaction for token transfer
    const transaction: Transaction = {
      to: params.token, // Token contract address
      data: "0xa9059cbb000000000000000000000000...", // transfer(address,uint256) encoded data
      description: `Send ${params.amount} ${params.token} to ${params.to}`
    };

    return {
      success: true,
      data: { 
        message: 'Transfer transaction prepared',
        token: params.token,
        to: params.to,
        amount: params.amount
      },
      transactions: [transaction]
    };
  }

  private async getBalance(
    params: GetBalanceParams,
    agent: Agent,
    user: AuthUser
  ): Promise<ActionResult> {
    // This is a read-only operation, no transactions needed
    return {
      success: true,
      data: { balance: '0' }
    };
  }

  private async getPrice(
    params: GetPriceParams
  ): Promise<ActionResult> {
    // This is a read-only operation, no transactions needed
    return {
      success: true,
      data: { price: '0' }
    };
  }
} 