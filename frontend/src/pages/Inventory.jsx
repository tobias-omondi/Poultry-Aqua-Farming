import React, { useEffect, useMemo, useState } from 'react'
import {
  Package,
  Plus,
  Trash2,
  ClipboardList,
  ShieldPlus,
  Truck,
  CircleDollarSign,
  Search,
} from 'lucide-react'
import {
  getSuppliers,
  createSupplier,
  deleteSupplier,
  getFeedStock,
  createFeedStock,
  deleteFeedStock,
  getMedications,
  createMedication,
  deleteMedication,
  getPurchaseOrders,
  createPurchaseOrder,
  deletePurchaseOrder,
} from '../api/index'

// Mirrors Supplier.SUPPLY_CATEGORY_CHOICES / PurchaseOrder.ITEM_TYPE_CHOICES
const CATEGORY_CHOICES = [
  ['feed', 'Feed'],
  ['medication', 'Medication'],
  ['equipment', 'Equipment'],
  ['chicks', 'Day-old Chicks'],
  ['other', 'Other'],
]

// Mirrors FeedStock.FEED_TYPE_CHOICES
const FEED_TYPE_CHOICES = [
  ['starter', 'Starter'],
  ['grower', 'Grower'],
  ['finisher', 'Finisher'],
  ['layer_mash', 'Layer Mash'],
]

// Mirrors PurchaseOrder.STATUS_CHOICES
const STATUS_CHOICES = [
  ['pending', 'Pending'],
  ['purchased', 'Purchased'],
  ['cancelled', 'Cancelled'],
]

const STATUS_TINT = {
  pending: 'bg-amber-500/20 text-amber-400',
  purchased: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const tabs = [
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'feed', label: 'Feed Stock' },
  { key: 'medications', label: 'Medications' },
  { key: 'orders', label: 'Orders' },
]

const inputClass = 'w-full bg-panel-soft border border-panel rounded-xl px-3 py-2.5 text-sm text-panel outline-none focus:border-green-500 transition-colors placeholder:text-slate-600'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-panel border border-panel rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-panel">
          <h2 className="text-base font-bold text-panel">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-panel text-2xl leading-none bg-transparent border-none cursor-pointer">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{label}</label>
      {children}
    </div>
  )
}

function SupplierSelect({ suppliers, value, onChange, filterCategory }) {
  const options = filterCategory ? suppliers.filter(s => s.category === filterCategory) : suppliers
  return (
    <select className={inputClass} value={value} onChange={onChange}>
      <option value="">No preferred supplier</option>
      {options.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  )
}

// ---------- Supplier ----------
function SupplierForm({ onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', location: '', category: 'feed', notes: '',
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name"><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></FormField>
        <FormField label="Category">
          <select className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORY_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Phone"><input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FormField>
        <FormField label="Email"><input type="email" className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
      </div>
      <FormField label="Location"><input className={inputClass} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></FormField>
      <FormField label="Notes"><textarea rows={3} className={inputClass} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-panel text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-black hover:bg-green-400 cursor-pointer border-none disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Supplier'}
        </button>
      </div>
    </form>
  )
}

// ---------- Feed Stock ----------
function FeedStockForm({ onClose, onSave, saving, suppliers }) {
  const [form, setForm] = useState({
    feed_type: 'starter', brand: '', quantity_bags: '', kg_per_bag: '50',
    reorder_level: '5', last_restocked: '', preferred_supplier: '',
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Feed type">
          <select className={inputClass} value={form.feed_type} onChange={e => setForm({ ...form, feed_type: e.target.value })}>
            {FEED_TYPE_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="Brand"><input className={inputClass} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Quantity (bags)"><input type="number" className={inputClass} value={form.quantity_bags} onChange={e => setForm({ ...form, quantity_bags: e.target.value })} required /></FormField>
        <FormField label="Kg per bag"><input type="number" step="0.01" className={inputClass} value={form.kg_per_bag} onChange={e => setForm({ ...form, kg_per_bag: e.target.value })} required /></FormField>
        <FormField label="Reorder level"><input type="number" className={inputClass} value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} required /></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Last restocked"><input type="date" className={inputClass} value={form.last_restocked} onChange={e => setForm({ ...form, last_restocked: e.target.value })} /></FormField>
        <FormField label="Preferred supplier">
          <SupplierSelect suppliers={suppliers} filterCategory="feed" value={form.preferred_supplier} onChange={e => setForm({ ...form, preferred_supplier: e.target.value })} />
        </FormField>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-panel text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-black hover:bg-green-400 cursor-pointer border-none disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Feed Stock'}
        </button>
      </div>
    </form>
  )
}

// ---------- Medication ----------
function MedicationForm({ onClose, onSave, saving, suppliers }) {
  const [form, setForm] = useState({
    name: '', quantity: '', unit: '', reorder_level: '2',
    expiry_date: '', preferred_supplier: '', notes: '',
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Name"><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></FormField>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Quantity"><input type="number" className={inputClass} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></FormField>
        <FormField label="Unit"><input className={inputClass} placeholder="vials, ml, tablets" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required /></FormField>
        <FormField label="Reorder level"><input type="number" className={inputClass} value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} required /></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Expiry date"><input type="date" className={inputClass} value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></FormField>
        <FormField label="Preferred supplier">
          <SupplierSelect suppliers={suppliers} filterCategory="medication" value={form.preferred_supplier} onChange={e => setForm({ ...form, preferred_supplier: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Notes"><textarea rows={3} className={inputClass} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-panel text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-black hover:bg-green-400 cursor-pointer border-none disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Medication'}
        </button>
      </div>
    </form>
  )
}

// ---------- Purchase Order ----------
function OrderForm({ onClose, onSave, saving, suppliers }) {
  const [form, setForm] = useState({
    item_type: 'feed', item_name: '', quantity: '', unit: '', supplier: '',
    estimated_cost: '', actual_cost: '', status: 'pending',
    date_needed: '', date_purchased: '', notes: '',
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Item type">
          <select className={inputClass} value={form.item_type} onChange={e => setForm({ ...form, item_type: e.target.value })}>
            {CATEGORY_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="Item name"><input className={inputClass} value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} required /></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Quantity"><input type="number" className={inputClass} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></FormField>
        <FormField label="Unit"><input className={inputClass} placeholder="bags, vials, kg" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required /></FormField>
      </div>
      <FormField label="Supplier">
        <SupplierSelect suppliers={suppliers} value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Estimated cost (KES)"><input type="number" step="0.01" className={inputClass} value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: e.target.value })} /></FormField>
        <FormField label="Actual cost (KES)"><input type="number" step="0.01" className={inputClass} value={form.actual_cost} onChange={e => setForm({ ...form, actual_cost: e.target.value })} /></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Status">
          <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {STATUS_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="Date needed"><input type="date" className={inputClass} value={form.date_needed} onChange={e => setForm({ ...form, date_needed: e.target.value })} /></FormField>
        <FormField label="Date purchased"><input type="date" className={inputClass} value={form.date_purchased} onChange={e => setForm({ ...form, date_purchased: e.target.value })} /></FormField>
      </div>
      <FormField label="Notes"><textarea rows={2} className={inputClass} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-panel text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-black hover:bg-green-400 cursor-pointer border-none disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Order'}
        </button>
      </div>
    </form>
  )
}

export default function Inventory() {
  const [tab, setTab] = useState('suppliers')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [suppliers, setSuppliers] = useState([])
  const [feedStocks, setFeedStocks] = useState([])
  const [medications, setMedications] = useState([])
  const [orders, setOrders] = useState([])

  const loadData = () => {
    setLoading(true)
    Promise.all([getSuppliers(), getFeedStock(), getMedications(), getPurchaseOrders()])
      .then(([suppliersRes, feedRes, medsRes, ordersRes]) => {
        setSuppliers(suppliersRes.data || [])
        setFeedStocks(feedRes.data || [])
        setMedications(medsRes.data || [])
        setOrders(ordersRes.data || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return suppliers
    return suppliers.filter(s => `${s.name} ${s.location}`.toLowerCase().includes(q))
  }, [suppliers, search])

  const stats = useMemo(() => ({
    lowFeed: feedStocks.filter(f => f.is_low).length,
    lowMeds: medications.filter(m => m.is_low).length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
  }), [feedStocks, medications, orders])

  const handleSave = (payload) => {
    setSaving(true)
    const promise =
      modal === 'supplier' ? createSupplier(payload) :
      modal === 'feed' ? createFeedStock(payload) :
      modal === 'medication' ? createMedication(payload) :
      createPurchaseOrder(payload)

    promise.then(() => { setModal(null); loadData() }).finally(() => setSaving(false))
  }

  const remove = (kind, id) => {
    const label = { supplier: 'supplier', feed: 'feed stock entry', medication: 'medication', order: 'order' }[kind]
    if (!window.confirm(`Delete this ${label}?`)) return
    const action = { supplier: deleteSupplier, feed: deleteFeedStock, medication: deleteMedication, order: deletePurchaseOrder }[kind]
    action(id).then(loadData)
  }

  const modalTitle = { supplier: 'Add Supplier', feed: 'Add Feed Stock', medication: 'Add Medication', order: 'Add Order' }[modal]

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-panel tracking-tight">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Track feed, medication, suppliers and purchase orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => setModal('feed')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Feed
          </button>
          <button onClick={() => setModal('medication')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-panel text-slate-300 text-sm font-bold hover:text-panel transition-colors cursor-pointer bg-transparent w-full sm:w-auto">
            <ShieldPlus className="w-4 h-4" /> Medication
          </button>
          <button onClick={() => setModal('supplier')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-panel text-slate-300 text-sm font-bold hover:text-panel transition-colors cursor-pointer bg-transparent w-full sm:w-auto">
            <Truck className="w-4 h-4" /> Supplier
          </button>
          <button onClick={() => setModal('order')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-panel text-slate-300 text-sm font-bold hover:text-panel transition-colors cursor-pointer bg-transparent w-full sm:w-auto">
            <ClipboardList className="w-4 h-4" /> Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Low feed stock', value: stats.lowFeed, icon: <Package className="w-5 h-5" />, tint: 'bg-amber-500/20 text-amber-400' },
          { label: 'Low medication stock', value: stats.lowMeds, icon: <ShieldPlus className="w-5 h-5" />, tint: 'bg-amber-500/20 text-amber-400' },
          { label: 'Pending orders', value: stats.pendingOrders, icon: <CircleDollarSign className="w-5 h-5" />, tint: 'bg-blue-500/20 text-blue-400' },
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

      <div className="mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1 bg-panel border border-panel rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer border-none ${tab === t.key ? 'bg-green-500 text-black' : 'text-slate-400 hover:text-panel bg-transparent'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'suppliers' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers" className="w-full bg-panel-soft border border-panel rounded-xl pl-9 pr-3 py-2.5 text-sm text-panel outline-none focus:border-green-500" />
          </div>
        )}
      </div>

      <div className="bg-panel border border-panel rounded-2xl overflow-hidden">
        {tab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 780 }}>
              <thead>
                <tr>
                  {['Supplier', 'Category', 'Phone', 'Email', 'Location', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map(s => (
                  <tr key={s.id} className="border-b border-panel hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-panel">{s.name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 capitalize">{s.category}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{s.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{s.email || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{s.location || '—'}</td>
                    <td className="px-5 py-3.5"><button onClick={() => remove('supplier', s.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredSuppliers.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No suppliers added yet.</div>}
          </div>
        )}

        {tab === 'feed' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 780 }}>
              <thead>
                <tr>
                  {['Feed type', 'Brand', 'Bags', 'Total kg', 'Reorder at', 'Last restocked', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {feedStocks.map(f => (
                  <tr key={f.id} className={`border-b border-panel hover:bg-white/5 transition-colors ${f.is_low ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-5 py-3.5 text-sm font-medium text-panel capitalize">{f.feed_type?.replace('_', ' ')}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{f.brand || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-panel">{f.quantity_bags}{f.is_low && <span className="ml-2 text-[10px] text-amber-400">low</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{f.total_kg}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{f.reorder_level}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{f.last_restocked || '—'}</td>
                    <td className="px-5 py-3.5"><button onClick={() => remove('feed', f.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && feedStocks.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No feed stock recorded yet.</div>}
          </div>
        )}

        {tab === 'medications' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 780 }}>
              <thead>
                <tr>
                  {['Name', 'Quantity', 'Unit', 'Reorder at', 'Expiry', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {medications.map(m => (
                  <tr key={m.id} className={`border-b border-panel hover:bg-white/5 transition-colors ${m.is_low ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-5 py-3.5 text-sm font-medium text-panel">{m.name}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-panel">{m.quantity}{m.is_low && <span className="ml-2 text-[10px] text-amber-400">low</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{m.unit}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{m.reorder_level}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{m.expiry_date || '—'}</td>
                    <td className="px-5 py-3.5"><button onClick={() => remove('medication', m.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && medications.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No medications recorded yet.</div>}
          </div>
        )}

        {tab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 860 }}>
              <thead>
                <tr>
                  {['Item', 'Type', 'Qty', 'Supplier', 'Est. cost', 'Actual cost', 'Status', 'Needed by', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-panel hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-panel">{o.item_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 capitalize">{o.item_type}</td>
                    <td className="px-5 py-3.5 text-sm text-panel">{o.quantity} {o.unit}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{suppliers.find(s => s.id === o.supplier)?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{o.estimated_cost ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{o.actual_cost ?? '—'}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${STATUS_TINT[o.status]}`}>{o.status}</span></td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{o.date_needed || '—'}</td>
                    <td className="px-5 py-3.5"><button onClick={() => remove('order', o.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && orders.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No orders yet.</div>}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modalTitle} onClose={() => setModal(null)}>
          {modal === 'supplier' && <SupplierForm onClose={() => setModal(null)} saving={saving} onSave={handleSave} />}
          {modal === 'feed' && <FeedStockForm onClose={() => setModal(null)} saving={saving} onSave={handleSave} suppliers={suppliers} />}
          {modal === 'medication' && <MedicationForm onClose={() => setModal(null)} saving={saving} onSave={handleSave} suppliers={suppliers} />}
          {modal === 'order' && <OrderForm onClose={() => setModal(null)} saving={saving} onSave={handleSave} suppliers={suppliers} />}
        </Modal>
      )}
    </div>
  )
}