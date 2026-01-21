import React from 'react'
import ReactDOM from 'react-dom/client'

import { initWeb3Modal } from './web3modal'
initWeb3Modal() // 🔥 GUARANTEED execution

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
