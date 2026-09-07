import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './AuthLayout.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = location.state?.justRegistered

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
    remember: true,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'

    if (!formData.password) newErrors.password = 'Password is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      // No API yet — this is where the sign-in request will go.
      console.log('Login:', formData)
      await new Promise(resolve => setTimeout(resolve, 900))

      // Send the signed-in user to their livestock dashboard.
      navigate('/dashboard')
    } catch (err) {
      setErrors({ submit: 'Invalid email or password.' })
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Google OAuth would be implemented here.
    console.log('Google Sign-In clicked')
    alert('Google Sign-In integration coming soon!')
  }

  return (
    <div className="auth-page">
      <Navbar
        actions={<Link to="/register" className="site-nav-textlink">New here? Create account</Link>}
      />

      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to manage your livestock ledger</p>
          </div>

          {justRegistered && (
            <div className="auth-success-banner">Account created — sign in to continue.</div>
          )}
          {errors.submit && <div className="auth-error-banner">{errors.submit}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`auth-input ${errors.email ? 'error' : ''}`}
                placeholder="you@farm.com"
              />
              {errors.email && <span className="auth-error-text">{errors.email}</span>}
            </div>

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <span className="auth-error-text">{errors.password}</span>}
            </div>

            <div className="auth-row-between">
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                Remember me
              </label>
              <a href="#" className="auth-forgot">Forgot password?</a>
            </div>

            <button type="submit" disabled={isLoading} className="auth-btn-primary">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or sign in with</span>
          </div>

          <button onClick={handleGoogleSignIn} className="auth-btn-google">
            <svg className="auth-google-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage