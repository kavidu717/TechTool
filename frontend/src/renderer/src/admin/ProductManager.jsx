import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'

const ProductsManager = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductsFromDB()
  }, [])

  const fetchProductsFromDB = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem('token')
      const result = await window.api.getProducts(token)

      if (result.success) {
        const dbData = result.data
        setProducts(dbData)

        const uniqueCategories = [...new Set(dbData.map((item) => item.category))]

        const dynamicCategories = [
          { name: 'All', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
          ...uniqueCategories.map((cat) => ({
            name: cat,
            color: 'bg-slate-600 hover:bg-slate-700 text-white'
          }))
        ]

        setCategories(dynamicCategories)
      } else {
        console.error('Failed to load products:', result.message)
      }
    } catch (error) {
      console.error('System Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((product) => product.category === activeCategory)

  const getDynamicStatusBadge = (quantity) => {
    if (quantity <= 0) {
      return (
        <span className="rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Out of Stock
        </span>
      )
    } else if (quantity <= 5) {
      return (
        <span className="rounded-md bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
          Low Stock
        </span>
      )
    } else {
      return (
        <span className="rounded-md bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          In Stock
        </span>
      )
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(price)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Manage Products</h2>
        <p className="mt-1 text-sm text-slate-500">View, update, and add new inventory products.</p>
      </div>

      <div className="mb-8">
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shadow-sm">
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`rounded-md px-5 py-2 text-sm font-semibold transition-all ${
                  activeCategory === cat.name
                    ? cat.color + ' shadow-md ring-2 ring-offset-2 ring-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Barcode</th>
                  <th className="px-6 py-4 font-semibold">Product Name</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Brand</th>
                  <th className="px-6 py-4 font-semibold">Selling Price</th>
                  <th className="px-6 py-4 font-semibold">Min Price</th>
                  <th className="px-6 py-4 font-semibold text-center">Qty</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {product.barcode}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>

                      {/* Description Column with text truncation and tooltip */}
                      <td
                        className="px-6 py-4 text-slate-500 max-w-xs truncate cursor-help"
                        title={product.description}
                      >
                        {product.description}
                      </td>

                      <td className="px-6 py-4 text-slate-600">{product.brand}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {formatPrice(product.selling_price)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatPrice(product.min_selling_price)}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {product.stock_quantity}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getDynamicStatusBadge(product.stock_quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* Updated colSpan to 8 because we added a new column */}
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      No products found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductsManager
