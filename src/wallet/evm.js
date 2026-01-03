import { getAccount } from "wagmi/actions";

export async function connectEvm(isMobile) {
  if (isMobile) {
    // ConnectKit handles WalletConnect internally
    document.querySelector("button[data-connectkit]").click();
    return;
  }

  if (!window.ethereum) {
    throw new Error("No EVM wallet installed");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
}
