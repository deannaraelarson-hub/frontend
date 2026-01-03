import { useAccount, useBalance, useChainId } from "wagmi";
import { mainnet, bsc, polygon } from "wagmi/chains";

const CHAINS = {
  [mainnet.id]: mainnet,
  [bsc.id]: bsc,
  [polygon.id]: polygon,
};

export default function WalletInfo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { data, isLoading } = useBalance({
    address,
    chainId,
    watch: true, // LIVE updates
    enabled: !!address,
  });

  if (!isConnected) return null;

  return (
    <div>
      <div>Address: {address}</div>
      <div>Network: {CHAINS[chainId]?.name}</div>
      <div>
        Balance: {isLoading ? "Loading…" : `${data.formatted} ${data.symbol}`}
      </div>
    </div>
  );
}
