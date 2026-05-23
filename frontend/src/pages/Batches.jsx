import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ClipboardList, X, Bird, Egg, Activity } from 'lucide-react'
import { getBatches, createBatch, updateBatch, deleteBatch, getDailyLogs, createDailyLog } from '../api/index'

const BREEDS = ['broiler', 'layer', 'kienyeji']
const STATUSES = ['active', 'harvested', 'closed']

const statusCls = (s) => ({
  active: 'bg-green-500/20 text-green-400',
  harvested: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-slate-500/20 text-slate-400',
}[s] ?? 'bg-slate-500/20 text-slate-400')

const EMPTY_BATCH = {
  name: '', breed: 'broiler', initial_count: '',
  current_count: '', purchase_cost: '',
  start_date: '', end_date: '', status: 'active', notes: '',
}

const EMPTY_LOG = { date: '', feed_consumed_kg: '', deaths: 0, average_weight_kg: '', notes: '' }

// ── Shared input class ─────────────────────────────────────────
const inp = "w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-green-500 transition-colors placeholder:text-slate-600"

// ── Modal shell ────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-[var(--text-primary)] text-2xl leading-none cursor-pointer bg-transparent border-none">×</button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ── Field wrapper ──────────────────────────────────────────────
function F({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</label>
      {children}
    </div>
  )
}

// ── Batch form ─────────────────────────────────────────────────
function BatchForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <F label="Batch Name"><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Batch #1" required /></F>
        <F label="Breed">
          <select className={inp} value={form.breed} onChange={e => set('breed', e.target.value)}>
            {BREEDS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
          </select>
        </F>
        <F label="Initial Count"><input className={inp} type="number" value={form.initial_count} onChange={e => set('initial_count', e.target.value)} placeholder="200" required /></F>
        <F label="Current Count"><input className={inp} type="number" value={form.current_count} onChange={e => set('current_count', e.target.value)} placeholder="200" required /></F>
        <F label="Purchase Cost (KES)"><input className={inp} type="number" value={form.purchase_cost} onChange={e => set('purchase_cost', e.target.value)} placeholder="12000" required /></F>
        <F label="Start Date"><input className={inp} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required /></F>
        <F label="End Date"><input className={inp} type="date" value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} /></F>
        <F label="Status">
          <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </F>
      </div>
      <F label="Notes"><textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." /></F>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 text-sm font-semibold cursor-pointer bg-transparent hover:text-[var(--text-primary)] transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer disabled:opacity-50">{saving ? 'Saving...' : 'Save Batch'}</button>
      </div>
    </form>
  )
}

// ── Log form ───────────────────────────────────────────────────
function LogForm({ batchId, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...EMPTY_LOG, batch: batchId })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <F label="Date"><input className={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} required /></F>
        <F label="Feed Consumed (kg)"><input className={inp} type="number" step="0.01" value={form.feed_consumed_kg} onChange={e => set('feed_consumed_kg', e.target.value)} placeholder="25.5" required /></F>
        <F label="Deaths Today"><input className={inp} type="number" value={form.deaths} onChange={e => set('deaths', e.target.value)} placeholder="0" /></F>
        <F label="Avg Weight (kg)"><input className={inp} type="number" step="0.001" value={form.average_weight_kg} onChange={e => set('average_weight_kg', e.target.value)} placeholder="1.250" /></F>
      </div>
      <F label="Notes"><textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything unusual today?" /></F>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer disabled:opacity-50">{saving ? 'Saving...' : 'Save Log'}</button>
      </div>
    </form>
  )
}

// ── Logs drawer ────────────────────────────────────────────────
function LogsDrawer({ batch, onClose, onEdit, onDelete }) {
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logSaving, setLogSaving] = useState(false)

  useEffect(() => {
    getDailyLogs(batch.id).then(r => setLogs(r.data)).finally(() => setLogsLoading(false))
  }, [batch.id])

  const handleLogSave = (form) => {
    setLogSaving(true)
    createDailyLog(form).then(r => { setLogs(p => [r.data, ...p]); setShowLogForm(false) }).finally(() => setLogSaving(false))
  }

  const totalFeed = logs.reduce((a, l) => a + Number(l.feed_consumed_kg || 0), 0)
  const totalDeaths = logs.reduce((a, l) => a + Number(l.deaths || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-xl bg-[var(--bg-card)] border-l border-[var(--border)] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-5 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">{batch.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{batch.breed} · started {batch.start_date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(batch)} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent">Edit</button>
            <button onClick={() => onDelete(batch)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer border-none">Delete</button>
            <button onClick={onClose} className="text-slate-500 hover:text-[var(--text-primary)] text-2xl leading-none cursor-pointer bg-transparent border-none ml-1">×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Birds', value: `${batch.current_count}/${batch.initial_count}` },
              { label: 'Mortality', value: `${batch.mortality_percentage ?? 0}%`, red: (batch.mortality_percentage ?? 0) > 5 },
              { label: 'Feed Used', value: `${totalFeed.toFixed(1)} kg` },
              { label: 'Deaths', value: totalDeaths, red: totalDeaths > 0 },
              { label: 'Logs', value: logs.length },
              { label: 'Status', value: batch.status, badge: true },
            ].map((s, i) => (
              <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
                {s.badge
                  ? <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusCls(s.value)}`}>{s.value}</span>
                  : <div className={`text-base font-extrabold ${s.red ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>{s.value}</div>
                }
              </div>
            ))}
          </div>

          {/* Notes */}
          {batch.notes && (
            <div className="mb-5 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Notes</div>
              <p className="text-sm text-slate-400">{batch.notes}</p>
            </div>
          )}

          {/* Daily Logs */}
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Daily Logs</p>
            <button onClick={() => setShowLogForm(true)} className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-black font-bold hover:bg-green-400 transition-colors cursor-pointer border-none">+ Add Log</button>
          </div>

          {showLogForm && (
            <div className="mb-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <LogForm batchId={batch.id} onSave={handleLogSave} onClose={() => setShowLogForm(false)} saving={logSaving} />
            </div>
          )}

          {logsLoading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading logs...</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No logs yet. Add today's log.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map(log => (
                <div key={log.id} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{log.date}</span>
                    {log.deaths > 0 && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{log.deaths} deaths</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><div className="text-slate-500 mb-0.5">Feed</div><div className="font-semibold text-[var(--text-primary)]">{log.feed_consumed_kg} kg</div></div>
                    {log.average_weight_kg && <div><div className="text-slate-500 mb-0.5">Avg Weight</div><div className="font-semibold text-[var(--text-primary)]">{log.average_weight_kg} kg</div></div>}
                    {log.notes && <div className="col-span-3"><div className="text-slate-500 mb-0.5">Note</div><div className="text-slate-400">{log.notes}</div></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function Batches() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editBatch, setEditBatch] = useState(null)
  const [logsBatch, setLogsBatch] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = () => getBatches().then(r => setBatches(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleCreate = (form) => { setSaving(true); createBatch(form).then(r => { setBatches(p => [r.data, ...p]); setShowCreate(false) }).finally(() => setSaving(false)) }
  const handleUpdate = (form) => { setSaving(true); updateBatch(editBatch.id, form).then(r => { setBatches(p => p.map(b => b.id === r.data.id ? r.data : b)); setEditBatch(null) }).finally(() => setSaving(false)) }
  const handleDelete = (b) => { deleteBatch(b.id).then(() => { setBatches(p => p.filter(x => x.id !== b.id)); setDeleteConfirm(null) }) }

  const counts = { all: batches.length, active: batches.filter(b => b.status === 'active').length, harvested: batches.filter(b => b.status === 'harvested').length, closed: batches.filter(b => b.status === 'closed').length }
  const filtered = batches.filter(b => filter === 'all' || b.status === filter).filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Bird className="w-10 h-10 text-green-500 animate-pulse" />
      <span className="text-slate-500 text-sm">Loading batches...</span>
    </div>
  )

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Batches</h1>
          <p className="text-slate-500 text-sm mt-1">{batches.length} total batches</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Batch
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: batches.length, icon: <Egg className="w-5 h-5" />, color: 'text-[var(--text-primary)]' },
          { label: 'Active', value: counts.active, icon: <Bird className="w-5 h-5" />, color: 'text-green-400' },
          { label: 'Harvested', value: counts.harvested, icon: <Activity className="w-5 h-5" />, color: 'text-blue-400' },
          { label: 'Total Birds', value: batches.reduce((a, b) => a + (b.current_count || 0), 0), icon: <Bird className="w-5 h-5" />, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{s.label}</span>
              <span className="text-slate-600">{s.icon}</span>
            </div>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-1">
          {['all', 'active', 'harvested', 'closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none capitalize
                ${filter === f ? 'bg-green-500 text-black' : 'bg-[var(--bg-card)] border border-[var(--border)] text-slate-400 hover:text-[var(--text-primary)]'}`}>
              {f} <span className="opacity-60 ml-1">({counts[f] ?? batches.length})</span>
            </button>
          ))}
        </div>
        <input
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-green-500 transition-colors w-full sm:w-56 placeholder:text-slate-600"
          placeholder="Search batches..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🐣</div>
          <p className="text-slate-400 text-base font-semibold">No batches found</p>
          <p className="text-slate-600 text-sm mt-1">Create your first batch to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} onClick={() => setLogsBatch(b)}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer hover:border-green-500/50 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-green-400 transition-colors">{b.name}</div>
                  <div className="text-xs text-slate-500 capitalize mt-0.5">{b.breed}</div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${statusCls(b.status)}`}>{b.status}</span>
              </div>

              {/* Bird count bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>{b.current_count} alive</span>
                  <span>{b.initial_count} started</span>
                </div>
                <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${b.initial_count ? (b.current_count / b.initial_count) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 mb-0.5">Mortality</div>
                  <div className={`text-sm font-bold ${(b.mortality_percentage ?? 0) > 5 ? 'text-red-400' : 'text-green-400'}`}>{b.mortality_percentage ?? 0}%</div>
                </div>
                <div className="text-center border-x border-[var(--border)]">
                  <div className="text-[10px] text-slate-500 mb-0.5">Started</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">{b.start_date}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 mb-0.5">Cost</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">KES {Number(b.purchase_cost ?? 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-[10px] text-slate-600">Click for logs →</span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEditBatch(b)} className="p-1.5 rounded-lg border border-[var(--border)] text-slate-400 hover:text-green-400 hover:border-green-500/50 transition-colors cursor-pointer bg-transparent">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(b)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && <Modal title="New Batch" onClose={() => setShowCreate(false)} wide><BatchForm initial={EMPTY_BATCH} onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} /></Modal>}

      {/* Edit modal */}
      {editBatch && <Modal title={`Edit — ${editBatch.name}`} onClose={() => setEditBatch(null)} wide><BatchForm initial={editBatch} onSave={handleUpdate} onClose={() => setEditBatch(null)} saving={saving} /></Modal>}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal title="Delete Batch" onClose={() => setDeleteConfirm(null)}>
          <div className="text-center py-2">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-[var(--text-primary)] font-semibold mb-1">Delete {deleteConfirm.name}?</p>
            <p className="text-slate-500 text-sm mb-6">This permanently deletes the batch and all its logs.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-400 cursor-pointer border-none">Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Logs drawer */}
      {logsBatch && <LogsDrawer batch={logsBatch} onClose={() => setLogsBatch(null)} onEdit={b => { setLogsBatch(null); setEditBatch(b) }} onDelete={b => { setLogsBatch(null); setDeleteConfirm(b) }} />}
    </div>
  )
}