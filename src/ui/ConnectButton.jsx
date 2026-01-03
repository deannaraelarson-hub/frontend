import { ConnectKitButton } from "connectkit";

export default function ConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ show, isConnected }) => (
        <button
          onClick={show}
          style={{
            padding: "14px 30px",
            borderRadius: "16px",
            background: "#111",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {isConnected ? "Wallet Connected" : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
