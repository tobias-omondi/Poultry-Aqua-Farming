import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login, setAuthToken } from '../api'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    farm_name: '',
    phone: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // If already logged in, go to the dashboard
  useEffect(() => {
    const token = localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token')
    if (token) {
      setAuthToken(token)
      navigate('/')
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  // Turn Django's error object into one readable message
  const readError = (err) => {
    const data = err?.response?.data
    if (!data) return 'Could not reach the server. Please try again.'
    if (typeof data === 'string') return 'Something went wrong. Please try again.'
    const messages = Object.entries(data).map(([field, msg]) => {
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      return field === 'detail' || field === 'error' ? text : `${field}: ${text}`
    })
    return messages.join(' ')
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      setError('Please enter a username and a password.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      // 1. Create the account
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        farm_name: formData.farm_name,
        phone: formData.phone,
      })

      // 2. Log in straight away
      const res = await login({
        username: formData.username,
        password: formData.password,
      })
      const token = res.data.access
      if (!token) throw new Error('No token received')

      sessionStorage.setItem('ff_token', token)
      setAuthToken(token)
      window.dispatchEvent(new Event('auth:change'))
      navigate('/')
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(false)
    }
  }

  // Wheat stalks are made once, so they do not jump while typing
  const stalks = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        height: 60 + Math.random() * 200,
        opacity: 0.25 + Math.random() * 0.4,
        duration: 2.5 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    []
  )

  const inputClass =
    'w-full h-12 pl-4 pr-4 bg-white border border-[#DDD5C4] rounded-xl text-sm text-[#1C1A14] placeholder-[#DDD5C4] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10 transition-all'
  const labelClass = 'text-[11px] font-semibold uppercase tracking-widest text-[#2E2B22]'

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen flex bg-[#1C1A14] w-full">

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-end p-12 xl:p-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 80%, rgba(74,124,89,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 20%, rgba(201,168,76,0.15) 0%, transparent 55%), #2E2B22',
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-[5px] px-4" style={{ height: 280 }}>
          {stalks.map((s, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: s.height,
                opacity: s.opacity,
                background: 'linear-gradient(to top, #C9A84C, transparent)',
                transformOrigin: 'bottom center',
                animation: `sway ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-[#4A7C59] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M12 2C9 7 4 8 4 14a8 8 0 0016 0c0-6-5-7-8-12z" fill="#7DB87F" />
                <path d="M12 8v10M9 13l3 2 3-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span
              className="text-[#F5F0E8] text-xl font-bold tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ChakFarm
            </span>
          </div>

          <h1
            className="text-[#F5F0E8] text-4xl xl:text-5xl font-medium leading-tight mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your farm,<br />
            <span className="text-[#7DB87F]">your records,</span><br />
            your account.
          </h1>

          <p className="text-[#A89F8C] text-[15px] font-light leading-relaxed max-w-sm">
            Create your own ChakFarm account. Everything you add stays private to you,
            from chicken batches to egg sales.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 bg-[#F5F0E8] flex items-center justify-center px-6 py-14 lg:px-10 xl:px-16 relative">
        <div className="w-full max-w-xl">
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: 'linear-gradient(90deg, #4A7C59, #C9A84C, #7DB87F)' }}
          />

          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-[#4A7C59] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M12 2C9 7 4 8 4 14a8 8 0 0016 0c0-6-5-7-8-12z" fill="#7DB87F" />
                <path d="M12 8v10M9 13l3 2 3-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[#1C1A14] text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              ChakFarm
            </span>
          </div>

          <p className="text-[#4A7C59] text-[11px] font-semibold uppercase tracking-widest mb-2">
            Farm Portal
          </p>
          <h2
            className="text-[#1C1A14] text-3xl font-bold mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create your account
          </h2>
          <p className="text-[#A89F8C] text-sm mb-8">Set up your ChakFarm account in a minute</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">

            {/* Full name + Farm name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. John Kamau"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Farm name</label>
                <input
                  type="text"
                  name="farm_name"
                  value={formData.farm_name}
                  onChange={handleChange}
                  placeholder="e.g. Kamau Poultry"
                  autoComplete="organization"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0700 000 000"
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. john_farm"
                autoComplete="username"
                className={inputClass}
              />
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Type it again"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="w-4 h-4 accent-[#4A7C59]"
              />
              <span className="text-[13px] text-[#A89F8C]">Show passwords</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl font-bold text-base tracking-wide transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mt-1 cursor-pointer"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : (
                'Create my account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#A89F8C]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4A7C59] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes sway {
          from { transform: rotate(-2deg); }
          to   { transform: rotate(2deg); }
        }
      `}</style>
    </div>
  )
}

export default RegisterPage