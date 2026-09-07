import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LandingPage from './components/pages/LandingPage'
import LoginPage from './components/pages/LoginPage'
import Register from './components/pages/Register'
import Dashboard from './components/pages/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App