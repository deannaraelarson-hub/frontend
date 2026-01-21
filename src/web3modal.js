import { createWeb3Modal, defaultConfig } from '@web3modal/ethereum'
import { mainnet, polygon, bsc, arbitrum } from 'viem/chains'

const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'

const metadata = {
  name: 'Token Transfer',
  description: 'Multi-chain smart contract transfers',
  url: 'https://yourdomain.com',
  icons: ['https://yourdomain.com/icon.png']
}

/**
 * 🔒 EOA-ONLY FILTER
 * These wallet IDs are NON-EXCHANGE wallets
 * (MetaMask, Trust, Coinbase Wallet, Rainbow, OKX Wallet, etc.)
 */
const allowedWallets = [
  'metamask',
  'trust',
  'coinbase',
  'rainbow',
  'zerion',
  'imtoken',
  'tokenpocket',
  'okxwallet',
  'bitkeep',
  'safe',
  'mathwallet',
  'phantom',
  'taho',
  'frame'
]

export const ethersConfig = defaultConfig({
  metadata,
  defaultChainId: 1,
  enableEIP6963: true,
  enableInjected: true,
  enableWalletConnect: true
})

createWeb3Modal({
  ethersConfig,
  projectId,
  chains: [mainnet, polygon, bsc, arbitrum],
  walletConnectVersion: 2,

  explorerRecommendedWalletIds: allowedWallets,
  explorerExcludedWalletIds: 'ALL', // ⛔ excludes exchanges & junk
  enableAnalytics: false
})
