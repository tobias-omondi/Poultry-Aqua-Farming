import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  Bird,
  DollarSign,
  Package,
  Home,
  Bot,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { logout as apiLogout, clearAuthSession } from '../api'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/batches', label: 'Batches', icon: Bird },
  { to: '/financials', label: 'Financials', icon: DollarSign },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/housing', label: 'Housing', icon: Home },
  { to: '/FlowAi', label: 'Flow AI', icon: Bot },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { dark, setDark } = useTheme()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (e) {
      // ignore network errors on logout
    }
    clearAuthSession()
    navigate('/login', { replace: true })
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="mb-8 px-3">
        <div className="text-lg font-extrabold text-green-400">ChakaFarm</div>
        <div className="text-[11px] text-slate-500 mt-1">Poultry Management</div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 no-underline
              ${isActive
                ? 'bg-green-500/15 text-green-400 font-semibold'
                : 'text-slate-400 hover:text-[var(--text-primary)] hover:bg-white/5'
              }`
            }
          >
            <link.icon className="w-4 h-4" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto pt-4">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 hover:text-[var(--text-primary)] text-sm transition-all duration-150 cursor-pointer bg-transparent mb-4"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm transition-all duration-150 cursor-pointer bg-transparent mb-4"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        <div className="text-[10px] text-slate-600 px-3">Phase 1 — Chickens</div>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-[var(--bg-secondary)] border-r border-[var(--border)] fixed top-0 left-0 bottom-0 px-4 py-7 transition-colors duration-300 z-30">
        {navContent}
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="text-base font-extrabold text-green-400">ChakaFarm</div>
        <button
          onClick={() => setOpen(!open)}
          className="text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent border-none"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-40 w-72 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col px-4 py-7 transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {navContent}
      </aside>
    </>
  )
}