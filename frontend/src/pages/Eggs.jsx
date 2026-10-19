import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Egg, CalendarDays, CalendarRange, Clock, Loader2 } from 'lucide-react'
import {
  getEggs, createEgg, deleteEgg,
  getEggSales, createEggSale, deleteEggSale,
  getIncubations, createIncubation, deleteIncubation,
} from '../api/index'

const SALE_STATUS = ['pending', 'completed', 'cancelled']

const statusCls = (s) => ({
  pending: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  incubator: 'bg-blue-500/20 text-blue-400',
  hatcher: 'bg-amber-500/20 text-amber-400',
  finished: 'bg-slate-500/20 text-slate-400',
}[s] ?? 'bg-slate-500/20 text-slate-400')

const inp = "w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-green-500 transition-colors placeholder:text-slate-600"

// date -> "2026-10-19" in the user's own timezone
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// how many days since the eggs were set
const daysSince = (dateStr) => {
  const start = new Date(`${dateStr}T00:00:00`)
  const diff = Math.floor((new Date() - start) / 86400000)
  return diff < 0 ? 0 : diff
}

const stageOf = (days) => (days < 18 ? 'incubator' : days <= 21 ? 'hatcher' : 'finished')

// ── Small pieces ───────────────────────────────────────────────
function F({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-[var(--text-primary)] text-2xl leading-none cursor-pointer bg-transparent border-none">×</button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function FormButtons({ onClose, saving, label }) {
  return (
    <div className="flex gap-3 pt-1">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
      <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : label}
      </button>
    </div>
  )
}

function FormError({ message }) {
  if (!message) return null
  return <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs break-words">{message}</div>
}

// ── Forms ──────────────────────────────────────────────────────
function CollectionForm({ onSave, onClose, saving }) {
  const [form, setForm] = useState({
    collection_date: ymd(new Date()),
    total_eggs_collected: '',
    broken: '0',
    rotten: '0',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <F label="Date"><input className={inp} type="date" value={form.collection_date} onChange={e => set('collection_date', e.target.value)} required /></F>
      <F label="Total eggs collected"><input className={inp} type="number" min="0" value={form.total_eggs_collected} onChange={e => set('total_eggs_collected', e.target.value)} placeholder="0" required /></F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Broken"><input className={inp} type="number" min="0" value={form.broken} onChange={e => set('broken', e.target.value)} /></F>
        <F label="Rotten"><input className={inp} type="number" min="0" value={form.rotten} onChange={e => set('rotten', e.target.value)} /></F>
      </div>
      <FormButtons onClose={onClose} saving={saving} label="Save Collection" />
    </form>
  )
}

function SaleForm({ onSave, onClose, saving }) {
  const [form, setForm] = useState({
    sale_date: ymd(new Date()),
    customer_name: '',
    eggs: '',
    price_per_egg: '',
    status: 'pending',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <F label="Date"><input className={inp} type="date" value={form.sale_date} onChange={e => set('sale_date', e.target.value)} required /></F>
        <F label="Customer"><input className={inp} value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Customer name..." /></F>
        <F label="Eggs"><input className={inp} type="number" min="1" value={form.eggs} onChange={e => set('eggs', e.target.value)} placeholder="30" required /></F>
        <F label="Price per egg (KES)"><input className={inp} type="number" step="0.01" value={form.price_per_egg} onChange={e => set('price_per_egg', e.target.value)} placeholder="15" required /></F>
      </div>
      <F label="Status">
        <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
          {SALE_STATUS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </F>
      <FormButtons onClose={onClose} saving={saving} label="Save Sale" />
    </form>
  )
}

function BatchForm({ onSave, onClose, saving }) {
  const [form, setForm] = useState({
    batch_name: '',
    date_set: ymd(new Date()),
    eggs_set: '',
    infertile: '0',
    hatched: '0',
    notes: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <F label="Batch name"><input className={inp} value={form.batch_name} onChange={e => set('batch_name', e.target.value)} placeholder="Batch #1" required /></F>
        <F label="Date eggs set"><input className={inp} type="date" value={form.date_set} onChange={e => set('date_set', e.target.value)} required /></F>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <F label="Eggs set"><input className={inp} type="number" min="1" value={form.eggs_set} onChange={e => set('eggs_set', e.target.value)} required /></F>
        <F label="Infertile"><input className={inp} type="number" min="0" value={form.infertile} onChange={e => set('infertile', e.target.value)} /></F>
        <F label="Hatched"><input className={inp} type="number" min="0" value={form.hatched} onChange={e => set('hatched', e.target.value)} /></F>
      </div>
      <F label="Notes"><textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." /></F>
      <FormButtons onClose={onClose} saving={saving} label="Save Batch" />
    </form>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function Eggs() {
  const [collections, setCollections] = useState([])
  const [sales, setSales] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)       // first load: full page loader
  const [refreshing, setRefreshing] = useState(false) // later loads: small loader
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [modal, setModal] = useState(null)
  const [tab, setTab] = useState('collections')

  const load = (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true)
    setLoadError('')
    return Promise.all([getEggs(), getEggSales(), getIncubations()])
      .then(([c, s, b]) => {
        setCollections(c.data || [])
        setSales(s.data || [])
        setBatches(b.data || [])
      })
      .catch(() => setLoadError('Could not load egg data. The server may be waking up.'))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }
  useEffect(() => { load() }, [])

  // eggs today / last 7 days / this month
  const totals = useMemo(() => {
    const now = new Date()
    const today = ymd(now)
    const monthPrefix = today.slice(0, 7)
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 6)
    const weekStart = ymd(weekAgo)

    let day = 0, week = 0, month = 0
    collections.forEach(c => {
      const n = Number(c.total_eggs_collected) || 0
      const d = c.collection_date
      if (d === today) day += n
      if (d >= weekStart && d <= today) week += n
      if (d.startsWith(monthPrefix)) month += n
    })
    return { day, week, month }
  }, [collections])

  const pendingEggs = useMemo(
    () => sales.filter(s => s.status === 'pending').reduce((a, s) => a + Number(s.eggs || 0), 0),
    [sales]
  )

  const closeModal = () => { setModal(null); setFormError('') }

  const handleSave = (form) => {
    setSaving(true)
    setFormError('')
    const fn = modal === 'collection' ? createEgg : modal === 'sale' ? createEggSale : createIncubation
    fn(form)
      .then(() => { closeModal(); load(true) })
      .catch(err => {
        const data = err.response?.data
        setFormError(data ? JSON.stringify(data) : 'Could not save. Please try again.')
      })
      .finally(() => setSaving(false))
  }

  const remove = (kind, id) => {
    if (!window.confirm('Delete this record?')) return
    const fn = { collection: deleteEgg, sale: deleteEggSale, batch: deleteIncubation }[kind]
    setRefreshing(true)
    fn(id).then(() => load(true)).catch(() => setRefreshing(false))
  }

  const modalTitle = { collection: 'Add Egg Collection', sale: 'Add Egg Sale', batch: 'Add Incubator Batch' }[modal]

  const th = "text-left text-[10px] text-slate-500 uppercase tracking-widest px-5 py-3 font-semibold border-b border-[var(--border)]"
  const delBtn = "p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"

  // 1) full page loader on first load
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Egg className="w-10 h-10 text-green-500 animate-pulse" />
      <span className="text-slate-500 text-sm">Loading eggs...</span>
    </div>
  )

  // error screen with retry
  if (loadError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-4">
      <Egg className="w-10 h-10 text-red-400" />
      <span className="text-slate-400 text-sm">{loadError}</span>
      <button onClick={() => load()} className="px-5 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 cursor-pointer border-none">Retry</button>
    </div>
  )

  return (
    <div className="max-w-[1100px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Eggs</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Collections, sales and incubator batches
            {refreshing && <span className="flex items-center gap-1 text-green-400 text-xs"><Loader2 className="w-3 h-3 animate-spin" /> Refreshing...</span>}
          </p>
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <button onClick={() => setModal('collection')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none">
            <Plus className="w-4 h-4" /> Collection
          </button>
          <button onClick={() => setModal('sale')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-slate-300 text-sm font-bold hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent">
            <Plus className="w-4 h-4" /> Sale
          </button>
          <button onClick={() => setModal('batch')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-slate-300 text-sm font-bold hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent">
            <Plus className="w-4 h-4" /> Batch
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Eggs today', value: totals.day, icon: <Egg className="w-5 h-5" />, color: 'text-green-400' },
          { label: 'Last 7 days', value: totals.week, icon: <CalendarDays className="w-5 h-5" />, color: 'text-blue-400' },
          { label: 'This month', value: totals.month, icon: <CalendarRange className="w-5 h-5" />, color: 'text-purple-400' },
          { label: 'Pending sales', value: pendingEggs, icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{s.label}</span>
              <span className="text-slate-600">{s.icon}</span>
            </div>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {[
          ['collections', 'Collections', collections.length],
          ['sales', 'Sales', sales.length],
          ['incubator', 'Incubator', batches.length],
        ].map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border-none
              ${tab === key ? 'bg-green-500 text-black' : 'bg-[var(--bg-card)] border border-[var(--border)] text-slate-400 hover:text-[var(--text-primary)]'}`}>
            {label} <span className="opacity-60 ml-1">({count})</span>
          </button>
        ))}
      </div>

      {/* Collections table */}
      {tab === 'collections' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 600 }}>
              <thead>
                <tr>{['Date', 'Collected', 'Broken', 'Rotten', 'Good eggs', ''].map(h => <th key={h} className={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {collections.map(c => {
                  const good = Number(c.total_eggs_collected) - Number(c.broken || 0) - Number(c.rotten || 0)
                  return (
                    <tr key={c.id} className="border-b border-[var(--border)] hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-[var(--text-primary)]">{c.collection_date}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-green-400">{c.total_eggs_collected}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{c.broken}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{c.rotten}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-[var(--text-primary)]">{good}</td>
                      <td className="px-5 py-3.5"><button onClick={() => remove('collection', c.id)} className={delBtn}><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {collections.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No egg collections yet.</div>}
          </div>
        </div>
      )}

      {/* Sales table */}
      {tab === 'sales' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 700 }}>
              <thead>
                <tr>{['Date', 'Customer', 'Eggs', 'Price / egg', 'Total', 'Status', ''].map(h => <th key={h} className={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {sales.map(s => {
                  const total = s.total_sale_amount != null
                    ? Number(s.total_sale_amount)
                    : Number(s.eggs) * Number(s.price_per_egg)
                  return (
                    <tr key={s.id} className="border-b border-[var(--border)] hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-[var(--text-primary)]">{s.sale_date}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{s.customer_name || '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-[var(--text-primary)]">{s.eggs}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">KES {Number(s.price_per_egg).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-green-400">KES {total.toLocaleString()}</td>
                      <td className="px-5 py-3.5"><span className={`text-[10px] px-2 py-1 rounded-full font-bold capitalize ${statusCls(s.status)}`}>{s.status}</span></td>
                      <td className="px-5 py-3.5"><button onClick={() => remove('sale', s.id)} className={delBtn}><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {sales.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No egg sales yet.</div>}
          </div>
        </div>
      )}

      {/* Incubator cards */}
      {tab === 'incubator' && (
        batches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🥚</div>
            <p className="text-slate-400 text-base font-semibold">No incubator batches yet</p>
            <p className="text-slate-600 text-sm mt-1">Add a batch when you put eggs in the incubator</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map(b => {
              const days = daysSince(b.date_set)
              const stage = stageOf(days)
              return (
                <div key={b.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-base font-extrabold text-[var(--text-primary)]">{b.batch_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Set on {b.date_set}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold capitalize ${statusCls(stage)}`}>{stage}</span>
                  </div>

                  {/* Day progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Day {Math.min(days, 21)}</span>
                      <span>21 days</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min((days / 21) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 mb-0.5">Eggs set</div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{b.eggs_set}</div>
                    </div>
                    <div className="text-center border-x border-[var(--border)]">
                      <div className="text-[10px] text-slate-500 mb-0.5">Hatched</div>
                      <div className="text-sm font-bold text-green-400">{b.hatched}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 mb-0.5">Hatch rate</div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{b.hatch_rate}%</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex justify-between mb-3">
                    <span>To hatcher: <span className="text-slate-300">{b.hatcher_date}</span></span>
                    <span>Hatch: <span className="text-slate-300">{b.expected_hatch_date}</span></span>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                    <span className="text-[10px] text-slate-600">Infertile: {b.infertile}</span>
                    <button onClick={() => remove('batch', b.id)} className={delBtn}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {modal && (
        <Modal title={modalTitle} onClose={closeModal}>
          <FormError message={formError} />
          {modal === 'collection' && <CollectionForm onSave={handleSave} onClose={closeModal} saving={saving} />}
          {modal === 'sale' && <SaleForm onSave={handleSave} onClose={closeModal} saving={saving} />}
          {modal === 'batch' && <BatchForm onSave={handleSave} onClose={closeModal} saving={saving} />}
        </Modal>
      )}
    </div>
  )
}