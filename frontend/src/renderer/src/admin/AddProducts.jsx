import PropTypes from 'prop-types'
import { useState } from 'react'
import { ArrowLeft, Save, Loader2, Package, RefreshCw } from 'lucide-react'

export default function AddProducts({ setActiveTab }) {
  // form input states
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [minSellingPrice, setMinSellingPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')

  // loading and message states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')

  // generates a unique 12-digit barcode
  const generateRandomBarCode = () => {
    const timeStamp = Date.now().toString().slice(-8)
    const random = Math.floor(1000 + Math.random() * 9000).toString()
    return timeStamp + random
  }

  // initialize barcode state automatically
  const [barcode, setBarcode] = useState(() => generateRandomBarCode())

  // update barcode when refresh button is clicked
  const handleRegenerateBarcode = () => {
    setBarcode(generateRandomBarCode())
  }

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setIsSubmitting(true)

    // prepare data for backend
    const productData = {
      name: name,
      category: category,
      brand: brand,
      description: description,
      barcode: barcode,
      selling_price: sellingPrice,
      min_selling_price: minSellingPrice,
      stock_quantity: stockQuantity
    }

    try {
      const token = localStorage.getItem('token')
      const result = await window.api.addProduct(productData, token)

      if (result.success) {
        setSuccessMsg('Product added successfully!')

        // clear form fields
        setName('')
        setCategory('')
        setBrand('')
        setDescription('')
        setSellingPrice('')
        setMinSellingPrice('')
        setStockQuantity('')

        // generate new barcode for the next item
        handleRegenerateBarcode()

        // redirect to products page after 2 seconds
        setTimeout(() => {
          setActiveTab('Products')
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message || 'System Error! Check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-y-auto">
        <div className="mb-8">
          <button
            onClick={() => setActiveTab('Products')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Package className="text-blue-600" size={28} />
            Add New Product
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The barcode below is automatically generated for your sticker printing.
          </p>
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

        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. Asus ROG Strix G15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode (Auto Generated) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 bg-slate-50 font-mono text-sm font-bold text-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Barcode"
                />
                <button
                  type="button"
                  onClick={handleRegenerateBarcode}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                  title="Regenerate Barcode"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. Laptops, Accessories"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. Asus, Logitech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (LKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Selling Price (LKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={minSellingPrice}
                onChange={(e) => setMinSellingPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="0.00"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Product details..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab('Products')}
              className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-400 shadow-sm"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />}
              Save Product
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

AddProducts.propTypes = {
  setActiveTab: PropTypes.func.isRequired
}
