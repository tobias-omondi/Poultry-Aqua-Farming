import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Home, Warehouse, Users, Sparkles, Trash2 } from 'lucide-react'
import { getHouses, getBatches, createHouse, updateHouse, deleteHouse } from '../api/index'

const inp = "w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-green-500 transition-colors placeholder:text-slate-600"

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
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function Housing() {
  const [houses, setHouses] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', capacity: '', active_batch: '', last_cleaned: '', notes: '' })

  const load = () => {
    setLoading(true)
    Promise.all([getHouses(), getBatches()]).then(([h, b]) => { setHouses(h.data); setBatches(b.data) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, capacity: Number(form.capacity), active_batch: form.active_batch ? Number(form.active_batch) : null }
    const action = editingId ? updateHouse(editingId, payload) : createHouse(payload)
    action
      .then(() => { setShowModal(false); setEditingId(null); setForm({ name: '', capacity: '', active_batch: '', last_cleaned: '', notes: '' }); load() })
      .catch(err => console.error(err))
      .finally(() => setSaving(false))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this house?')) return
    setDeletingId(id)
    deleteHouse(id)
      .then(() => load())
      .catch(err => console.error(err))
      .finally(() => setDeletingId(null))
  }

  const openCreateModal = () => {
    setForm({ name: '', capacity: '', active_batch: '', last_cleaned: '', notes: '' })
    setEditingId(null)
    setShowModal(true)
  }

  const openEditModal = (house) => {
    setForm({
      name: house.name ?? '',
      capacity: house.capacity ?? '',
      active_batch: house.active_batch ?? '',
      last_cleaned: house.last_cleaned ?? '',
      notes: house.notes ?? ''
    })
    setEditingId(house.id)
    setShowModal(true)
  }

  const available = useMemo(() => houses.filter(h => h.is_available).length, [houses])
  const occupied = useMemo(() => houses.filter(h => !h.is_available).length, [houses])
  const totalCap = useMemo(() => houses.reduce((a, h) => a + h.capacity, 0), [houses])

  const occColor = (pct) => pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-green-500'

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Home className="w-10 h-10 text-green-500 animate-pulse" />
      <span className="text-slate-500 text-sm">Loading housing...</span>
    </div>
  )

  return (
    <div className="max-w-[1100px] w-full mx-auto">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Housing</h1>
          <p className="text-slate-500 text-sm mt-1">Manage houses, occupancy and batch assignments</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add House
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Houses', value: houses.length, icon: <Home className="w-5 h-5" />, color: 'text-[var(--text-primary)]' },
          { label: 'Available', value: available, icon: <Warehouse className="w-5 h-5" />, color: 'text-green-400' },
          { label: 'Occupied', value: occupied, icon: <Users className="w-5 h-5" />, color: 'text-amber-400' },
          { label: 'Total Capacity', value: totalCap, icon: <Sparkles className="w-5 h-5" />, color: 'text-blue-400' },
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

      {/* Houses grid */}
      {houses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-slate-400 text-base font-semibold">No houses yet</p>
          <p className="text-slate-600 text-sm mt-1">Add your first house to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map(house => (
            <div key={house.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:border-green-500/30 transition-all duration-200">
              {/* Card header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">{house.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Capacity: {house.capacity} birds</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${house.is_available ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {house.is_available ? 'Available' : 'Occupied'}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-3 mb-5">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Active Batch</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{house.active_batch ?? 'No batch assigned'}</p>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Occupancy</p>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{house.occupancy_percentage}%</p>
                  </div>
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${occColor(house.occupancy_percentage)}`} style={{ width: `${house.occupancy_percentage}%` }} />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Last Cleaned</p>
                  <p className="text-sm text-slate-400">{house.last_cleaned ?? 'Not recorded'}</p>
                </div>

                {house.notes && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-sm text-slate-400">{house.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                <button onClick={() => openEditModal(house)} className="flex-1 py-2 rounded-xl border border-[var(--border)] text-slate-400 text-xs font-semibold hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent">Edit</button>
                <button onClick={() => handleDelete(house.id)} disabled={deletingId === house.id} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none disabled:opacity-50">
                  {deletingId === house.id ? 'Deleting...' : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add house modal */}
      {showModal && (
        <Modal title={editingId ? 'Edit House' : 'Add House'} onClose={() => { setShowModal(false); setEditingId(null) }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <F label="House Name"><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="House A" required /></F>
              <F label="Capacity"><input className={inp} type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="200" required /></F>
            </div>
            <F label="Active Batch">
              <select className={inp} value={form.active_batch} onChange={e => set('active_batch', e.target.value)}>
                <option value="">No batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </F>
            <F label="Last Cleaned"><input className={inp} type="date" value={form.last_cleaned} onChange={e => set('last_cleaned', e.target.value)} /></F>
            <F label="Notes"><textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." /></F>
              <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null) }} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer disabled:opacity-50">{saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Save House')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}