import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, setAuthToken } from '../api'
import { useEffect } from 'react'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await login({
        username: formData.username,
        password: formData.password,
      })
      const data = res.data
      // Expect the backend to return a token in `token` or `access`
      const token = data.token || data.access || data.key
      if (!token) throw new Error('No token received')
      // store token
      if (rememberMe) {
        localStorage.setItem('ff_token', token)
      } else {
        sessionStorage.setItem('ff_token', token)
      }
      setAuthToken(token)
      window.dispatchEvent(new Event('auth:change'))
      navigate('/')
    } catch (err) {
      setError('Incorrect username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    // Replace with your Django Allauth / OAuth URL
    window.location.href = '/accounts/google/login/'
  }

  // Wheat stalk heights for the decorative background
  const stalks = Array.from({ length: 50 }, (_, i) => ({
    height: 60 + Math.random() * 200,
    opacity: 0.25 + Math.random() * 0.4,
    duration: 2.5 + Math.random() * 2,
    delay: Math.random() * 2,
  }))

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen flex bg-[#1C1A14] w-full">

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-end p-12 xl:p-16 overflow-hidden">

        {/* Background glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 80%, rgba(74,124,89,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 20%, rgba(201,168,76,0.15) 0%, transparent 55%), #2E2B22',
          }}
        />

        {/* Animated wheat stalks */}
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

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          {/* Brand */}
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

          {/* Headline */}
          <h1
            className="text-[#F5F0E8] text-4xl xl:text-5xl font-medium leading-tight mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Grow smarter.<br />
            <span className="text-[#7DB87F]">Track every harvest,</span><br />
            every day.
          </h1>

          <p className="text-[#A89F8C] text-[15px] font-light leading-relaxed max-w-sm mb-10">
            Your full farm operation — poultry, cattle, and goats — monitored in one place.
            From batch logs to feed schedules, ChakFarm keeps you in control.
          </p>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { num: '3K+', label: 'Kenyan Farms' },
              { num: '98%', label: 'Uptime' },
              { num: '24/7', label: 'Farm Insights' },
            ].map(({ num, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span
                  className="text-[#C9A84C] text-2xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {num}
                </span>
                <span className="text-[#A89F8C] text-[11px] font-medium uppercase tracking-widest">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 bg-[#F5F0E8] flex items-center justify-center px-6 py-14 lg:px-10 xl:px-16 relative">
        <div className="w-full max-w-xl">
          {/* Accent top bar */}
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
            Welcome back
          </h2>
          <p className="text-[#A89F8C] text-sm mb-8">Sign in to your ChakFarm account</p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full h-12 bg-white border border-[#DDD5C4] rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-[#1C1A14] transition-all hover:border-[#4A7C59] hover:shadow-md mb-6 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#DDD5C4]" />
            <span className="text-[#A89F8C] text-xs font-medium">or use credentials</span>
            <div className="flex-1 h-px bg-[#DDD5C4]" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[#2E2B22]">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F8C] pointer-events-none">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. john_farm"
                  autoComplete="username"
                  className="w-full h-12 pl-10 pr-4 bg-white border border-[#DDD5C4] rounded-xl text-sm text-[#1C1A14] placeholder-[#DDD5C4] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[#2E2B22]">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F8C] pointer-events-none">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-12 pl-10 pr-10 bg-white border border-[#DDD5C4] rounded-xl text-sm text-[#1C1A14] placeholder-[#DDD5C4] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A89F8C] hover:text-[#4A7C59] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all cursor-pointer ${
                    rememberMe
                      ? 'bg-[#4A7C59] border-[#4A7C59]'
                      : 'bg-white border-[#DDD5C4]'
                  }`}
                >
                  {rememberMe && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-[#A89F8C]">Remember me</span>
              </label>
              <a href="#" className="text-[13px] text-[#4A7C59] font-medium hover:opacity-70 transition-opacity">
                Forgot password?
              </a>
            </div>

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
                'Sign In to ChakFarm'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#A89F8C]">
            New to ChakFarm?{' '}
            <a href="#" className="text-[#4A7C59] font-semibold hover:underline">
              Request farm access
            </a>
          </p>
        </div>
      </div>

      {/* Keyframes for wheat sway */}
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

export default LoginPage