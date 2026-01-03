export async function connectTron() {
  if (!window.tronLink) {
    throw new Error("TronLink not installed");
  }
  await window.tronLink.request({ method: "tron_requestAccounts" });
}
