import { ConnectKitButton } from "connectkit";

export default function ConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ show }) => (
        <button
          onClick={show}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            background: "#000",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
