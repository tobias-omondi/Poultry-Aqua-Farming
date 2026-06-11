import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { setAuthToken } from './api'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider >
      <App/>
    </ThemeProvider>
  </React.StrictMode>,
)

// Initialize auth header if token exists
const existingToken = localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token')
if (existingToken) setAuthToken(existingToken)
