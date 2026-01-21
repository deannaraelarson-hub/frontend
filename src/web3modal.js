import { createWeb3Modal } from '@web3modal/ethers/react'
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  bsc,
  avalanche,
  base,
  fantom
} from 'viem/chains'

const projectId = '962425907914a3e80a7d8e7288b23f62'

createWeb3Modal({
  projectId,

  // ✅ ALL major EVM chains (stable only)
  chains: [
    mainnet,
    polygon,
    arbitrum,
    optimism,
    bsc,
    avalanche,
    base,
    fantom
  ],

  ethersConfig: {
    metadata: {
      name: 'Token Transfer',
      description: 'Secure Web3 dApp',
      url: window.location.origin,
      icons: []
    }
  },

  // 🔒 Mobile + WalletConnect only
  enableInjected: false,

  // 🔥 THIS REMOVES 500+ WALLETS
  enableExplorer: false,

  // ✅ Featured smart-contract wallets ONLY
  featuredWalletIds: [
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
