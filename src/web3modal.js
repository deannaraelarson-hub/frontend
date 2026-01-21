import { createWeb3Modal } from '@web3modal/ethers'
import { mainnet, polygon, bsc, arbitrum } from 'viem/chains'

const projectId = '962425907914a3e80a7d8e7288b23f62'

createWeb3Modal({
  ethersConfig: {
    metadata: {
      name: 'Token Transfer',
      description: 'Secure token transfer dApp',
      url: 'https://yourdomain.com',
      icons: ['https://yourdomain.com/icon.png']
    }
  },

  chains: [mainnet, polygon, bsc, arbitrum],
  projectId,

  // 🔒 Only real wallets (NO exchanges)
  explorerExcludedWalletIds: 'ALL',
  explorerRecommendedWalletIds: [
    'metamask',
    'trust',
    'coinbase',
    'rainbow',
    'zerion',
    'okxwallet',
    'bitkeep',
    'tokenpocket',
    'phantom',
    'mathwallet',
    'safe'
  ]
})
