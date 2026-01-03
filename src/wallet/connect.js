import { isMobile } from "./env";
import { connectEvm } from "./evm";
import { connectSolana } from "./solana";
import { connectTron } from "./tron";
import { connectTon } from "./ton";

export async function connectWallet() {
  if (isMobile()) {
    // Mobile → universal modal
    await connectEvm(true);
    return;
  }

  // Desktop → browser wallets
  if (window.ethereum) {
    await connectEvm(false);
    return;
  }

  if (window.solana?.isPhantom) {
    await connectSolana();
    return;
  }

  if (window.tronLink) {
    await connectTron();
    return;
  }

  alert("No supported wallet detected. Please install one.");
}
