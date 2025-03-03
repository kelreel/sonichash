export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export const SONIC_TOKENS: { [key: string]: TokenInfo } = {
  WS: {
    address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
    symbol: 'wS',
    name: 'Wrapped S',
    decimals: 18
  },
  WETH: {
    address: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18
  },
  USDC: {
    address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    symbol: 'USDC',
    name: 'USDC (Bridged)',
    decimals: 6
  },
  EURC: {
    address: '0xe715cba7b5ccb33790cebff1436809d36cb17e57',
    symbol: 'EURC',
    name: 'EURC (Bridged)',
    decimals: 6
  },
  USDT: {
    address: '0x6047828dc181963ba44974801ff68e538da5eaf9',
    symbol: 'USDT',
    name: 'USDT (Bridged)',
    decimals: 6
  }
}; 