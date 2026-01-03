import { useAccount, useBalance, useChainId } from "wagmi";
import { mainnet, bsc, polygon } from "wagmi/chains";

const CHAINS = [mainnet, bsc, polygon];

export default function WalletInfo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { data: balance } = useBalance({
    address,
    enabled: !!address,
  });

  if (!isConnected) return null;

  const chain = CHAINS.find((c) => c.id === chainId);

  return (
    <div style={{ marginTop: "20px" }}>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Network:</strong> {chain?.name || "Unknown"}</p>
      <p>
        <strong>Balance:</strong>{" "}
        {balance
          ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
          : "Loading..."}
      </p>
    </div>
  );
}
