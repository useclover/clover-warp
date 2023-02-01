import { configureChains, Chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

export const FileCoinWallaby: Chain = {
  id: 31415,
  name: "Filecoin Wallaby",
  network: "Wallaby",
  nativeCurrency: {
    name: "Filecoin",
    decimals: 18,
    symbol: "tFIL",
  },
  rpcUrls: {
    default: {
      http: ["https://wallaby.node.glif.io/rpc/v0"],
    },
    public: {
      http: ["https://wallaby.node.glif.io/rpc/v0"],
    },
  },
  blockExplorers: {
    default: {
      name: "wallaby",
      url: "https://explorer.glif.io/wallaby",
    },
  },
  testnet: true,
};

export const FileCoinHyperspace: Chain = {
  id: 3141,
  name: "Filecoin Hyperspace",
  network: "Hyperspace",
  nativeCurrency: {
    name: "Filecoin",
    decimals: 18,
    symbol: "tFIL",
  },
  rpcUrls: {
    default: {
      http: ["https://api.hyperspace.node.glif.io/rpc/v1"],
    },
    public: {
      http: ["https://api.hyperspace.node.glif.io/rpc/v1"],
    },
  },
  blockExplorers: {
    default: {
      name: "hyperspace",
      url: "https://hyperspace.filfox.info/en",
    },
  },
  testnet: true,
};

export const { chains, provider, webSocketProvider } = configureChains(
  [
    FileCoinWallaby,
    FileCoinHyperspace
  ],
  [
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain: Chain) => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);
