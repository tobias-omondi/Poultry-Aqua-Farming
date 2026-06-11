import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Package, Pill, ShoppingCart, Truck, AlertTriangle, Loader2 } from 'lucide-react'
import { getFeedStock, getMedications, getPurchaseOrders, getSuppliers, createFeedStock, createMedication } from '../api/index'

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
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default function Inventory() {
  const [feedStock, setFeedStock] = useState([])
  const [medications, setMedications] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('feed')
  const [showFeedModal, setShowFeedModal] = useState(false)
  const [showMedModal, setShowMedModal] = useState(false)
  const [savingFeed, setSavingFeed] = useState(false)
  const [savingMed, setSavingMed] = useState(false)

  const [feedForm, setFeedForm] = useState({ feed_type: 'starter', brand: '', quantity_bags: '', kg_per_bag: 50, reorder_level: 5, last_restocked: '', preferred_supplier: '' })
  const [medForm, setMedForm] = useState({ name: '', quantity: '', unit: 'pcs', expiry_date: '', reorder_level: 2 })

  const load = () => {
    setLoading(true)
    Promise.all([getFeedStock(), getMedications(), getPurchaseOrders(), getSuppliers()]).then(([f, m, p, s]) => {
      setFeedStock(f.data); setMedications(m.data); setPurchaseOrders(p.data); setSuppliers(s.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const lowFeed = useMemo(() => feedStock.filter(f => f.is_low).length, [feedStock])
  const lowMeds = useMemo(() => medications.filter(m => m.is_low).length, [medications])
  const pendingOrders = useMemo(() => purchaseOrders.filter(o => o.status === 'pending').length, [purchaseOrders])

  const handleCreateFeed = (e) => {
    e.preventDefault(); setSavingFeed(true)
    createFeedStock({ ...feedForm, quantity_bags: Number(feedForm.quantity_bags), kg_per_bag: Number(feedForm.kg_per_bag), reorder_level: Number(feedForm.reorder_level), preferred_supplier: feedForm.preferred_supplier || null })
      .then(() => { setShowFeedModal(false); load() }).catch(console.error).finally(() => setSavingFeed(false))
  }

  const handleCreateMed = (e) => {
    e.preventDefault(); setSavingMed(true)
    createMedication({ ...medForm, quantity: Number(medForm.quantity), reorder_level: Number(medForm.reorder_level) })
      .then(() => { setShowMedModal(false); load() }).catch(console.error).finally(() => setSavingMed(false))
  }

  const orderStatusCls = (s) => ({ pending: 'bg-amber-500/20 text-amber-400', purchased: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400' }[s] ?? 'bg-slate-500/20 text-slate-400')

  const tabs = ['feed', 'medications', 'orders', 'suppliers']

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Package className="w-10 h-10 text-green-500 animate-pulse" />
      <span className="text-slate-500 text-sm">Loading inventory...</span>
    </div>
  )

  return (
    <div className="max-w-[1100px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Feed, medications, suppliers and purchase orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFeedModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none">
            <Plus className="w-4 h-4" /> Feed
          </button>
          <button onClick={() => setShowMedModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/30 transition-colors cursor-pointer border-none">
            <Plus className="w-4 h-4" /> Medication
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Feed Types', value: feedStock.length, icon: <Package className="w-5 h-5" />, color: 'text-amber-400' },
          { label: 'Medications', value: medications.length, icon: <Pill className="w-5 h-5" />, color: 'text-blue-400' },
          { label: 'Low Stock', value: lowFeed + lowMeds, icon: <AlertTriangle className="w-5 h-5" />, color: lowFeed + lowMeds > 0 ? 'text-red-400' : 'text-green-400' },
          { label: 'Pending Orders', value: pendingOrders, icon: <ShoppingCart className="w-5 h-5" />, color: 'text-green-400' },
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border-none
              ${tab === t ? 'bg-green-500 text-black' : 'bg-[var(--bg-card)] border border-[var(--border)] text-slate-400 hover:text-[var(--text-primary)]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">

        {/* Feed Stock */}
        {tab === 'feed' && (
          <>
            <div className="px-6 py-4 border-b border-[var(--border)]"><h2 className="text-sm font-bold text-[var(--text-primary)]">Feed Stock</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>{['Feed Type', 'Brand', 'Bags', 'Total KG', 'Reorder At', 'Status'].map(h => <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-widest px-5 py-3 font-semibold border-b border-[var(--border)]">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {feedStock.map(f => (
                    <tr key={f.id} className="border-b border-[var(--border)] hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-[var(--text-primary)] capitalize">{f.feed_type.replace('_', ' ')}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{f.brand || '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-[var(--text-primary)]">{f.quantity_bags}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{f.total_kg} kg</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{f.reorder_level} bags</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${f.is_low ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {f.is_low ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {feedStock.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No feed stock recorded yet.</div>}
            </div>
          </>
        )}

        {/* Medications */}
        {tab === 'medications' && (
          <>
            <div className="px-6 py-4 border-b border-[var(--border)]"><h2 className="text-sm font-bold text-[var(--text-primary)]">Medications</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>{['Name', 'Quantity', 'Unit', 'Expiry', 'Status'].map(h => <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-widest px-5 py-3 font-semibold border-b border-[var(--border)]">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {medications.map(m => (
                    <tr key={m.id} className="border-b border-[var(--border)] hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-[var(--text-primary)]">{m.name}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-[var(--text-primary)]">{m.quantity}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{m.unit}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{m.expiry_date || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${m.is_low ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {m.is_low ? 'Low' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {medications.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No medications recorded yet.</div>}
            </div>
          </>
        )}

        {/* Purchase Orders */}
        {tab === 'orders' && (
          <>
            <div className="px-6 py-4 border-b border-[var(--border)]"><h2 className="text-sm font-bold text-[var(--text-primary)]">Purchase Orders</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>{['Item', 'Type', 'Quantity', 'Est. Cost', 'Date Needed', 'Status'].map(h => <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-widest px-5 py-3 font-semibold border-b border-[var(--border)]">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {purchaseOrders.map(o => (
                    <tr key={o.id} className="border-b border-[var(--border)] hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-[var(--text-primary)]">{o.item_name}</td>
                      <td className="px-5 py-3.5 text-sm capitalize text-slate-400">{o.item_type}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{o.quantity} {o.unit}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-[var(--text-primary)]">{o.estimated_cost ? `KES ${Number(o.estimated_cost).toLocaleString()}` : '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{o.date_needed || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${orderStatusCls(o.status)}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {purchaseOrders.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No purchase orders yet.</div>}
            </div>
          </>
        )}

        {/* Suppliers */}
        {tab === 'suppliers' && (
          <>
            <div className="px-6 py-4 border-b border-[var(--border)]"><h2 className="text-sm font-bold text-[var(--text-primary)]">Suppliers</h2></div>
            {suppliers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No suppliers added yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {suppliers.map(s => (
                  <div key={s.id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 hover:border-green-500/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">{s.name}</h3>
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{s.category}</p>
                      </div>
                      <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Truck className="w-4 h-4" /></span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                      {s.phone && <span>📞 {s.phone}</span>}
                      {s.email && <span>✉️ {s.email}</span>}
                      {s.location && <span>📍 {s.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Feed Modal */}
      {showFeedModal && (
        <Modal title="Add Feed Stock" onClose={() => setShowFeedModal(false)}>
          <form onSubmit={handleCreateFeed} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <F label="Feed Type">
                <select className={inp} value={feedForm.feed_type} onChange={e => setFeedForm(f => ({ ...f, feed_type: e.target.value }))}>
                  {['starter', 'grower', 'finisher', 'layer_mash'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </F>
              <F label="Brand"><input className={inp} value={feedForm.brand} onChange={e => setFeedForm(f => ({ ...f, brand: e.target.value }))} placeholder="Unga Farm Care" /></F>
              <F label="Bags"><input className={inp} type="number" value={feedForm.quantity_bags} onChange={e => setFeedForm(f => ({ ...f, quantity_bags: e.target.value }))} placeholder="10" required /></F>
              <F label="KG per Bag"><input className={inp} type="number" value={feedForm.kg_per_bag} onChange={e => setFeedForm(f => ({ ...f, kg_per_bag: e.target.value }))} /></F>
              <F label="Reorder Level"><input className={inp} type="number" value={feedForm.reorder_level} onChange={e => setFeedForm(f => ({ ...f, reorder_level: e.target.value }))} /></F>
              <F label="Last Restocked"><input className={inp} type="date" value={feedForm.last_restocked} onChange={e => setFeedForm(f => ({ ...f, last_restocked: e.target.value }))} /></F>
            </div>
            <F label="Supplier">
              <select className={inp} value={feedForm.preferred_supplier} onChange={e => setFeedForm(f => ({ ...f, preferred_supplier: e.target.value }))}>
                <option value="">No supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </F>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowFeedModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
              <button type="submit" disabled={savingFeed} className="flex-1 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                {savingFeed ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Feed'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Med Modal */}
      {showMedModal && (
        <Modal title="Add Medication" onClose={() => setShowMedModal(false)}>
          <form onSubmit={handleCreateMed} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <F label="Name"><input className={inp} value={medForm.name} onChange={e => setMedForm(f => ({ ...f, name: e.target.value }))} placeholder="Newcastle vaccine" required /></F>
              <F label="Quantity"><input className={inp} type="number" value={medForm.quantity} onChange={e => setMedForm(f => ({ ...f, quantity: e.target.value }))} placeholder="10" required /></F>
              <F label="Unit">
                <select className={inp} value={medForm.unit} onChange={e => setMedForm(f => ({ ...f, unit: e.target.value }))}>
                  {['pcs', 'vials', 'sachets', 'bottles', 'boxes', 'litres'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </F>
              <F label="Reorder Level"><input className={inp} type="number" value={medForm.reorder_level} onChange={e => setMedForm(f => ({ ...f, reorder_level: e.target.value }))} /></F>
              <F label="Expiry Date"><input className={inp} type="date" value={medForm.expiry_date} onChange={e => setMedForm(f => ({ ...f, expiry_date: e.target.value }))} /></F>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowMedModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
              <button type="submit" disabled={savingMed} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                {savingMed ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Medication'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}