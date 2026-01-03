import { TonConnectUI } from "@tonconnect/ui";

const ton = new TonConnectUI({
  manifestUrl: "https://yourdomain.com/tonconnect-manifest.json"
});

export async function connectTon() {
  await ton.connectWallet();
}
