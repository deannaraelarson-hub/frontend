import { WagmiConfig, createConfig } from "wagmi";
import { mainnet, bsc, polygon } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import ConnectButton from "./ui/ConnectButton";

const config = createConfig(
  getDefaultConfig({
    appName: "Unified Wallet App",
    walletConnectProjectId: "962425907914a3e80a7d8e7288b23f62",
    chains: [mainnet, bsc, polygon],
    ssr: false,
    autoConnect: false, // CRITICAL: prevents MetaMask auto-open
  })
);

export default function App() {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider
        mode="light"
        options={{
          enforceSupportedChains: false,
          hideNoWalletCTA: false,
        }}
      >
        <ConnectButton />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
