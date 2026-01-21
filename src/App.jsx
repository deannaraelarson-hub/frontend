import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract } from 'ethers'


export default function App() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useWeb3ModalAccount()

  const connectWallet = () => open()

  const sendToken = async () => {
    if (!window.ethereum) return alert('Wallet not found')

    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const token = new Contract(
      '0xTOKEN_ADDRESS',
      [
        'function transfer(address to, uint256 amount) returns (bool)'
      ],
      signer
    )

    const tx = await token.transfer(
      '0xRECEIVER_ADDRESS',
      BigInt(1e18)
    )

    await fetch('/api/tx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: tx.hash,
        from: address
      })
    })

    await tx.wait()
    alert('Transfer successful')
  }

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {address}</p>
          <button onClick={sendToken}>Send Token</button>
        </>
      )}
    </div>
  )
}

