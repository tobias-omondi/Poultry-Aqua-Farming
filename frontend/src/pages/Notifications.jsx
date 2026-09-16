import React, { useEffect, useMemo, useState } from 'react'
import { Bell, Trash2, CheckCheck } from 'lucide-react'
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
  health: 'border-l-emerald-500',
  market: 'border-l-amber-500',
  alert: 'border-l-red-500',
  infra: 'border-l-slate-500',
}

function groupByDay(notifications) {
  const groups = {}
  notifications.forEach(n => {
    const day = new Date(n.created_at).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    })
    if (!groups[day]) groups[day] = []
    groups[day].push(n)
  })
  return groups
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

  const grouped = useMemo(() => groupByDay(filtered), [filtered])
  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications])

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
    <div className="max-w-3xl w-full mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-panel tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">What needs your attention, grouped by day</p>
        </div>
        <button
          onClick={markAll}
          disabled={unreadCount === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-panel text-slate-300 text-sm font-bold hover:text-panel transition-colors cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-default"
        >
          <CheckCheck className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <div className="flex gap-1 bg-panel border border-panel rounded-xl p-1 mb-6 w-full sm:w-fit overflow-x-auto">
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

      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} className="mb-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2 pb-2 border-b border-panel">{day}</div>
          <div className="space-y-2">
            {items.map(n => (
              <div
                key={n.id}
                onClick={() => toggleRead(n)}
                className={`flex gap-3 p-4 bg-panel border border-panel border-l-4 rounded-xl cursor-pointer transition-opacity ${KIND_TINT[n.kind] || 'border-l-slate-500'} ${n.is_read ? 'opacity-50' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'border border-panel' : 'bg-amber-400'}`} />
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-sm font-bold text-panel">{n.title}</h3>
                    <time className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(n.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </time>
                  </div>
                  {n.message && <p className="text-sm text-slate-400 mt-1">{n.message}</p>}
                  <span className="text-xs text-slate-500 mt-2 inline-block capitalize">{n.kind}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                  className="p-1.5 h-fit rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 text-sm">You're caught up — no notifications here.</div>
      )}
    </div>
  )
}