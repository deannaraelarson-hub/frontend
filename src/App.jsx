import { WagmiConfig, createConfig } from "wagmi";
import { mainnet, bsc, polygon } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import ConnectButton from "./ui/ConnectButton";
import WalletInfo from "./ui/WalletInfo";

const config = createConfig(
  getDefaultConfig({
    appName: "Unified Wallet App",
    walletConnectProjectId: "962425907914a3e80a7d8e7288b23f62",
    chains: [mainnet, bsc, polygon],
    ssr: false // VERY IMPORTANT for Vite
  })
);

export default function App() {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider
        theme="soft"
        mode="light"
        options={{
          hideBalance: false,
          hideTooltips: false,
          enforceSupportedChains: true
        }}
      >
        <ConnectButton />
        <WalletInfo />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
