import { connectWallet } from "../wallet/connect";

export default function ConnectButton() {
  return (
    <button
      onClick={connectWallet}
      style={{
        padding: "14px 24px",
        borderRadius: "10px",
        fontSize: "16px",
        cursor: "pointer"
      }}
    >
      Connect Wallet
    </button>
  );
}
