import React from 'react'
import ReactDOM from 'react-dom/client'

// MUST run before hooks
import './web3modal'

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
