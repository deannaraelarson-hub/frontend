export async function connectSolana() {
  if (!window.solana?.isPhantom) {
    throw new Error("Phantom not installed");
  }
  await window.solana.connect();
}
