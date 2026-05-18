import React, { useEffect, useState } from 'react'
import { getBatches } from '../api/index'
import { useTheme } from '../context/ThemeContext'
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function Batches() {
  const { dark } = useTheme()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    initial_count: '',
    current_count: '',
    housing_unit: '',
    start_date: '',
  })

  useEffect(() => {
    getBatches()
      .then(res => {
        setBatches(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newBatch = {
      ...formData,
      initial_count: parseInt(formData.initial_count),
      current_count: parseInt(formData.current_count),
      status: 'active',
      mortality_percentage: 0,
    }
    setBatches(prev => [...prev, { id: prev.length + 1, ...newBatch }])
    setFormData({
      name: '',
      breed: '',
      initial_count: '',
      current_count: '',
      housing_unit: '',
      start_date: '',
    })
    setShowForm(false)
  }

  const handleDelete = (id) => {
    setBatches(prev => prev.filter(b => b.id !== id))
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'harvested':
        return <AlertCircle className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-amber-400" />
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
      <span className="text-slate-500 text-sm">Loading batches...</span>
    </div>
  )

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            All Batches
          </h1>
          <p className="text-slate-500 text-sm mt-1">{batches.length} total batches</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Batch</span>
        </button>
      </div>

      {/* Add Batch Form */}
      {showForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Create New Batch</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Batch name (e.g., Batch-001)"
              value={formData.name}
              onChange={handleInputChange}
              className="col-span-2 px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              name="breed"
              placeholder="Breed (e.g., Layers, Broilers)"
              value={formData.breed}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              name="housing_unit"
              placeholder="Housing Unit"
              value={formData.housing_unit}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              name="initial_count"
              placeholder="Initial count"
              value={formData.initial_count}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="number"
              name="current_count"
              placeholder="Current count"
              value={formData.current_count}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-200"
              >
                Create Batch
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batches Grid */}
      {batches.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <p className="text-slate-500 text-lg">No batches yet. Create your first batch to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {batches.map(batch => (
            <div key={batch.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:border-green-500/50 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{batch.name}</h3>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/20">
                      {getStatusIcon(batch.status)}
                      <span className="text-xs font-semibold text-slate-400 capitalize">{batch.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Breed: <span className="text-slate-400 capitalize">{batch.breed}</span></p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all duration-200">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(batch.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-slate-500/10">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Starting Count</p>
                  <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{batch.initial_count}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-500/10">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Current Count</p>
                  <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{batch.current_count}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-500/10">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Mortality Rate</p>
                  <p className={`text-xl font-bold mt-1 ${(batch.mortality_percentage ?? 0) > 5 ? 'text-red-400' : 'text-green-400'}`}>
                    {batch.mortality_percentage ?? 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-500/10">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Started</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{batch.start_date}</p>
                </div>
              </div>

              {batch.housing_unit && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Housing Unit: <span className="text-slate-400">{batch.housing_unit}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
