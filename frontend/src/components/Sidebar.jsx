import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/', label: 'Overview', icon: '📊' },
  { to: '/batches', label: 'Batches', icon: '🐔' },
  { to: '/financials', label: 'Financials', icon: '💰' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/housing', label: 'Housing', icon: '🏠' },
]

export default function Sidebar() {
  const { dark, setDark } = useTheme()

  return (
    <aside style={{
      width: 240,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 16px',
      transition: 'background 0.3s',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, paddingLeft: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
          🌿 FarmFlow
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Poultry Management
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s',
            })}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => setDark(!dark)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            transition: 'all 0.15s',
          }}
        >
          <span>{dark ? '☀️' : '🌙'}</span>
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, paddingLeft: 4 }}>
          Phase 1 — Chickens
        </div>
      </div>
    </aside>
  )
}