import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, X } from 'lucide-react'
import { getCosts, getSales, createCost, createSale, deleteCost, deleteSale, getBatches } from '../api/index'

const CATEGORIES = ['feed', 'medication', 'labour', 'equipment', 'utilities', 'transport', 'other']
const inp = "w-full bg-panel-soft border border-panel rounded-xl px-3 py-2.5 text-sm text-panel outline-none focus:border-green-500 transition-colors placeholder:text-slate-600"

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
      <div className="relative bg-panel border border-panel rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-panel">
          <h2 className="text-base font-bold text-panel">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-panel text-2xl leading-none cursor-pointer bg-transparent border-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function TransactionForm({ type, batches, onSave, onClose, saving }) {
  const [form, setForm] = useState(type === 'cost'
    ? { batch: '', category: 'feed', description: '', amount: '', date: '' }
    : { batch: '', description: '', amount: '', buyer_name: '', date: '' }
  )
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <F label="Batch">
        <select className={inp} value={form.batch} onChange={e => set('batch', e.target.value)}>
          <option value="">General Farm (no batch)</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </F>
      {type === 'cost' && (
        <F label="Category">
          <select className={inp} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </F>
      )}
      <F label="Description"><input className={inp} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description..." required /></F>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Amount (KES)"><input className={inp} type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" required /></F>
        <F label="Date"><input className={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} required /></F>
      </div>
      {type === 'sale' && <F label="Buyer Name"><input className={inp} value={form.buyer_name} onChange={e => set('buyer_name', e.target.value)} placeholder="Buyer name..." /></F>}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-panel text-slate-400 text-sm font-semibold cursor-pointer bg-transparent">Cancel</button>
        <button type="submit" disabled={saving}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer border-none disabled:opacity-50 ${type === 'cost' ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-green-500 text-black hover:bg-green-400'}`}>
          {saving ? 'Saving...' : type === 'cost' ? 'Save Expense' : 'Save Sale'}
        </button>
      </div>
    </form>
  )
}

export default function Financials() {
  const [costs, setCosts] = useState([])
  const [sales, setSales] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('expenses')

  const load = () => {
    setLoading(true)
    Promise.all([getCosts(), getSales(), getBatches()]).then(([c, s, b]) => {
      setCosts(c.data); setSales(s.data); setBatches(b.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const totalExpenses = useMemo(() => costs.reduce((a, c) => a + Number(c.amount), 0), [costs])
  const totalSales = useMemo(() => sales.reduce((a, s) => a + Number(s.amount), 0), [sales])
  const profit = totalSales - totalExpenses

  const handleSave = (form) => {
    setSaving(true)
    const fn = modal === 'cost' ? createCost : createSale
    fn(form).then(() => { setModal(null); load() }).finally(() => setSaving(false))
  }

  const handleDeleteCost = (id) => { if (window.confirm('Delete this expense?')) deleteCost(id).then(load) }
  const handleDeleteSale = (id) => { if (window.confirm('Delete this sale?')) deleteSale(id).then(load) }

  const catColor = (cat) => ({
    feed: 'bg-amber-500/20 text-amber-400',
    medication: 'bg-blue-500/20 text-blue-400',
    labour: 'bg-purple-500/20 text-purple-400',
    equipment: 'bg-slate-500/20 text-slate-400',
    utilities: 'bg-cyan-500/20 text-cyan-400',
    transport: 'bg-orange-500/20 text-orange-400',
    other: 'bg-slate-500/20 text-slate-400',
  }[cat] ?? 'bg-slate-500/20 text-slate-400')

  return (
    <div className="max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-panel tracking-tight">Financials</h1>
          <p className="text-slate-500 text-sm mt-1">Track expenses, sales and farm profits</p>
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <button onClick={() => setModal('cost')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-colors cursor-pointer border-none w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Expense
          </button>
          <button onClick={() => setModal('sale')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-colors cursor-pointer border-none w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Sale
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sales', value: `KES ${totalSales.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-400', iconBg: 'bg-green-500/20 text-green-400' },
          { label: 'Total Expenses', value: `KES ${totalExpenses.toLocaleString()}`, icon: <TrendingDown className="w-5 h-5" />, color: 'text-red-400', iconBg: 'bg-red-500/20 text-red-400' },
          { label: 'Net Profit', value: `KES ${profit.toLocaleString()}`, icon: <Wallet className="w-5 h-5" />, color: profit >= 0 ? 'text-green-400' : 'text-red-400', iconBg: 'bg-blue-500/20 text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="bg-panel border border-panel rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{s.label}</span>
              <span className={`p-2 rounded-xl ${s.iconBg}`}>{s.icon}</span>
            </div>
            <div className={`text-2xl font-extrabold tracking-tight ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        {['expenses', 'sales'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all cursor-pointer border-none
              ${tab === t ? 'bg-green-500 text-black' : 'bg-panel border border-panel text-slate-400 hover:text-panel'}`}>
            {t} <span className="opacity-60 ml-1">({t === 'expenses' ? costs.length : sales.length})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-panel border border-panel rounded-2xl overflow-hidden">
        {tab === 'expenses' ? (
          <>
            <div className="px-6 py-4 border-b border-panel">
              <h2 className="text-sm font-bold text-panel">Expenses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    {['Category', 'Description', 'Batch', 'Amount', 'Date', ''].map(h => (
                      <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-widest px-5 py-3 font-semibold border-b border-panel">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!loading && costs.map(c => (
                    <tr key={c.id} className="border-b border-panel hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5"><span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${catColor(c.category)}`}>{c.category}</span></td>
                      <td className="px-5 py-3.5 text-sm text-panel">{c.description}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{c.batch ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-red-400">KES {Number(c.amount).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{c.date}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleDeleteCost(c.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && costs.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No expenses yet.</div>}
            </div>
          </>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-panel">
              <h2 className="text-sm font-bold text-panel">Sales</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    {['Description', 'Buyer', 'Batch', 'Amount', 'Date', ''].map(h => (
                      <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-widest px-5 py-3 font-semibold border-b border-panel">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!loading && sales.map(s => (
                    <tr key={s.id} className="border-b border-panel hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-panel">{s.description}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{s.buyer_name || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{s.batch ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-green-400">KES {Number(s.amount).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{s.date}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleDeleteSale(s.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer border-none"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && sales.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No sales yet.</div>}
            </div>
          </>
        )}
      </div>

      {modal && <Modal title={modal === 'cost' ? 'Add Expense' : 'Add Sale'} onClose={() => setModal(null)}>
        <TransactionForm type={modal} batches={batches} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />
      </Modal>}
    </div>
  )
}