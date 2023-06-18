import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import connectors from "../connectors";
import * as ethers from "ethers";
import { webSocketPublicClient, publicClient, chains } from "../connectors/chains";

const client = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

const AuthProvider = ({ children }: { children: JSX.Element }) => {
  return <WagmiConfig config={client}>{children}</WagmiConfig>;
};

export default AuthProvider;
