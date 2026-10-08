import './App.css'
import { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from './components/pages/LandingPage'
import LoginPage from './components/pages/LoginPage'
import Register from './components/pages/Register'
import Dashboard from './components/pages/Dashboard'
import Species from './components/pages/Species'
import Features from './components/pages/Features'
import Financials from './components/pages/Financials'
import AIAdvisor from './components/pages/AIAdvisor'
import Buyers from './components/pages/Buyers'

// Start every new page at the top
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/species" element={<Species />} />
        <Route path="/features" element={<Features />} />
        <Route path="/financials" element={<Financials />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        <Route path="/buyers" element={<Buyers />} />
      </Routes>
    </Router>
  )
}

export default App
