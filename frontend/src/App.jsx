import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Batches from './pages/Batches'
import Financials from './pages/Financials'
import Inventory from './pages/Inventory'
import Housing from './pages/Housing'

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 240, padding: 32 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/financials" element={<Financials />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/housing" element={<Housing />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App