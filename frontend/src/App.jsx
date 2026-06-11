import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Batches from './pages/Batches'
import Financials from './pages/Financials'
import Inventory from './pages/Inventory'
import Housing from './pages/Housing'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'


function App() {
  const token = localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token')
  return (
    <BrowserRouter>
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex' }}>
        {/* Render Sidebar only when authenticated */}
        {token ? <Sidebar /> : null}
        <main style={{ flex: 1, marginLeft: token ? 240 : 0, padding: 32 }}>
          <Routes>
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/batches"
              element={
                <RequireAuth>
                  <Batches />
                </RequireAuth>
              }
            />
            <Route
              path="/financials"
              element={
                <RequireAuth>
                  <Financials />
                </RequireAuth>
              }
            />
            <Route
              path="/inventory"
              element={
                <RequireAuth>
                  <Inventory />
                </RequireAuth>
              }
            />
            <Route
              path="/housing"
              element={
                <RequireAuth>
                  <Housing />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default App