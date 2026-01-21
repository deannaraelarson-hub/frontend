import { createWeb3Modal } from '@web3modal/ethers'
import { mainnet, polygon, bsc, arbitrum } from 'viem/chains'

const projectId = '962425907914a3e80a7d8e7288b23f62'

createWeb3Modal({
  projectId,

  chains: [mainnet, polygon, bsc, arbitrum],

  ethersConfig: {
    metadata: {
      name: 'Token Transfer',
      description: 'Secure token transfer dApp',
      url: window.location.origin,
      icons: []
    }
  },

  // 🔥 THIS is why popup was skipped
  enableInjected: false,

  // ✅ Only WalletConnect dApp wallets
  explorerExcludedWalletIds: 'ALL',
  explorerRecommendedWalletIds: [
    'metamask',
    'trust',
    'coinbase',
    'rainbow',
    'okxwallet',
    'tokenpocket',
    'bitget',
    'safe'
  ]
})
