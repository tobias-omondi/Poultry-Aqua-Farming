import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout as apiLogout, setAuthToken } from '../api'

const LogoutPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Call backend logout if needed
    try {
      apiLogout()
    } catch (e) {
      // ignore
    }
    // Clear stored tokens and axios header
    localStorage.removeItem('ff_token')
    sessionStorage.removeItem('ff_token')
    setAuthToken(null)
    // Redirect to login
    navigate('/login', { replace: true })
  }, [navigate])

  return null
}

export default LogoutPage
