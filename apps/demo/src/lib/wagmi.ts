import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { kiteMainnet, kiteTestnet } from "./kite-chain";

export const wagmiConfig = createConfig({
  chains: [kiteMainnet, kiteTestnet],
  connectors: [injected()],
  transports: {
    [kiteMainnet.id]: http(),
    [kiteTestnet.id]: http(),
  },
});
