import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Search, Plus, Trash2, FileText, Loader2 } from 'lucide-react'

export default function CreateGRN({ setActiveTab }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])

  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [grnItems, setGrnItems] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')

  // 1. Fetch initial data (Suppliers & Products)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const [suppResult, prodResult] = await Promise.all([
          window.api.getSuppliers(token),
          window.api.getProducts(token)
        ])

        if (suppResult.success) setSuppliers(suppResult.data)
        if (prodResult.success) setProducts(prodResult.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load initial data.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // 2. Add product to the table
  const handleAddProduct = () => {
    if (!selectedProduct) return

    const productDetails = products.find((p) => p.id.toString() === selectedProduct)
    if (!productDetails) return

    const isAlreadyAdded = grnItems.find((item) => item.product_id === productDetails.id)
    if (isAlreadyAdded) {
      alert('This product is already in the list!')
      return
    }

    const newItem = {
      product_id: productDetails.id,
      name: productDetails.name,
      barcode: productDetails.barcode,
      buying_price: '',
      quantity: '',
      total: 0
    }

    setGrnItems([...grnItems, newItem])
    setSelectedProduct('')
  }

  // 3. Update quantity or buying price and calculate total
  const handleItemChange = (productId, field, value) => {
    const updatedItems = grnItems.map((item) => {
      if (item.product_id === productId) {
        const updatedItem = { ...item, [field]: Number(value) || '' }
        updatedItem.total =
          (Number(updatedItem.buying_price) || 0) * (Number(updatedItem.quantity) || 0)
        return updatedItem
      }
      return item
    })
    setGrnItems(updatedItems)
  }

  // 4. Remove item from table
  const handleRemoveItem = (productId) => {
    setGrnItems(grnItems.filter((item) => item.product_id !== productId))
  }

  // Calculate Grand Total
  const grandTotal = grnItems.reduce((sum, item) => sum + item.total, 0)

  // 5. Submit GRN to backend
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedSupplier) {
      setError('Please select a supplier.')
      return
    }
    if (grnItems.length === 0) {
      setError('Please add at least one product.')
      return
    }

    setError('')
    setSuccessMsg('')
    setIsSubmitting(true)

    const grnData = {
      supplier_id: Number(selectedSupplier),

      total_amount: grandTotal,
      items: grnItems.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        buying_price: Number(item.buying_price)
      }))
    }

    try {
      const token = localStorage.getItem('token')
      const result = await window.api.addPurchase(grnData, token)

      if (result.success) {
        setSuccessMsg('GRN saved successfully! Stock updated.')
        setGrnItems([])
        setSelectedSupplier('')

        setTimeout(() => {
          setActiveTab('Purchases')
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.log(err)
      setError('System Error! Check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <button
            onClick={() => setActiveTab('Purchases')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Back to Purchases
          </button>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FileText className="text-blue-600" size={28} />
            Create GRN (Stock In)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Record new stock arrivals from your suppliers.
          </p>
        </div>
        <div className="text-right bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-500 mb-1">Grand Total</p>
          <p className="text-3xl font-bold text-blue-700">LKR {grandTotal.toFixed(2)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-600 border border-green-200">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Supplier *
          </label>
          <select
            required
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="">-- Choose a Supplier --</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name} ({sup.phone})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search & Select Product
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full pl-10 rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none bg-white"
              >
                <option value="">-- Type or Select Product --</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.barcode} - {prod.name} (Stock: {prod.stock_quantity})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddProduct}
            disabled={!selectedProduct}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors disabled:bg-slate-300"
          >
            <Plus size={20} />
            Add to List
          </button>
        </div>

        <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Barcode</th>
                <th className="px-4 py-3 font-semibold">Product Name</th>
                <th className="px-4 py-3 font-semibold w-32">Buying Price</th>
                <th className="px-4 py-3 font-semibold w-32">Qty Received</th>
                <th className="px-4 py-3 font-semibold text-right">Item Total</th>
                <th className="px-4 py-3 font-semibold text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {grnItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                    No products added yet. Select a product above and click Add to List.
                  </td>
                </tr>
              ) : (
                grnItems.map((item) => (
                  <tr key={item.product_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.barcode}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.buying_price}
                        onChange={(e) =>
                          handleItemChange(item.product_id, 'buying_price', e.target.value)
                        }
                        className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.product_id, 'quantity', e.target.value)
                        }
                        className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {item.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting || grnItems.length === 0}
            className="flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-300 shadow-sm"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />}
            Confirm & Save GRN
          </button>
        </div>
      </form>
    </div>
  )
}

CreateGRN.propTypes = {
  setActiveTab: PropTypes.func.isRequired
}
