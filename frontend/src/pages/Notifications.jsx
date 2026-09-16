import React, { useEffect, useMemo, useState } from 'react'
import { Bell, Trash2, CheckCheck, AlertTriangle } from 'lucide-react'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../api/index'

// Mirrors Notification.KIND_CHOICES
const KIND_CHOICES = [
  ['all', 'All'],
  ['health', 'Health & Care'],
  ['market', 'Market & Finance'],
  ['alert', 'Alert'],
  ['infra', 'Infrastructure'],
]

const KIND_TINT = {
  health: 'bg-emerald-500/20 text-emerald-400',
  market: 'bg-amber-500/20 text-amber-400',
  alert: 'bg-red-500/20 text-red-400',
  infra: 'bg-slate-500/20 text-slate-400',
}

function formatTime(iso) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [kind, setKind] = useState('all')

  const loadData = () => {
    setLoading(true)
    getNotifications()
      .then(res => setNotifications(res.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const filtered = useMemo(() => {
    if (kind === 'all') return notifications
    return notifications.filter(n => n.kind === kind)
  }, [notifications, kind])

  const stats = useMemo(() => ({
    unread: notifications.filter(n => !n.is_read).length,
    alerts: notifications.filter(n => n.kind === 'alert' && !n.is_read).length,
    today: notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length,
  }), [notifications])

  const toggleRead = (n) => {
    markNotificationRead(n.id, { is_read: !n.is_read }).then(loadData)
  }

  const markAll = () => {
    markAllNotificationsRead().then(loadData)
  }

  const remove = (id) => {
    if (!window.confirm('Delete this notification?')) return
    deleteNotification(id).then(loadData)
  }

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-panel tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">What needs your attention across the farm</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={markAll}
            disabled={stats.unread === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none w-full sm:w-auto disabled:opacity-40 disabled:cursor-default"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Unread', value: stats.unread, icon: <Bell className="w-5 h-5" />, tint: 'bg-blue-500/20 text-blue-400' },
          { label: 'Unread alerts', value: stats.alerts, icon: <AlertTriangle className="w-5 h-5" />, tint: 'bg-red-500/20 text-red-400' },
          { label: 'Today', value: stats.today, icon: <Bell className="w-5 h-5" />, tint: 'bg-emerald-500/20 text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="bg-panel border border-panel rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{s.label}</span>
              <span className={`p-2 rounded-xl ${s.tint}`}>{s.icon}</span>
            </div>
            <div className="text-2xl font-extrabold text-panel tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex gap-1 bg-panel border border-panel rounded-xl p-1 w-full sm:w-fit overflow-x-auto">
        {KIND_CHOICES.map(([v, l]) => (
          <button
            key={v}
            onClick={() => setKind(v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer border-none ${kind === v ? 'bg-green-500 text-black' : 'text-slate-400 hover:text-panel bg-transparent'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="bg-panel border border-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 780 }}>
            <thead>
              <tr>
                {['', 'Title', 'Message', 'Type', 'Time', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => (
                <tr
                  key={n.id}
                  onClick={() => toggleRead(n)}
                  className={`border-b border-panel hover:bg-white/5 transition-colors cursor-pointer ${n.is_read ? 'opacity-50' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${n.is_read ? 'border border-panel' : 'bg-amber-400'}`} />
                  </td>
                  <td className={`px-5 py-3.5 text-sm text-panel ${n.is_read ? 'font-medium' : 'font-bold'}`}>{n.title}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 max-w-xs truncate">{n.message || '—'}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${KIND_TINT[n.kind] || 'bg-slate-500/20 text-slate-400'}`}>{n.kind}</span></td>
                  <td className="px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">{formatTime(n.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={(e) => { e.stopPropagation(); remove(n.id) }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">You're caught up — no notifications here.</div>}
        </div>
      </div>
    </div>
  )
}