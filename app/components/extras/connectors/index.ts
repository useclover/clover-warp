import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { chains } from "./chains";


// export const supported = [
//   80001, 137, 43114, 43113, 10, 31415, 69, 1313161554, 1313161555, 42262, 42261,
//   25, 338,
// ];

const connectors = [
  new InjectedConnector({
    chains,
    options: {
      name: "Clover",
      shimDisconnect: true,
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
    },
  }),
];


export default connectors;
