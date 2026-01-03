import { WagmiConfig } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { wagmiConfig } from "./wagmi";
import ConnectButton from "./ui/ConnectButton";
import WalletInfo from "./ui/WalletInfo";

// Add mobile-specific styling
import "./mobile-fix.css";

export default function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        options={{
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          // Mobile optimizations
          hideQuestionMarkCTA: true,
          hideTooltips: true,
          walletConnectCTA: "link",
          disclaimer: null,
          embedGoogleFonts: false,
          // Theme for better mobile visibility
          customTheme: {
            "--ck-font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            "--ck-border-radius": "12px",
          },
        }}
        theme="midnight" // Use a high-contrast theme for mobile
      >
        <div className="mobile-container">
          <ConnectButton />
          <WalletInfo />
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

