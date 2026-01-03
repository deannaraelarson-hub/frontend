import { useAccount, useBalance, useChainId } from "wagmi";
import { getChain } from "wagmi/chains";

export default function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();

  const { data: balance } = useBalance({
    address,
    watch: true
  });

  if (!isConnected) return null;

  const activeChain = chain ?? getChain(chainId);

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
      <div>
        <strong>Address:</strong> {address}
      </div>

      <div>
        <strong>Network:</strong> {activeChain?.name ?? "Unknown"}
      </div>

      <div>
        <strong>Balance:</strong>{" "}
        {balance?.formatted} {balance?.symbol}
      </div>
    </div>
  );
}
