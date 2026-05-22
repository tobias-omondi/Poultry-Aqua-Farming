import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Home,
  Warehouse,
  Users,
  Sparkles,
  Plus,
  X,
  Trash2,
} from 'lucide-react'

import {
  getHouses,
  getBatches,
} from '../api'

export default function Housing() {
  const [houses, setHouses] =
    useState([])

  const [batches, setBatches] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [showModal, setShowModal] =
    useState(false)

  const [formData, setFormData] =
    useState({
      name: '',
      capacity: '',
      active_batch: '',
      last_cleaned: '',
      notes: '',
    })

  const fetchHousing = async () => {
    try {
      setLoading(true)

      const [
        housesRes,
        batchesRes,
      ] = await Promise.all([
        getHouses(),
        getBatches(),
      ])

      setHouses(housesRes.data)
      setBatches(batchesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHousing()
  }, [])

  const availableHouses =
    useMemo(() => {
      return houses.filter(
        (house) =>
          house.is_available
      ).length
    }, [houses])

  const occupiedHouses =
    useMemo(() => {
      return houses.filter(
        (house) =>
          !house.is_available
      ).length
    }, [houses])

  const totalCapacity =
    useMemo(() => {
      return houses.reduce(
        (acc, house) =>
          acc + house.capacity,
        0
      )
    }, [houses])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    })
  }

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault()

    alert(
      'Create house endpoint not connected yet'
    )

    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Housing
          </h1>

          <p className="text-gray-500 mt-2">
            Manage poultry houses,
            occupancy and cleaning
          </p>
        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Add House
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Houses
              </p>

              <h2 className="text-4xl font-bold text-gray-800 mt-3">
                {houses.length}
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Home
                size={28}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Available
              </p>

              <h2 className="text-4xl font-bold text-green-600 mt-3">
                {availableHouses}
              </h2>
            </div>

            <div className="bg-green-100 p-4 rounded-2xl">
              <Warehouse
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
                Occupied
              </p>

              <h2 className="text-4xl font-bold text-orange-600 mt-3">
                {occupiedHouses}
              </h2>
            </div>

            <div className="bg-orange-100 p-4 rounded-2xl">
              <Users
                size={28}
                className="text-orange-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Capacity
              </p>

              <h2 className="text-4xl font-bold text-purple-600 mt-3">
                {totalCapacity}
              </h2>
            </div>

            <div className="bg-purple-100 p-4 rounded-2xl">
              <Sparkles
                size={28}
                className="text-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* HOUSES */}
      <div className="grid grid-cols-3 gap-6">
        {!loading &&
          houses.map((house) => (
            <div
              key={house.id}
              className="bg-white rounded-3xl border shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {house.name}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Capacity:{' '}
                    {
                      house.capacity
                    }{' '}
                    birds
                  </p>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    house.is_available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {house.is_available
                    ? 'Available'
                    : 'Occupied'}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Active Batch
                  </p>

                  <p className="font-semibold text-gray-800">
                    {house.active_batch ||
                      'No batch assigned'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">
                      Occupancy
                    </p>

                    <p className="font-semibold text-gray-700">
                      {
                        house.occupancy_percentage
                      }
                      %
                    </p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        house.occupancy_percentage >
                        85
                          ? 'bg-red-500'
                          : house.occupancy_percentage >
                            60
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${house.occupancy_percentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Last Cleaned
                  </p>

                  <p className="font-medium text-gray-700">
                    {house.last_cleaned ||
                      'Not recorded'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Notes
                  </p>

                  <p className="text-gray-700">
                    {house.notes ||
                      'No notes'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-medium transition">
                  Edit
                </button>

                <button className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-2xl transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 relative">
            <button
              onClick={() =>
                setShowModal(false)
              }
              className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add House
            </h2>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  House Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="House A"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={
                    formData.capacity
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="500"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Active Batch
                </label>

                <select
                  name="active_batch"
                  value={
                    formData.active_batch
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">
                    Select batch
                  </option>

                  {batches.map(
                    (batch) => (
                      <option
                        key={
                          batch.id
                        }
                        value={
                          batch.id
                        }
                      >
                        {
                          batch.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Cleaned
                </label>

                <input
                  type="date"
                  name="last_cleaned"
                  value={
                    formData.last_cleaned
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>

                <textarea
                  rows="4"
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Extra notes..."
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition"
              >
                Save House
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}