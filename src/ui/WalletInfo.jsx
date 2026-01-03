import { useAccount, useBalance, useNetwork } from "wagmi";

export default function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const { data: balance } = useBalance({
    address,
    watch: true
  });

  if (!isConnected) return null;

  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        background: "#f4f4f4",
        maxWidth: 420
      }}
    >
      <div><strong>Address:</strong> {address}</div>
      <div><strong>Network:</strong> {chain?.name}</div>
      <div>
        <strong>Balance:</strong>{" "}
        {balance?.formatted} {balance?.symbol}
      </div>
    </div>
  );
}
