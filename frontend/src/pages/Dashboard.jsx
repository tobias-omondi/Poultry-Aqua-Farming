import React, { useEffect, useState } from 'react'
import { getFarmSummary, getBatches, getLowStockAlerts } from '../api/index'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from '../context/ThemeContext'

export default function Dashboard() {
  const { dark } = useTheme()
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
    <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
      Loading farm data...
    </div>
  )

  const chartData = summary ? [
    { name: 'Revenue', value: summary.total_revenue, color: '#16a34a' },
    { name: 'Costs', value: summary.total_costs, color: '#ef4444' },
    { name: 'Profit', value: summary.profit, color: summary.profit >= 0 ? '#3b82f6' : '#ef4444' },
  ] : []

  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
    transition: 'background 0.3s',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          Farm Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Live snapshot of your farm performance
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          {
            label: 'Total Revenue',
            value: `KES ${summary?.total_revenue?.toLocaleString() ?? '0'}`,
            sub: 'All sales combined',
            color: 'var(--accent)',
          },
          {
            label: 'Total Costs',
            value: `KES ${summary?.total_costs?.toLocaleString() ?? '0'}`,
            sub: 'All expenses combined',
            color: '#ef4444',
          },
          {
            label: 'Net Profit',
            value: `KES ${summary?.profit?.toLocaleString() ?? '0'}`,
            sub: summary?.is_profitable ? '▲ Profitable' : '▼ Running at loss',
            color: summary?.profit >= 0 ? 'var(--accent)' : '#ef4444',
          },
          {
            label: 'Active Batches',
            value: summary?.active_batches ?? '0',
            sub: `${summary?.closed_batches ?? '0'} closed`,
            color: '#f59e0b',
          },
        ].map((s, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* P&L Chart */}
        <div style={card}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            P&L Breakdown
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                }}
                formatter={v => [`KES ${v.toLocaleString()}`, '']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Alerts */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Stock Alerts
            </div>
            {alerts?.total_alerts > 0 && (
              <span style={{ fontSize: 11, background: '#ef444422', color: '#ef4444', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                {alerts.total_alerts} low
              </span>
            )}
          </div>

          {alerts?.total_alerts === 0 && (
            <div style={{ color: 'var(--text-muted)', padding: '16px 0' }}>
              ✅ All stock levels are healthy
            </div>
          )}

          {alerts?.low_feed?.map(f => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{f.feed_type} feed</span>
              <span style={{ fontSize: 11, background: '#f59e0b22', color: '#f59e0b', padding: '2px 8px', borderRadius: 999 }}>
                {f.quantity_bags} bags left
              </span>
            </div>
          ))}

          {alerts?.low_medications?.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{m.name}</span>
              <span style={{ fontSize: 11, background: '#ef444422', color: '#ef4444', padding: '2px 8px', borderRadius: 999 }}>
                {m.quantity} {m.unit} left
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Batches Table */}
      <div style={card}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Active Batches
        </div>

        {batches.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '16px 0' }}>
            No batches yet. Create your first batch in the admin panel.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Batch', 'Breed', 'Birds', 'Mortality', 'Status', 'Started'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</td>
                  <td style={{ padding: '12px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{b.breed}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{b.current_count} / {b.initial_count}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600,
                      background: b.mortality_percentage > 5 ? '#ef444422' : '#16a34a22',
                      color: b.mortality_percentage > 5 ? '#ef4444' : 'var(--accent)',
                    }}>
                      {b.mortality_percentage}%
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600,
                      background: b.status === 'active' ? '#16a34a22' : b.status === 'harvested' ? '#3b82f622' : '#f59e0b22',
                      color: b.status === 'active' ? 'var(--accent)' : b.status === 'harvested' ? '#3b82f6' : '#f59e0b',
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{b.start_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}