import React, { useEffect, useMemo, useState } from 'react'
import {
  Package,
  Plus,
  Trash2,
  ClipboardList,
  ShieldPlus,
  Truck,
  CircleDollarSign,
  X,
  Search,
} from 'lucide-react'
import {
  getInventory,
  getOrders,
  getSuppliers,
  createInventoryItem,
  createSupplier,
  createOrder,
  deleteInventoryItem,
  deleteOrder,
  deleteSupplier,
  getBatches,
} from '../api/index'

const inventoryTabs = [
  { key: 'items', label: 'Inventory' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'orders', label: 'Orders' },
]

const inputClass = 'w-full bg-panel-soft border border-panel rounded-xl px-3 py-2.5 text-sm text-panel outline-none focus:border-green-500 transition-colors placeholder:text-slate-600'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-panel border border-panel rounded-2xl shadow-2xl overflow-hidden">
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

function InventoryForm({ onClose, onSave, saving, batches }) {
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    unit: 'bags',
    batch: '',
    location: '',
    min_stock: '',
  })

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name"><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></FormField>
        <FormField label="Batch"><select className={inputClass} value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}>
          <option value="">General stock</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Quantity"><input type="number" className={inputClass} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></FormField>
        <FormField label="Unit"><input className={inputClass} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required /></FormField>
        <FormField label="Min stock"><input type="number" className={inputClass} value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} required /></FormField>
      </div>
      <FormField label="Location"><input className={inputClass} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required /></FormField>
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-panel text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-black hover:bg-green-400 cursor-pointer border-none disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Item'}
        </button>
      </div>
    </form>
  )
}

function SupplierForm({ onClose, onSave, saving }) {
  const [form, setForm] = useState({ name: '', phone: '', contact_person: '', address: '' })

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <FormField label="Supplier name"><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Phone"><input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FormField>
        <FormField label="Contact person"><input className={inputClass} value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} /></FormField>
      </div>
      <FormField label="Address"><textarea rows={3} className={inputClass} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></FormField>
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-panel text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-black hover:bg-green-400 cursor-pointer border-none disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Supplier'}
        </button>
      </div>
    </form>
  )
}

function OrderForm({ onClose, onSave, saving }) {
  const [form, setForm] = useState({ item_name: '', supplier: '', quantity: '', status: 'pending', due_date: '' })

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Item name"><input className={inputClass} value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} required /></FormField>
        <FormField label="Supplier"><input className={inputClass} value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} required /></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Quantity"><input type="number" className={inputClass} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></FormField>
        <FormField label="Status"><select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="pending">Pending</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select></FormField>
      </div>
      <FormField label="Due date"><input type="date" className={inputClass} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></FormField>
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
  const [tab, setTab] = useState('items')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [batches, setBatches] = useState([])

  const loadData = () => {
    setLoading(true)
    Promise.all([getInventory(), getSuppliers(), getOrders(), getBatches()])
      .then(([inventory, suppliersRes, ordersRes, batchesRes]) => {
        setItems(inventory.data || [])
        setSuppliers(suppliersRes.data || [])
        setOrders(ordersRes.data || [])
        setBatches(batchesRes.data || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(item => `${item.name} ${item.location}`.toLowerCase().includes(q))
  }, [items, search])

  const stats = useMemo(() => ({
    stock: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    low: items.filter(item => Number(item.quantity || 0) <= Number(item.min_stock || 0)).length,
    orders: orders.filter(o => o.status === 'pending').length,
  }), [items, orders])

  const handleSave = (payload) => {
    setSaving(true)
    const promise = modal === 'item'
      ? createInventoryItem(payload)
      : modal === 'supplier'
        ? createSupplier(payload)
        : createOrder(payload)

    promise.then(() => { setModal(null); loadData() }).finally(() => setSaving(false))
  }

  const deleteItem = (id) => {
    if (window.confirm('Delete this inventory item?')) deleteInventoryItem(id).then(loadData)
  }
  const deleteSupplierRecord = (id) => {
    if (window.confirm('Delete this supplier?')) deleteSupplier(id).then(loadData)
  }
  const deleteOrderRecord = (id) => {
    if (window.confirm('Delete this order?')) deleteOrder(id).then(loadData)
  }

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-panel tracking-tight">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Track feed, health supplies, suppliers and orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => setModal('item')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Item
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
        {[{ label: 'Total stock', value: stats.stock, icon: <Package className="w-5 h-5" />, tint: 'bg-emerald-500/20 text-emerald-400' }, { label: 'Low stock', value: stats.low, icon: <ShieldPlus className="w-5 h-5" />, tint: 'bg-amber-500/20 text-amber-400' }, { label: 'Pending orders', value: stats.orders, icon: <CircleDollarSign className="w-5 h-5" />, tint: 'bg-blue-500/20 text-blue-400' }].map((s, i) => (
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
        <div className="flex gap-1 bg-panel border border-panel rounded-xl p-1 w-full sm:w-auto">
          {inventoryTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize cursor-pointer border-none ${tab === t.key ? 'bg-green-500 text-black' : 'text-slate-400 hover:text-panel bg-transparent'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'items' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items" className="w-full bg-panel-soft border border-panel rounded-xl pl-9 pr-3 py-2.5 text-sm text-panel outline-none focus:border-green-500" />
          </div>
        )}
      </div>

      <div className="bg-panel border border-panel rounded-2xl overflow-hidden">
        {tab === 'items' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  {['Item', 'Location', 'Qty', 'Unit', 'Min stock', 'Batch', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-b border-panel hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-panel">{item.name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{item.location}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-panel">{item.quantity}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{item.unit}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{item.min_stock}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{item.batch_name || item.batch || '—'}</td>
                    <td className="px-5 py-3.5"><button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredItems.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No inventory items found.</div>}
          </div>
        )}

        {tab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  {['Supplier', 'Phone', 'Contact', 'Address', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id} className="border-b border-panel hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-panel">{s.name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{s.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{s.contact_person || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{s.address || '—'}</td>
                    <td className="px-5 py-3.5"><button onClick={() => deleteSupplierRecord(s.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && suppliers.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No suppliers added yet.</div>}
          </div>
        )}

        {tab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  {['Item', 'Supplier', 'Qty', 'Status', 'Due date', ''].map(h => <th key={h} className="text-left text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 font-semibold border-b border-panel">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-panel hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-panel">{o.item_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{o.supplier}</td>
                    <td className="px-5 py-3.5 text-sm text-panel">{o.quantity}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${o.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : o.status === 'received' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{o.status}</span></td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{o.due_date || '—'}</td>
                    <td className="px-5 py-3.5"><button onClick={() => deleteOrderRecord(o.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && orders.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No orders yet.</div>}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'item' ? 'Add Inventory Item' : modal === 'supplier' ? 'Add Supplier' : 'Add Order'} onClose={() => setModal(null)}>
          {modal === 'item' ? (
            <InventoryForm onClose={() => setModal(null)} batches={batches} saving={saving} onSave={handleSave} />
          ) : modal === 'supplier' ? (
            <SupplierForm onClose={() => setModal(null)} saving={saving} onSave={handleSave} />
          ) : (
            <OrderForm onClose={() => setModal(null)} saving={saving} onSave={handleSave} />
          )}
        </Modal>
      )}
    </div>
  )
}