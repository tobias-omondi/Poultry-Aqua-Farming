import React, { useEffect, useState } from 'react'
import { getFarmSummary, getBatches, getLowStockAlerts } from '../api/index'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { Leaf, Sun, Moon, TrendingUp, TrendingDown, DollarSign, Bird } from 'lucide-react'

// ── Mini Calendar ──────────────────────────────────────────────
function MiniCalendar() {
  const [current, setCurrent] = useState(new Date())
  const today = new Date()
  const year = current.getFullYear()
  const month = current.getMonth()
  const monthName = current.toLocaleString('default', { month: 'long' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setCurrent(new Date(year, month - 1, 1))}
          className="text-slate-500 hover:text-slate-300 transition-colors px-1 text-lg cursor-pointer bg-transparent border-none"
        >‹</button>
        <span className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">
          {monthName} {year}
        </span>
        <button
          onClick={() => setCurrent(new Date(year, month + 1, 1))}
          className="text-slate-500 hover:text-slate-300 transition-colors px-1 text-lg cursor-pointer bg-transparent border-none"
        >›</button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[9px] text-slate-500 py-1 tracking-wider">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <div key={i} className={`text-center text-[11px] py-1.5 rounded-md transition-colors
            ${isToday(d) ? 'bg-green-500 text-black font-bold'
              : d ? 'text-slate-400 hover:bg-white/10 cursor-pointer'
              : 'text-transparent'}`}>
            {d ?? '·'}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Buyers ─────────────────────────────────────────────────────
const MOCK_BUYERS = [
  { id: 1, name: 'Mama Njeri Supplies', type: 'Wholesale', lastPurchase: '2025-01-10', amount: 28000, birds: 80 },
  { id: 2, name: 'Kenyatta Market', type: 'Retail', lastPurchase: '2025-01-08', amount: 9500, birds: 20 },
  { id: 3, name: 'Eastleigh Butchery', type: 'Offtake', lastPurchase: '2025-01-05', amount: 42000, birds: 120 },
]

function BuyerCard({ buyer }) {
  const initials = buyer.name.split(' ').slice(0, 2).map(w => w[0]).join('')
  const typeCls =
    buyer.type === 'Offtake' ? 'bg-blue-500/20 text-blue-400' :
    buyer.type === 'Wholesale' ? 'bg-amber-500/20 text-amber-400' :
    'bg-green-500/20 text-green-400'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
      <div className="w-9 h-9 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{buyer.name}</div>
        <div className="text-xs text-slate-500 mt-0.5">{buyer.birds} birds · {buyer.lastPurchase}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-bold text-[var(--text-primary)]">KES {buyer.amount.toLocaleString()}</div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${typeCls}`}>
          {buyer.type}
        </span>
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, colorCls }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</span>
        <div className="text-var(--text-primary)">{icon}</div>
      </div>
      <div className={`text-2xl font-extrabold tracking-tight mb-1 ${colorCls}`}>{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────
export default function Dashboard() {
  const { dark, setDark } = useTheme()
  const [summary, setSummary] = useState(null)
  const [batches, setBatches] = useState([])
  const [alerts, setAlerts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getFarmSummary(),
      getBatches(),
      getLowStockAlerts(),
    ]).then(([s, b, a]) => {
      setSummary(s.data)
      setBatches(b.data)
      setAlerts(a.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Leaf className="w-10 h-10 text-green-500 animate-pulse" />
      <span className="text-slate-500 text-sm">Loading farm data...</span>
    </div>
  )

  const chartData = [
    { name: 'Revenue', value: summary?.total_revenue ?? 0, color: '#22c55e' },
    { name: 'Costs', value: summary?.total_costs ?? 0, color: '#ef4444' },
    { name: 'Profit', value: summary?.profit ?? 0, color: (summary?.profit ?? 0) >= 0 ? '#3b82f6' : '#ef4444' },
  ]

  const dateStr = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="max-w-[1200px]">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Farm Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">{dateStr}</p>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm text-slate-400 hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Revenue" value={`KES ${Number(summary?.total_revenue ?? 0).toLocaleString()}`} sub="All sales combined" icon={<TrendingUp className="w-5 h-5" />} colorCls="text-green-400" />
        <StatCard label="Total Costs" value={`KES ${Number(summary?.total_costs ?? 0).toLocaleString()}`} sub="All expenses combined" icon={<TrendingDown className="w-5 h-5" />} colorCls="text-red-400" />
        <StatCard label="Net Profit" value={`KES ${Number(summary?.profit ?? 0).toLocaleString()}`} sub={summary?.is_profitable ? '▲ Profitable' : '▼ Running at loss'} icon={<DollarSign className="w-5 h-5" />} colorCls={(summary?.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Active Batches" value={summary?.active_batches ?? '0'} sub={`${summary?.closed_batches ?? '0'} closed`} icon={<Bird className="w-5 h-5" />} colorCls="text-amber-400" />
      </div>

      {/* Chart + Calendar */}
      <div className="grid grid-cols-[1fr_220px] gap-4 mb-5">

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-4">P&L Breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={44} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }}
                formatter={v => [`KES ${Number(v).toLocaleString()}`, '']}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-3">Calendar</p>
            <MiniCalendar />
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-3">Farm Stats</p>
            {[
              { label: 'Total Birds', value: batches.reduce((a, b) => a + (b.current_count || 0), 0) },
              { label: 'Avg Mortality', value: batches.length ? `${(batches.reduce((a, b) => a + (b.mortality_percentage || 0), 0) / batches.length).toFixed(1)}%` : '0%' },
              { label: 'Total Batches', value: batches.length },
            ].map((s, i) => (
              <div key={i} className={`flex justify-between py-2 ${i < 2 ? 'border-b border-[var(--border)]' : ''}`}>
                <span className="text-xs text-slate-500">{s.label}</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(alerts?.total_alerts ?? 0) > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Stock Alerts</p>
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{alerts.total_alerts} low</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {alerts?.low_feed?.map(f => (
              <div key={f.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs text-amber-400 font-semibold capitalize">{f.feed_type} feed</div>
                <div className="text-base font-extrabold text-[var(--text-primary)] mt-1">{f.quantity_bags} bags</div>
                <div className="text-[10px] text-slate-500 mt-0.5">below reorder level</div>
              </div>
            ))}
            {alerts?.low_medications?.map(m => (
              <div key={m.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="text-xs text-red-400 font-semibold">{m.name}</div>
                <div className="text-base font-extrabold text-[var(--text-primary)] mt-1">{m.quantity} {m.unit}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">below reorder level</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batches + Buyers */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-4">Active Batches</p>
          {batches.length === 0 ? (
            <p className="text-slate-500 text-sm py-3">No batches yet. Add your first batch in the admin panel.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['Batch', 'Breed', 'Birds', 'Mortality', 'Status', 'Started'].map(h => (
                    <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-widest pb-3 px-2 font-semibold border-b border-[var(--border)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id} className="border-b border-[var(--border)] hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-bold text-[var(--text-primary)] text-sm">{b.name}</td>
                    <td className="py-3 px-2 capitalize text-slate-400 text-sm">{b.breed}</td>
                    <td className="py-3 px-2 text-slate-400 text-sm">{b.current_count}/{b.initial_count}</td>
                    <td className="py-3 px-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${(b.mortality_percentage ?? 0) > 5 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {b.mortality_percentage ?? 0}%
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${b.status === 'active' ? 'bg-green-500/20 text-green-400' : b.status === 'harvested' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500 text-xs">{b.start_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Recent Buyers</p>
            <span className="text-xs text-green-400 font-semibold cursor-pointer hover:underline">View all →</span>
          </div>
          {MOCK_BUYERS.map(buyer => <BuyerCard key={buyer.id} buyer={buyer} />)}
          <div className="mt-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 flex justify-between items-center">
            <span className="text-xs text-green-400 font-semibold">Total from buyers</span>
            <span className="text-sm font-extrabold text-green-400">KES {MOCK_BUYERS.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}