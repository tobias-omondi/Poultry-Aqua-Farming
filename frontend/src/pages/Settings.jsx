import React, { useState } from 'react'
import { User, Bell, MapPin, Lock, Save } from 'lucide-react'

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

function ProfileSection({ saving, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
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

function NotificationsSection({ saving, onSave }) {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(NOTIFICATION_KINDS.map(([key]) => [key, true]))
  )
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

function FarmSection({ saving, onSave }) {
  const [form, setForm] = useState({ farm_name: '', location: '', branch_name: '' })
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
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const mismatch = form.new_password && form.confirm_password && form.new_password !== form.confirm_password
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
      <SaveBar saving={saving} onSave={() => !mismatch && onSave(form)} />
    </div>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const handleSave = (payload) => {
    setSaving(true)
    // TODO: wire to the relevant endpoint once it exists on the backend
    // e.g. updateProfile(payload) / updateNotificationPrefs(payload) / updateFarmDetails(payload) / changePassword(payload)
    console.log(`Saving ${tab}:`, payload)
    setTimeout(() => setSaving(false), 500)
  }

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
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer border-none ${tab === t.key ? 'bg-green-500 text-black' : 'text-slate-400 hover:text-panel bg-transparent'}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="bg-panel border border-panel rounded-2xl p-6">
        {tab === 'profile' && <ProfileSection saving={saving} onSave={handleSave} />}
        {tab === 'notifications' && <NotificationsSection saving={saving} onSave={handleSave} />}
        {tab === 'farm' && <FarmSection saving={saving} onSave={handleSave} />}
        {tab === 'security' && <SecuritySection saving={saving} onSave={handleSave} />}
      </div>
    </div>
  )
}