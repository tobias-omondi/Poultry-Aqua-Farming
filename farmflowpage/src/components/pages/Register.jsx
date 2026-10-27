import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LandingPage.css'   // shared colours and fonts
import './Register.css'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import { NAV_LINKS } from './navLinks'
import { Check, Eye, EyeOff } from 'lucide-react'
import sideImg from '/src/assets/chicken.jpg'   // change to any photo you like

const PERKS = [
  'One ledger for every batch you run',
  'Live profit and loss, not end-of-season guesses',
  'Your records are private to your account',
]

// Turns the server's error reply into one readable sentence
function readError(data) {
  if (!data || typeof data !== 'object') return 'Something went wrong. Please try again.'
  if (data.detail) return data.detail
  const first = Object.values(data)[0]
  return Array.isArray(first) ? first[0] : String(first)
}

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', farmName: '', password: '', confirm: '',
  })
  const [agree, setAgree] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('light-bg')
    return () => document.body.classList.remove('light-bg')
  }, [])

  // Gives the navbar its "scrolled" look, same as the other pages
  useEffect(() => {
    const nav = document.getElementById('siteNav')
    const handler = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 30) }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirm) return setError('The two passwords do not match.')
    if (!agree) return setError('Please accept the terms to continue.')

    setLoading(true)
    try {
      // CHANGE THIS URL and the field names below to match your Django serializer
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          farm_name: form.farmName,
          password: form.password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(readError(data))
        return
      }
      navigate('/login', { state: { registered: true } })
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="site-theme">
      <Navbar
        theme="light"
        links={NAV_LINKS}
        actions={
          <>
            <Link to="/login" className="site-btn-ghost">Sign in</Link>
            <Link to="/register" className="site-btn-solid">Get Started</Link>
          </>
        }
        onHamburger={() => setMenuOpen(o => !o)}
      />
      <MobileMenu
        theme="light"
        open={menuOpen}
        links={NAV_LINKS}
        onNavigate={() => setMenuOpen(false)}
        authLinks={[
          { to: '/login', label: 'Sign in' },
          { to: '/register', label: 'Get Started →' },
        ]}
      />
      <div className="rg-page">
      {/* LEFT: brand panel */}
      <aside className="rg-side">
        <img className="rg-side-img" src={sideImg} alt="" />
        <div className="rg-side-overlay" />
        <div className="rg-side-content">
          <span />
          <div>
            <h2 className="rg-side-title">
              Know what every batch <span>really earns.</span>
            </h2>
            <ul className="rg-perks">
              {PERKS.map(p => (
                <li key={p}>
                  <span className="rg-tick"><Check size={14} strokeWidth={2.5} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="rg-side-foot">Farm intelligence for the modern African farmer.</p>
        </div>
      </aside>

      {/* RIGHT: form */}
      <main className="rg-main">
        <div className="rg-card">
          <h1 className="rg-title">Create your free account</h1>
          <p className="rg-sub">It takes a minute. No card needed.</p>

          {error && <div className="rg-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="rg-field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" value={form.fullName} onChange={update}
                autoComplete="name" placeholder="e.g. Tobias Ogola" required />
            </div>

            <div className="rg-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={update}
                autoComplete="email" placeholder="you@example.com" required />
            </div>

            <div className="rg-row">
              <div className="rg-field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={update}
                  autoComplete="tel" placeholder="07xx xxx xxx" />
              </div>
              <div className="rg-field">
                <label htmlFor="farmName">Farm name <span className="rg-opt">(optional)</span></label>
                <input id="farmName" name="farmName" value={form.farmName} onChange={update}
                  placeholder="e.g. Chak Poultry" />
              </div>
            </div>

            <div className="rg-field">
              <label htmlFor="password">Password</label>
              <div className="rg-pw">
                <input id="password" name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={update} autoComplete="new-password"
                  placeholder="At least 8 characters" required />
                <button type="button" className="rg-eye" onClick={() => setShowPw(s => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="rg-field">
              <label htmlFor="confirm">Confirm password</label>
              <input id="confirm" name="confirm" type={showPw ? 'text' : 'password'}
                value={form.confirm} onChange={update} autoComplete="new-password"
                placeholder="Type it again" required />
            </div>

            <label className="rg-check">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</span>
            </label>

            <button type="submit" className="lg-btn-primary rg-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="rg-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </main>
      </div>
    </div>
  )
}

export default Register