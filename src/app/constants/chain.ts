import { IChainData } from "../interfaces";

export const chainData: IChainData[] = [
  {
    name: "Ethereum Mainnet",
    chain: "ETH",
    icon: "ethereum",
    networkName: "mainnet",
    rpc: [
      "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
      "wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}",
      "https://api.mycryptoapi.com/eth",
      "https://cloudflare-eth.com",
      "https://ethereum-rpc.publicnode.com",
      "wss://ethereum-rpc.publicnode.com",
      "https://mainnet.gateway.tenderly.co",
      "wss://mainnet.gateway.tenderly.co",
      "https://rpc.blocknative.com/boost",
      "https://rpc.flashbots.net",
      "https://rpc.flashbots.net/fast",
      "https://rpc.mevblocker.io",
      "https://rpc.mevblocker.io/fast",
      "https://rpc.mevblocker.io/noreverts",
      "https://rpc.mevblocker.io/fullprivacy",
      "https://eth.drpc.org",
      "wss://eth.drpc.org",
    ],
    features: [
      {
        name: "EIP155",
      },
      {
        name: "EIP1559",
      },
    ],
    faucets: [],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    infoURL: "https://ethereum.org",
    shortName: "eth",
    chainId: 1,
    networkId: 1,
    slip44: 60,
    explorers: [
      {
        name: "etherscan",
        url: "https://etherscan.io",
        standard: "EIP3091",
      },
      {
        name: "blockscout",
        url: "https://eth.blockscout.com",
        icon: "blockscout",
        standard: "EIP3091",
      },
      {
        name: "dexguru",
        url: "https://ethereum.dex.guru",
        icon: "dexguru",
        standard: "EIP3091",
      },
    ],
  },
  {
    name: "BNB Smart Chain Mainnet",
    chain: "BSC",
    networkName: "bnb",
    rpc: [
      "https://bsc-dataseed1.bnbchain.org",
      "https://bsc-dataseed2.bnbchain.org",
      "https://bsc-dataseed3.bnbchain.org",
      "https://bsc-dataseed4.bnbchain.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
      "https://bsc-rpc.publicnode.com",
      "wss://bsc-rpc.publicnode.com",
      "wss://bsc-ws-node.nariox.org",
    ],
    faucets: [],
    nativeCurrency: {
      name: "BNB Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    infoURL: "https://www.bnbchain.org/en",
    shortName: "bnb",
    chainId: 56,
    networkId: 56,
    slip44: 714,
    explorers: [
      {
        name: "bscscan",
        url: "https://bscscan.com",
        standard: "EIP3091",
      },
      {
        name: "dexguru",
        url: "https://bnb.dex.guru",
        icon: "dexguru",
        standard: "EIP3091",
      },
    ],
  },
  {
    name: "BNB Smart Chain Testnet",
    chain: "BSC",
    networkName: "bnbt",
    rpc: [
      "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      "https://data-seed-prebsc-2-s1.bnbchain.org:8545",
      "https://data-seed-prebsc-1-s2.bnbchain.org:8545",
      "https://data-seed-prebsc-2-s2.bnbchain.org:8545",
      "https://data-seed-prebsc-1-s3.bnbchain.org:8545",
      "https://data-seed-prebsc-2-s3.bnbchain.org:8545",
      "https://bsc-testnet-rpc.publicnode.com",
      "wss://bsc-testnet-rpc.publicnode.com",
    ],
    faucets: ["https://testnet.bnbchain.org/faucet-smart"],
    nativeCurrency: {
      name: "BNB Chain Native Token",
      symbol: "tBNB",
      decimals: 18,
    },
    infoURL: "https://www.bnbchain.org/en",
    shortName: "bnbt",
    chainId: 97,
    networkId: 97,
    slip44: 1,
    explorers: [
      {
        name: "bscscan-testnet",
        url: "https://testnet.bscscan.com",
        standard: "EIP3091",
      },
    ],
  },
  {
    name: "Sepolia",
    title: "Ethereum Testnet Sepolia",
    chain: "ETH",
    networkName: "sepolia",
    rpc: [
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org",
      "https://rpc-sepolia.rockx.com",
      "https://rpc.sepolia.ethpandaops.io",
      "https://sepolia.infura.io/v3/${INFURA_API_KEY}",
      "wss://sepolia.infura.io/v3/${INFURA_API_KEY}",
      "https://sepolia.gateway.tenderly.co",
      "wss://sepolia.gateway.tenderly.co",
      "https://ethereum-sepolia-rpc.publicnode.com",
      "wss://ethereum-sepolia-rpc.publicnode.com",
      "https://sepolia.drpc.org",
      "wss://sepolia.drpc.org",
      "https://rpc-sepolia.rockx.com",
    ],
    faucets: ["http://fauceth.komputing.org?chain=11155111&address=${ADDRESS}"],
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    infoURL: "https://sepolia.otterscan.io",
    shortName: "sep",
    chainId: 11155111,
    networkId: 11155111,
    slip44: 1,
    explorers: [
      {
        name: "etherscan-sepolia",
        url: "https://sepolia.etherscan.io",
        standard: "EIP3091",
      },
      {
        name: "otterscan-sepolia",
        url: "https://sepolia.otterscan.io",
        standard: "EIP3091",
      },
    ],
  },
  {
    name: "Polygon Amoy",
    title: "Polygon Testnet Amoy",
    chain: "Polygon",
    rpc: [
      "wss://polygon-amoy-bor-rpc.publicnode.com",
      "wss://polygon-amoy-bor-rpc.publicnode.com	",
    ],
    faucets: [],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    infoURL: "<https://polygon.technology/>",
    shortName: "maticmum",
    chainId: 80002,
    networkId: 80002,
    slip44: 1,
    explorers: [],
    networkName: "matic-amoy",
  },
];
