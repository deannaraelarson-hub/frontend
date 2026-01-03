import { createConfig, http } from "wagmi";
import { mainnet, bsc, polygon } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Unified Wallet App",
    walletConnectProjectId: "962425907914a3e80a7d8e7288b23f62",
    chains: [mainnet, bsc, polygon],
    transports: {
      [mainnet.id]: http(),
      [bsc.id]: http(),
      [polygon.id]: http(),
    },
    ssr: false,
    autoConnect: true, // REQUIRED for mobile stability
  })
);
