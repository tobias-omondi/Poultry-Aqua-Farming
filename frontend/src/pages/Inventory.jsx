import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Package,
  Pill,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Plus,
  Loader2,
} from 'lucide-react'

import {
  getFeedStock,
  getMedications,
  getPurchaseOrders,
  getSuppliers,
  createFeedStock,
  createMedication,
} from '../api'

export default function Inventory() {
  const [feedStock, setFeedStock] =
    useState([])

  const [medications, setMedications] =
    useState([])

  const [purchaseOrders, setPurchaseOrders] =
    useState([])

  const [suppliers, setSuppliers] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [showFeedModal, setShowFeedModal] =
    useState(false)

  const [showMedModal, setShowMedModal] =
    useState(false)

  const [savingFeed, setSavingFeed] =
    useState(false)

  const [savingMed, setSavingMed] =
    useState(false)

  const [feedForm, setFeedForm] =
    useState({
      feed_type: 'starter',
      brand: '',
      quantity_bags: '',
      kg_per_bag: 50,
      reorder_level: 5,
      last_restocked: '',
      preferred_supplier: '',
    })

  const [medForm, setMedForm] =
    useState({
      name: '',
      quantity: '',
      unit: 'pcs',
      expiry_date: '',
    })

  const fetchInventory = async () => {
    try {
      setLoading(true)

      const [
        feedRes,
        medsRes,
        poRes,
        supplierRes,
      ] = await Promise.all([
        getFeedStock(),
        getMedications(),
        getPurchaseOrders(),
        getSuppliers(),
      ])

      setFeedStock(feedRes.data)
      setMedications(medsRes.data)
      setPurchaseOrders(poRes.data)
      setSuppliers(supplierRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const lowFeed = useMemo(() => {
    return feedStock.filter(
      (item) => item.is_low
    ).length
  }, [feedStock])

  const lowMeds = useMemo(() => {
    return medications.filter(
      (item) => item.is_low
    ).length
  }, [medications])

  const pendingOrders = useMemo(() => {
    return purchaseOrders.filter(
      (order) =>
        order.status === 'pending'
    ).length
  }, [purchaseOrders])

  const handleFeedChange = (e) => {
    setFeedForm({
      ...feedForm,
      [e.target.name]:
        e.target.value,
    })
  }

  const handleMedChange = (e) => {
    setMedForm({
      ...medForm,
      [e.target.name]:
        e.target.value,
    })
  }

  const handleCreateFeed =
    async (e) => {
      e.preventDefault()

      try {
        setSavingFeed(true)

        await createFeedStock({
          ...feedForm,
          quantity_bags:
            Number(
              feedForm.quantity_bags
            ),
          kg_per_bag: Number(
            feedForm.kg_per_bag
          ),
          reorder_level: Number(
            feedForm.reorder_level
          ),
          preferred_supplier:
            feedForm.preferred_supplier ||
            null,
        })

        setShowFeedModal(false)

        setFeedForm({
          feed_type: 'starter',
          brand: '',
          quantity_bags: '',
          kg_per_bag: 50,
          reorder_level: 5,
          last_restocked: '',
          preferred_supplier: '',
        })

        fetchInventory()
      } catch (err) {
        console.error(err)
      } finally {
        setSavingFeed(false)
      }
    }

  const handleCreateMedication =
    async (e) => {
      e.preventDefault()

      try {
        setSavingMed(true)

        await createMedication({
          ...medForm,
          quantity: Number(
            medForm.quantity
          ),
        })

        setShowMedModal(false)
        setMedForm({
          name: '',
          quantity: '',
          unit: 'pcs',
          expiry_date: '',
        })
        fetchInventory()
      } catch (err) {
        console.error(err)
      } finally {
        setSavingMed(false)
      }
    }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Inventory
          </h1>

          <p className="text-gray-500 mt-2">
            Manage feed,
            medications,
            suppliers and
            purchase orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setShowFeedModal(true)
            }
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 transition"
          >
            <Plus size={18} />
            Add Feed
          </button>

          <button
            onClick={() =>
              setShowMedModal(true)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 transition"
          >
            <Plus size={18} />
            Add Medication
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Feed Types
              </p>

              <h2 className="text-4xl font-bold text-gray-800 mt-3">
                {feedStock.length}
              </h2>
            </div>

            <div className="bg-orange-100 p-4 rounded-2xl">
              <Package
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
                Medications
              </p>

              <h2 className="text-4xl font-bold text-blue-600 mt-3">
                {
                  medications.length
                }
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Pill
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
                Low Stock
              </p>

              <h2 className="text-4xl font-bold text-red-500 mt-3">
                {lowFeed + lowMeds}
              </h2>
            </div>

            <div className="bg-red-100 p-4 rounded-2xl">
              <AlertTriangle
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
                Pending Orders
              </p>

              <h2 className="text-4xl font-bold text-green-600 mt-3">
                {pendingOrders}
              </h2>
            </div>

            <div className="bg-green-100 p-4 rounded-2xl">
              <ShoppingCart
                size={28}
                className="text-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FEED STOCK */}
      <div className="bg-white rounded-3xl border shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Feed Stock
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Current feed
            inventory
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4">
                  Feed Type
                </th>

                <th className="text-left px-6 py-4">
                  Brand
                </th>

                <th className="text-left px-6 py-4">
                  Bags
                </th>

                <th className="text-left px-6 py-4">
                  Total KG
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                feedStock.map(
                  (feed) => (
                    <tr
                      key={feed.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 capitalize font-medium">
                        {feed.feed_type.replace(
                          '_',
                          ' '
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {feed.brand ||
                          '—'}
                      </td>

                      <td className="px-6 py-4">
                        {
                          feed.quantity_bags
                        }
                      </td>

                      <td className="px-6 py-4">
                        {
                          feed.total_kg
                        }{' '}
                        kg
                      </td>

                      <td className="px-6 py-4">
                        {feed.is_low ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                            Low
                            Stock
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            In
                            Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MEDICATIONS */}
      <div className="bg-white rounded-3xl border shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Medications
            </h2>
          </div>
          <button
            onClick={() =>
              setShowMedModal(true)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl font-semibold flex items-center gap-2 transition"
          >
            <Plus size={16} />
            New Medicine
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4">
                  Name
                </th>

                <th className="text-left px-6 py-4">
                  Quantity
                </th>

                <th className="text-left px-6 py-4">
                  Expiry
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                medications.map(
                  (med) => (
                    <tr
                      key={med.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {med.name}
                      </td>

                      <td className="px-6 py-4">
                        {
                          med.quantity
                        }{' '}
                        {
                          med.unit
                        }
                      </td>

                      <td className="px-6 py-4">
                        {med.expiry_date ||
                          '—'}
                      </td>

                      <td className="px-6 py-4">
                        {med.is_low ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                            Low
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PURCHASE ORDERS */}
      <div className="bg-white rounded-3xl border shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Purchase Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4">
                  Item
                </th>

                <th className="text-left px-6 py-4">
                  Quantity
                </th>

                <th className="text-left px-6 py-4">
                  Estimated
                  Cost
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                purchaseOrders.map(
                  (order) => (
                    <tr
                      key={
                        order.id
                      }
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {
                          order.item_name
                        }
                      </td>

                      <td className="px-6 py-4">
                        {
                          order.quantity
                        }{' '}
                        {
                          order.unit
                        }
                      </td>

                      <td className="px-6 py-4">
                        KES{' '}
                        {
                          order.estimated_cost
                        }
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            order.status ===
                            'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : order.status ===
                                'purchased'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {
                            order.status
                          }
                        </span>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPPLIERS */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Suppliers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {!loading &&
            suppliers.map(
              (supplier) => (
                <div
                  key={
                    supplier.id
                  }
                  className="border rounded-3xl p-5 hover:shadow-md transition bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {
                          supplier.name
                        }
                      </h3>

                      <p className="text-sm text-gray-500 capitalize mt-1">
                        {
                          supplier.category
                        }
                      </p>
                    </div>

                    <div className="bg-blue-100 p-3 rounded-2xl">
                      <Truck
                        size={
                          20
                        }
                        className="text-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      📞{' '}
                      {
                        supplier.phone
                      }
                    </p>

                    <p className="text-gray-600">
                      ✉️{' '}
                      {
                        supplier.email
                      }
                    </p>

                    <p className="text-gray-600">
                      📍{' '}
                      {
                        supplier.location
                      }
                    </p>
                  </div>
                </div>
              )
            )}
        </div>
      </div>

      {/* ADD FEED MODAL */}
      {showFeedModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Feed
                </h2>

                <p className="text-gray-500 mt-1">
                  Create new
                  feed stock
                </p>
              </div>

              <button
                onClick={() =>
                  setShowFeedModal(
                    false
                  )
                }
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl"
              >
                <Plus
                  size={20}
                  className="rotate-45"
                />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateFeed
              }
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Feed Type
                  </label>

                  <select
                    name="feed_type"
                    value={
                      feedForm.feed_type
                    }
                    onChange={
                      handleFeedChange
                    }
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="starter">
                      Starter
                    </option>

                    <option value="grower">
                      Grower
                    </option>

                    <option value="finisher">
                      Finisher
                    </option>

                    <option value="layer_mash">
                      Layer Mash
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Brand
                  </label>

                  <input
                    type="text"
                    name="brand"
                    value={
                      feedForm.brand
                    }
                    onChange={
                      handleFeedChange
                    }
                    placeholder="Unga Farm Care"
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Bags
                  </label>

                  <input
                    type="number"
                    name="quantity_bags"
                    value={
                      feedForm.quantity_bags
                    }
                    onChange={
                      handleFeedChange
                    }
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    KG / Bag
                  </label>

                  <input
                    type="number"
                    name="kg_per_bag"
                    value={
                      feedForm.kg_per_bag
                    }
                    onChange={
                      handleFeedChange
                    }
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Reorder
                  </label>

                  <input
                    type="number"
                    name="reorder_level"
                    value={
                      feedForm.reorder_level
                    }
                    onChange={
                      handleFeedChange
                    }
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Restocked
                  </label>

                  <input
                    type="date"
                    name="last_restocked"
                    value={
                      feedForm.last_restocked
                    }
                    onChange={
                      handleFeedChange
                    }
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Supplier
                  </label>

                  <select
                    name="preferred_supplier"
                    value={
                      feedForm.preferred_supplier
                    }
                    onChange={
                      handleFeedChange
                    }
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">
                      Select
                      supplier
                    </option>

                    {suppliers.map(
                      (
                        supplier
                      ) => (
                        <option
                          key={
                            supplier.id
                          }
                          value={
                            supplier.id
                          }
                        >
                          {
                            supplier.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  savingFeed
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
              >
                {savingFeed ? (
                  <>
                    <Loader2
                      size={
                        18
                      }
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus
                      size={
                        18
                      }
                    />
                    Create Feed
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEDICATION MODAL */}
      {showMedModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Medication
                </h2>

                <p className="text-gray-500 mt-1">
                  Create a new medication
                </p>
              </div>

              <button
                onClick={() =>
                  setShowMedModal(false)
                }
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl"
              >
                <Plus
                  size={20}
                  className="rotate-45"
                />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateMedication
              }
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={medForm.name}
                    onChange={handleMedChange}
                    placeholder="Vitamin A"
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={medForm.quantity}
                    onChange={handleMedChange}
                    placeholder="0"
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Unit
                  </label>

                  <select
                    name="unit"
                    value={medForm.unit}
                    onChange={handleMedChange}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pcs">pcs</option>
                    <option value="bottles">bottles</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    name="expiry_date"
                    value={medForm.expiry_date}
                    onChange={handleMedChange}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingMed}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
              >
                {savingMed ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Medication
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}