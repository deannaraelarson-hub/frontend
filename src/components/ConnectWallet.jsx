import { connectWallet } from "../wallet/walletRouter";

export default function ConnectWallet() {
  const handleClick = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <button onClick={handleClick}>
      Connect Wallet
    </button>
  );
}
