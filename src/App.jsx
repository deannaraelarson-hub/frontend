import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react'

export default function App() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useWeb3ModalAccount()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#020617',
        color: '#fff'
      }}
    >
      {!isConnected ? (
        <button
          onClick={() => open()}
          style={{ padding: '14px 24px', fontSize: 16 }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected:</p>
          <p>{address}</p>
        </div>
      )}
    </div>
  )
}
