import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './Register.css'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    farmName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) newErrors.username = 'Username is required'
    else if (formData.username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Only letters, numbers, and underscores allowed'

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'

    if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required'

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^(?:\+254|0)[17]\d{8}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid Kenyan phone number'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Map to the API's expected snake_case payload shape.
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.fullName.trim(),
        farm_name: formData.farmName.trim(),
        phone: formData.phone.trim(),
      }

      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let data = null
      try {
        data = await response.json()
      } catch {
        // No JSON body returned (e.g. 204 or empty response) — that's fine.
      }

      if (!response.ok) {
        // DRF typically returns { field_name: ["error message"] } on validation errors.
        if (data && typeof data === 'object') {
          const fieldErrors = {}
          Object.entries(data).forEach(([key, value]) => {
            const message = Array.isArray(value) ? value[0] : String(value)
            // Map API field names back to the form's field names.
            const fieldMap = { full_name: 'fullName', farm_name: 'farmName' }
            fieldErrors[fieldMap[key] || key] = message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ submit: 'Registration failed. Please try again.' })
        }
        setIsLoading(false)
        return
      }

      // Send the new user to sign in with their new credentials.
      navigate('/login', { state: { justRegistered: true, email: formData.email } })
    } catch (err) {
      setErrors({ submit: 'Could not reach the server. Check your connection and try again.' })
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
        actions={<Link to="/login" className="site-nav-textlink">Already registered? Sign in</Link>}
      />

      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join ChakFarm to manage your livestock with precision</p>
          </div>

          {errors.submit && <div className="auth-error-banner">{errors.submit}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="username" className="auth-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`auth-input ${errors.username ? 'error' : ''}`}
                placeholder="farmer1"
              />
              {errors.username && <span className="auth-error-text">{errors.username}</span>}
            </div>

            <div className="auth-form-group">
              <label htmlFor="fullName" className="auth-label">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`auth-input ${errors.fullName ? 'error' : ''}`}
                placeholder="John Kariuki"
              />
              {errors.fullName && <span className="auth-error-text">{errors.fullName}</span>}
            </div>

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
              <label htmlFor="farmName" className="auth-label">Farm Name</label>
              <input
                type="text"
                id="farmName"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                className={`auth-input ${errors.farmName ? 'error' : ''}`}
                placeholder="Green Valley Farm"
              />
              {errors.farmName && <span className="auth-error-text">{errors.farmName}</span>}
            </div>

            <div className="auth-form-group">
              <label htmlFor="phone" className="auth-label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`auth-input ${errors.phone ? 'error' : ''}`}
                placeholder="0712345678"
              />
              {errors.phone && <span className="auth-error-text">{errors.phone}</span>}
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
              <p className="auth-hint">At least 8 characters</p>
            </div>

            <div className="auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <span className="auth-error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" disabled={isLoading} className="auth-btn-primary">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or sign up with</span>
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
            Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register