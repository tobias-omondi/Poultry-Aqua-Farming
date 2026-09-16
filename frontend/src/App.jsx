import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Batches from './pages/Batches'
import Financials from './pages/Financials'
import Inventory from './pages/Inventory'
import Housing from './pages/Housing'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import Notifications from './pages/Notifications'

function hasAuthToken() {
  return Boolean(localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token'))
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuthToken)

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(hasAuthToken())

    syncAuth()
    window.addEventListener('auth:change', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('auth:change', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full overflow-x-hidden flex" style={{ background: 'var(--bg-primary)' }}>
        {isAuthenticated ? <Sidebar /> : null}
        <main className={`flex-1 min-h-screen min-w-0 w-full overflow-x-hidden ${isAuthenticated ? 'md:ml-60' : 'ml-0'} px-3 py-4 pt-20 sm:px-4 md:p-6 lg:p-8 md:pt-6`}>
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
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <Notifications />
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
  if (!hasAuthToken()) return <Navigate to="/login" replace />
  return children
}

export default App