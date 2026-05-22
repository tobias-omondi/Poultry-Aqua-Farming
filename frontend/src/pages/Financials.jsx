import React, { useEffect, useMemo, useState } from 'react'

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  X,
  Trash2,
} from 'lucide-react'

import {
  getCosts,
  getSales,
  createCost,
  createSale,
  deleteCost,
  deleteSale,
  getBatches,
} from '../api'

const COST_CATEGORIES = [
  'feed',
  'medication',
  'labour',
  'equipment',
  'utilities',
  'transport',
  'other',
]

const EMPTY_COST = {
  batch: '',
  category: 'feed',
  description: '',
  amount: '',
  date: '',
}

const EMPTY_SALE = {
  batch: '',
  description: '',
  amount: '',
  buyer_name: '',
  date: '',
}

const FinancialModal = ({
  type,
  batches,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] =
    useState(false)

  const [form, setForm] = useState(
    type === 'cost'
      ? EMPTY_COST
      : EMPTY_SALE
  )

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const submit = async () => {
    try {
      setLoading(true)

      if (type === 'cost') {
        await createCost(form)
      } else {
        await createSale(form)
      }

      onSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {type === 'cost'
                ? 'Add Expense'
                : 'Add Sale'}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Record a financial
              transaction
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
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Batch
            </label>

            <select
              name="batch"
              value={form.batch}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">
                General Farm Expense
              </option>

              {batches.map((batch) => (
                <option
                  key={batch.id}
                  value={batch.id}
                >
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          {type === 'cost' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              >
                {COST_CATEGORIES.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Description
            </label>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Amount (KES)
            </label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
            />
          </div>

          {type === 'sale' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Buyer Name
              </label>

              <input
                type="text"
                name="buyer_name"
                value={form.buyer_name}
                onChange={handleChange}
                placeholder="Buyer..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
            />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className={`w-full text-white py-3 rounded-2xl font-semibold transition ${
              type === 'cost'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading
              ? 'Saving...'
              : type === 'cost'
              ? 'Save Expense'
              : 'Save Sale'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Financials() {
  const [costs, setCosts] = useState([])
  const [sales, setSales] = useState([])
  const [batches, setBatches] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [modal, setModal] =
    useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)

      const [
        costsRes,
        salesRes,
        batchesRes,
      ] = await Promise.all([
        getCosts(),
        getSales(),
        getBatches(),
      ])

      setCosts(costsRes.data)
      setSales(salesRes.data)
      setBatches(batchesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalExpenses = useMemo(() => {
    return costs.reduce(
      (sum, cost) =>
        sum + Number(cost.amount),
      0
    )
  }, [costs])

  const totalSales = useMemo(() => {
    return sales.reduce(
      (sum, sale) =>
        sum + Number(sale.amount),
      0
    )
  }, [sales])

  const profit =
    totalSales - totalExpenses

  const removeCost = async (id) => {
    const confirmDelete =
      window.confirm(
        'Delete this expense?'
      )

    if (!confirmDelete) return

    try {
      await deleteCost(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const removeSale = async (id) => {
    const confirmDelete =
      window.confirm(
        'Delete this sale?'
      )

    if (!confirmDelete) return

    try {
      await deleteSale(id)
      fetchData()
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
            Financials
          </h1>

          <p className="text-gray-500 mt-2">
            Track expenses, sales,
            and farm profits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setModal('cost')
            }
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Expense
          </button>

          <button
            onClick={() =>
              setModal('sale')
            }
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Sale
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Sales
              </p>

              <h2 className="text-4xl font-bold text-green-600 mt-3">
                KES{' '}
                {totalSales.toLocaleString()}
              </h2>
            </div>

            <div className="bg-green-100 p-4 rounded-2xl">
              <TrendingUp
                size={28}
                className="text-green-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Expenses
              </p>

              <h2 className="text-4xl font-bold text-red-500 mt-3">
                KES{' '}
                {totalExpenses.toLocaleString()}
              </h2>
            </div>

            <div className="bg-red-100 p-4 rounded-2xl">
              <TrendingDown
                size={28}
                className="text-red-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Net Profit
              </p>

              <h2
                className={`text-4xl font-bold mt-3 ${
                  profit >= 0
                    ? 'text-blue-600'
                    : 'text-red-500'
                }`}
              >
                KES{' '}
                {profit.toLocaleString()}
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Wallet
                size={28}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* EXPENSES */}
      <div className="bg-white rounded-3xl border shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Expenses
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4">
                Category
              </th>

              <th className="text-left px-6 py-4">
                Description
              </th>

              <th className="text-left px-6 py-4">
                Amount
              </th>

              <th className="text-left px-6 py-4">
                Date
              </th>

              <th className="text-left px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              costs.map((cost) => (
                <tr
                  key={cost.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4 capitalize">
                    {cost.category}
                  </td>

                  <td className="px-6 py-4">
                    {cost.description}
                  </td>

                  <td className="px-6 py-4 font-semibold text-red-500">
                    KES {cost.amount}
                  </td>

                  <td className="px-6 py-4">
                    {cost.date}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        removeCost(
                          cost.id
                        )
                      }
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* SALES */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Sales
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4">
                Description
              </th>

              <th className="text-left px-6 py-4">
                Buyer
              </th>

              <th className="text-left px-6 py-4">
                Amount
              </th>

              <th className="text-left px-6 py-4">
                Date
              </th>

              <th className="text-left px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    {
                      sale.description
                    }
                  </td>

                  <td className="px-6 py-4">
                    {
                      sale.buyer_name
                    }
                  </td>

                  <td className="px-6 py-4 font-semibold text-green-600">
                    KES {sale.amount}
                  </td>

                  <td className="px-6 py-4">
                    {sale.date}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        removeSale(
                          sale.id
                        )
                      }
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modal && (
        <FinancialModal
          type={modal}
          batches={batches}
          onClose={() =>
            setModal(null)
          }
          onSaved={() => {
            setModal(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}