import React from 'react'
import ReactDOM from 'react-dom/client'

// 🔥 MUST BE FIRST — side-effect init
import './web3modal'

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
