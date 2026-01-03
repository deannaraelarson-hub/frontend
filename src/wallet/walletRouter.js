export async function connectWallet() {
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);

  // 1️⃣ Desktop → EVM extensions
  if (!isMobile && window.ethereum) {
    const { openEvmModal } = await import("./evm/openEvmModal");
    return openEvmModal();
  }

  // 2️⃣ Mobile or no extension → WalletConnect
  if (isMobile || !window.ethereum) {
    const { openEvmModal } = await import("./evm/openEvmModal");
    return openEvmModal(); // ConnectKit auto-falls back to WC
  }

  throw new Error("No compatible wallet environment found");
}
