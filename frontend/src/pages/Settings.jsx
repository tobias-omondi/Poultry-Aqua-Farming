import React, { useEffect, useState } from 'react'
import { User, Bell, MapPin, Lock, Save } from 'lucide-react'
// NEW: the 5 functions that talk to Django
import {
  getSettings,
  saveSettings,
  changePassword,
  getNotificationPrefs,
  saveNotificationPrefs,
} from '../api/index'

// Mirrors Notification.KIND_CHOICES from the notifications app
const NOTIFICATION_KINDS = [
  ['health', 'Health & Care', 'Deworming, vaccination and weight-check reminders'],
  ['market', 'Market & Finance', 'Price checks, order reminders, sales updates'],
  ['alert', 'Alerts', 'Low stock, urgent issues that need same-day action'],
  ['infra', 'Infrastructure', 'Water lines, housing and equipment checks'],
]

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'farm', label: 'Farm Details', icon: MapPin },
  { key: 'security', label: 'Security', icon: Lock },
]

const inputClass = 'w-full bg-panel-soft border border-panel rounded-xl px-3 py-2.5 text-sm text-panel outline-none focus:border-green-500 transition-colors placeholder:text-slate-600'

function FormField({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{label}</label>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  )
}

function SaveBar({ saving, onSave }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  )
}

// CHANGED: now receives `initial` (the saved values from Django)
function ProfileSection({ initial, saving, onSave }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
  })
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Full name">
          <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Phone">
          <input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Email" hint="Used for login and account recovery">
        <input type="email" className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      </FormField>
      <SaveBar saving={saving} onSave={() => onSave(form)} />
    </div>
  )
}

// CHANGED: starts from the saved switches instead of "everything on"
function NotificationsSection({ initial, saving, onSave }) {
  const [prefs, setPrefs] = useState(initial)
  const toggle = (key) => setPrefs({ ...prefs, [key]: !prefs[key] })

  return (
    <div className="space-y-3">
      {NOTIFICATION_KINDS.map(([key, label, desc]) => (
        <div key={key} className="flex items-center justify-between gap-4 p-4 bg-panel-soft border border-panel rounded-xl">
          <div>
            <div className="text-sm font-semibold text-panel">{label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
          </div>
          <button
            onClick={() => toggle(key)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex-shrink-0 ${prefs[key] ? 'bg-green-500' : 'bg-panel'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${prefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      ))}
      <SaveBar saving={saving} onSave={() => onSave(prefs)} />
    </div>
  )
}

// CHANGED: receives `initial`
function FarmSection({ initial, saving, onSave }) {
  const [form, setForm] = useState({
    farm_name: initial.farm_name || '',
    location: initial.location || '',
    branch_name: initial.branch_name || '',
  })
  return (
    <div className="space-y-4">
      <FormField label="Farm name">
        <input className={inputClass} value={form.farm_name} onChange={e => setForm({ ...form, farm_name: e.target.value })} placeholder="Chakfarm" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Main location">
          <input className={inputClass} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Bondo, Siaya County" />
        </FormField>
        <FormField label="Active branch">
          <input className={inputClass} value={form.branch_name} onChange={e => setForm({ ...form, branch_name: e.target.value })} placeholder="Bondo branch" />
        </FormField>
      </div>
      <SaveBar saving={saving} onSave={() => onSave(form)} />
    </div>
  )
}

function SecuritySection({ saving, onSave }) {
  const empty = { current_password: '', new_password: '', confirm_password: '' }
  const [form, setForm] = useState(empty)
  const mismatch = form.new_password && form.confirm_password && form.new_password !== form.confirm_password
  // NEW: all three boxes must be filled in
  const incomplete = !form.current_password || !form.new_password || !form.confirm_password

  // NEW: only save if OK, and clear the boxes after a successful save
  const handleClick = () => {
    if (mismatch || incomplete) return
    onSave(form).then(ok => { if (ok) setForm(empty) })
  }

  return (
    <div className="space-y-4">
      <FormField label="Current password">
        <input type="password" className={inputClass} value={form.current_password} onChange={e => setForm({ ...form, current_password: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="New password">
          <input type="password" className={inputClass} value={form.new_password} onChange={e => setForm({ ...form, new_password: e.target.value })} />
        </FormField>
        <FormField label="Confirm new password">
          <input type="password" className={inputClass} value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} />
        </FormField>
      </div>
      {mismatch && <div className="text-xs text-red-400">Passwords don't match.</div>}
      <SaveBar saving={saving} onSave={handleClick} />
    </div>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  // NEW: memory for the data that comes from Django
  const [data, setData] = useState(null)        // profile + farm details
  const [prefs, setPrefs] = useState(null)      // notification switches
  const [loadError, setLoadError] = useState(false)
  const [message, setMessage] = useState(null)  // the "Saved!" / error banner

  // NEW: runs once when the page opens, asks Django for everything
  useEffect(() => {
    Promise.all([getSettings(), getNotificationPrefs()])
      .then(([settingsRes, prefsRes]) => {
        setData(settingsRes.data)
        setPrefs(prefsRes.data)
      })
      .catch(() => setLoadError(true))
  }, [])

  // CHANGED: now really saves, and returns true (worked) or false (failed)
  const handleSave = (payload) => {
    setSaving(true)
    setMessage(null)

    let request
    if (tab === 'security') request = changePassword(payload)
    else if (tab === 'notifications') request = saveNotificationPrefs(payload)
    else request = saveSettings(payload)

    return request
      .then(res => {
        if (tab === 'profile' || tab === 'farm') setData(res.data)
        if (tab === 'notifications') setPrefs(res.data)
        setMessage({ type: 'success', text: 'Saved!' })
        return true
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.response?.data?.error || 'Could not save. Please try again.' })
        return false
      })
      .finally(() => setSaving(false))
  }

  // NEW: what to show while waiting, or if loading failed
  if (loadError) return <div className="text-sm text-red-400">Could not load your settings. Please refresh the page.</div>
  if (!data || !prefs) return <div className="text-sm text-slate-500">Loading...</div>

  return (
    <div className="max-w-3xl w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-panel tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, farm and notification preferences</p>
      </div>

      <div className="mb-5 flex gap-1 bg-panel border border-panel rounded-xl p-1 w-full sm:w-fit overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setMessage(null) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer border-none ${tab === t.key ? 'bg-green-500 text-black' : 'text-slate-400 hover:text-panel bg-transparent'}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* NEW: the green "Saved!" or red error banner */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-panel border border-panel rounded-2xl p-6">
        {tab === 'profile' && <ProfileSection initial={data} saving={saving} onSave={handleSave} />}
        {tab === 'notifications' && <NotificationsSection initial={prefs} saving={saving} onSave={handleSave} />}
        {tab === 'farm' && <FarmSection initial={data} saving={saving} onSave={handleSave} />}
        {tab === 'security' && <SecuritySection saving={saving} onSave={handleSave} />}
      </div>
    </div>
  )
}