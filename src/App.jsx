import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, formatEther } from 'ethers'
import { useEffect, useState } from 'react'

export default function App() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useWeb3ModalAccount()
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    const loadBalance = async () => {
      if (!address || !window.ethereum) return
      const provider = new BrowserProvider(window.ethereum)
      const bal = await provider.getBalance(address)
      setBalance(formatEther(bal))
    }

    loadBalance()
  }, [address])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #020617, #000)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div
        style={{
          width: 360,
          padding: 32,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08)'
        }}
      >
        {!isConnected ? (
          <>
            <h2 style={{ marginBottom: 8 }}>Connect your wallet</h2>
            <p style={{ opacity: 0.7, marginBottom: 24 }}>
              Use a Web3 wallet to interact with this dApp
            </p>

            <button
              onClick={() => open()}
              style={{
                width: '100%',
                padding: '14px 0',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff'
              }}
            >
              Connect Wallet
            </button>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: 12 }}>Wallet Connected</h3>

            <div
              style={{
                background: '#020617',
                padding: 12,
                borderRadius: 10,
                fontSize: 14,
                wordBreak: 'break-all',
                marginBottom: 12
              }}
            >
              {address}
            </div>

            {balance && (
              <p style={{ opacity: 0.85 }}>
                Balance: <strong>{Number(balance).toFixed(4)} ETH</strong>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
