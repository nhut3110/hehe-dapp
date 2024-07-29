interface ChainExplorer {
  name: string;
  url: string;
  standard: string;
  icon?: string;
}

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface IChainData {
  name: string;
  title?: string;
  icon?: string;
  chain: string;
  rpc: string[];
  features?: any;
  faucets: string[];
  nativeCurrency: NativeCurrency;
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44: number;
  explorers?: ChainExplorer[];
  networkName: string;
}
