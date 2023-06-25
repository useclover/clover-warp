import { createClient, useAccount, WagmiConfig } from "wagmi";
import connectors from "../connectors";
import * as ethers from "ethers";
import { webSocketProvider, provider } from "../connectors/chains";

const client = createClient({
  autoConnect: true,
  connectors,
  webSocketProvider,
  provider,
});

const AuthProvider = ({ children }: { children: JSX.Element }) => {
  return <WagmiConfig client={client}>{children}</WagmiConfig>;
};

export default AuthProvider;
