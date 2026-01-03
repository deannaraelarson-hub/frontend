import { WagmiConfig } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { wagmiConfig } from "./wagmi";
import ConnectButton from "./ui/ConnectButton";
import WalletInfo from "./ui/WalletInfo";

export default function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        options={{
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
        }}
      >
        <ConnectButton />
        <WalletInfo />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
