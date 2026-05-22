import React, { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  X,
  Egg,
  Bird,
  Activity,
} from 'lucide-react'

import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getDailyLogs,
} from '../api'

const STATUS_COLORS = {
  active:
    'bg-green-100 text-green-700 border border-green-200',

  harvested:
    'bg-blue-100 text-blue-700 border border-blue-200',

  closed:
    'bg-orange-100 text-orange-700 border border-orange-200',
}

const BREEDS = [
  'kienyeji',
  'broiler',
  'layer',
]

const EMPTY_FORM = {
  name: '',
  breed: 'kienyeji',
  initial_count: '',
  current_count: '',
  purchase_cost: '',
  start_date: '',
  end_date: '',
  status: 'active',
  notes: '',
}

const BatchModal = ({
  batch,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState(
    batch || EMPTY_FORM
  )

  const [loading, setLoading] =
    useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const submit = async () => {
    try {
      setLoading(true)

      if (batch?.id) {
        await updateBatch(batch.id, form)
      } else {
        await createBatch(form)
      }

      onSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {batch
                ? 'Edit Batch'
                : 'Create Batch'}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage your poultry batch
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Batch Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Batch #1"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Breed
            </label>

            <select
              name="breed"
              value={form.breed}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              {BREEDS.map((breed) => (
                <option
                  key={breed}
                  value={breed}
                >
                  {breed}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Initial Count
              </label>

              <input
                type="number"
                name="initial_count"
                value={form.initial_count}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Current Count
              </label>

              <input
                type="number"
                name="current_count"
                value={form.current_count}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Purchase Cost
            </label>

            <input
              type="number"
              name="purchase_cost"
              value={form.purchase_cost}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Start Date
              </label>

              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                End Date
              </label>

              <input
                type="date"
                name="end_date"
                value={form.end_date || ''}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">
                Active
              </option>

              <option value="harvested">
                Harvested
              </option>

              <option value="closed">
                Closed
              </option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Notes
            </label>

            <textarea
              rows={4}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3 font-semibold transition"
          >
            {loading
              ? 'Saving...'
              : batch
              ? 'Update Batch'
              : 'Create Batch'}
          </button>
        </div>
      </div>
    </div>
  )
}

const LogsDrawer = ({
  batch,
  onClose,
}) => {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    getDailyLogs(batch.id)
      .then((res) =>
        setLogs(res.data)
      )
      .catch((err) =>
        console.error(err)
      )
  }, [batch.id])

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Daily Logs
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {batch.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {logs.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList
                size={50}
                className="mx-auto text-gray-300 mb-4"
              />

              <p className="text-gray-500">
                No logs found
              </p>
            </div>
          )}

          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">
                  {log.date}
                </h3>

                {log.deaths > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-semibold">
                    {log.deaths} deaths
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Feed Consumed:{' '}
                  <span className="font-semibold">
                    {
                      log.feed_consumed_kg
                    }{' '}
                    kg
                  </span>
                </p>

                <p>
                  Avg Weight:{' '}
                  <span className="font-semibold">
                    {
                      log.average_weight_kg
                    }{' '}
                    kg
                  </span>
                </p>
              </div>

              {log.notes && (
                <div className="mt-4 text-sm text-gray-500 italic border-t pt-3">
                  {log.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const Batches = () => {
  const [batches, setBatches] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [modal, setModal] =
    useState(null)

  const [logsBatch, setLogsBatch] =
    useState(null)

  const fetchBatches = async () => {
    try {
      setLoading(true)

      const res = await getBatches()

      setBatches(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  const removeBatch = async (id) => {
    const confirmDelete =
      window.confirm(
        'Delete this batch permanently?'
      )

    if (!confirmDelete) return

    try {
      await deleteBatch(id)
      fetchBatches()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Poultry Batches
          </h1>

          <p className="text-gray-500 mt-2">
            Manage and track your
            poultry farming batches
          </p>
        </div>

        <button
          onClick={() => setModal({})}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          New Batch
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Batches
              </p>

              <h2 className="text-4xl font-bold text-gray-800 mt-3">
                {batches.length}
              </h2>
            </div>

            <div className="bg-green-100 p-4 rounded-2xl">
              <Egg
                className="text-green-600"
                size={28}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Batches
              </p>

              <h2 className="text-4xl font-bold text-green-600 mt-3">
                {
                  batches.filter(
                    (b) =>
                      b.status ===
                      'active'
                  ).length
                }
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Bird
                className="text-blue-600"
                size={28}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Birds
              </p>

              <h2 className="text-4xl font-bold text-orange-600 mt-3">
                {batches.reduce(
                  (sum, batch) =>
                    sum +
                    batch.current_count,
                  0
                )}
              </h2>
            </div>

            <div className="bg-orange-100 p-4 rounded-2xl">
              <Activity
                className="text-orange-600"
                size={28}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Batch
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Breed
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Birds
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Mortality
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              batches.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-5">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {batch.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Started:{' '}
                        {
                          batch.start_date
                        }
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 capitalize text-gray-700">
                    {batch.breed}
                  </td>

                  <td className="px-6 py-5 font-semibold text-gray-800">
                    {
                      batch.current_count
                    }
                  </td>

                  <td className="px-6 py-5 text-gray-700">
                    {
                      batch.mortality_percentage
                    }
                    %
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[batch.status]}`}
                    >
                      {batch.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setLogsBatch(
                            batch
                          )
                        }
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition"
                      >
                        <ClipboardList
                          size={18}
                        />
                      </button>

                      <button
                        onClick={() =>
                          setModal(batch)
                        }
                        className="text-green-600 hover:bg-green-50 p-2 rounded-xl transition"
                      >
                        <Pencil
                          size={18}
                        />
                      </button>

                      <button
                        onClick={() =>
                          removeBatch(
                            batch.id
                          )
                        }
                        className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {modal !== null && (
        <BatchModal
          batch={
            modal.id
              ? modal
              : null
          }
          onClose={() =>
            setModal(null)
          }
          onSaved={() => {
            setModal(null)
            fetchBatches()
          }}
        />
      )}

      {logsBatch && (
        <LogsDrawer
          batch={logsBatch}
          onClose={() =>
            setLogsBatch(null)
          }
        />
      )}
    </div>
  )
}

export default Batches