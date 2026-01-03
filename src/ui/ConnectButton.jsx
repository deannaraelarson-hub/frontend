import { ConnectKitButton } from "connectkit";

export default function ConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ show }) => (
        <button onClick={show}>
          Connect Wallet
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
