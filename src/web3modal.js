import { createWeb3Modal } from '@web3modal/ethers/react'
import { mainnet, polygon, bsc, arbitrum } from 'viem/chains'

const projectId = '962425907914a3e80a7d8e7288b23f62'

createWeb3Modal({
  projectId,

  chains: [mainnet, polygon, bsc, arbitrum],

  ethersConfig: {
    metadata: {
      name: 'Token Transfer',
      description: 'Secure Web3 dApp',
      url: window.location.origin,
      icons: []
    }
  },

  // ✅ Mobile works perfectly
  enableInjected: false,

  // ❌ Kill the public explorer list
  explorerExcludedWalletIds: 'ALL',

  // ✅ ONLY smart-contract capable wallets
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
