import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/react'
import { ethers } from 'ethers'
import './web3modal'

function App() {
  const { open } = useWeb3Modal()
  const { address, isConnected, chainId } = useWeb3ModalAccount()

  // 🔹 SMART CONTRACT EXECUTION
  const executeContract = async () => {
    if (!window.ethereum || !isConnected) return

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const contractAddress = '0xYOUR_CONTRACT'
    const abi = [
      'function transfer(address to, uint256 amount)'
    ]

    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const tx = await contract.transfer(
        '0x742d35Cc6634C0532925a3b844Bc9eE3a5d0889B',
        ethers.parseUnits('1', 18)
      )

      // 🔔 Notify backend
      await fetch('https://your-backend.com/api/tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: tx.hash,
          address,
          chainId
        })
      })

      alert('Transaction sent: ' + tx.hash)

    } catch (err) {
      console.error(err)
      alert('Transaction rejected')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px'
      }}>
        <h2>🚀 Token Transfer</h2>

        {/* ✅ SINGLE CONNECT BUTTON */}
        <button
          onClick={() => open()}
          style={{
            background: '#ef4444',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            color: '#fff',
            fontWeight: '600'
          }}
        >
          {isConnected
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : '🔗 Connect Wallet'}
        </button>
      </header>

      {isConnected && (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <button
            onClick={executeContract}
            style={{
              background: '#2563eb',
              padding: '16px 40px',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '18px'
            }}
          >
            ⚡ Execute Smart Contract
          </button>
        </div>
      )}
    </div>
  )
}

export default App
