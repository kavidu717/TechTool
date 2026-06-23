import PropTypes from 'prop-types'
import { useState, useEffect, useRef, forwardRef } from 'react'
import { Trash2, Printer, Search } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

export default function POSTerminal() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const componentRef = useRef()
  const invoiceCounterRef = useRef(0)
  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      const result = await window.api.getProducts(localStorage.getItem('token'))
      if (result.success) setProducts(result.data)
    }
    loadProducts()
  }, [])

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  )

  const addToCart = () => {
    if (!selectedProduct) return

    // Validate discount (cannot go below min price)
    const priceAfterDiscount = selectedProduct.selling_price - discount
    if (priceAfterDiscount < selectedProduct.min_selling_price) {
      alert('Discount exceeds minimum price limit!')
      return
    }

    const newItem = {
      ...selectedProduct,
      product_id: selectedProduct.id,
      quantity: Number(quantity),
      discount: Number(discount),
      subtotal: selectedProduct.selling_price * quantity - discount
    }
    setCart([...cart, newItem])
    setSelectedProduct(null)
    setSearch('')
    setDiscount(0)
    setQuantity(1)
  }

  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0)

  const handlePrint = useReactToPrint({ content: () => componentRef.current })

  const handlePrintAndSave = async () => {
    if (cart.length === 0) return

    invoiceCounterRef.current += 1
    const timestamp = Date.now()
    const saleData = {
      invoice_no: `INV-${timestamp}-${invoiceCounterRef.current}`,
      total_amount: grandTotal,
      discount: cart.reduce((sum, i) => sum + i.discount, 0),
      items: cart
    }

    const result = await window.api.addSale(saleData, localStorage.getItem('token'))
    if (result.success) {
      handlePrint()
      setCart([]) // Clear cart after success
    } else {
      alert('Error saving sale!')
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[85vh] bg-gray-100 rounded-xl">
      {/* Left: Search & Input Panel */}
      <div className="col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col h-full">
        <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-2">
          <Search size={22} className="text-blue-600" /> Search Product
        </h3>

        <input
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
          placeholder="Type Name or Barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Search Results List */}
        <div className="overflow-y-auto flex-1 border border-gray-100 rounded-lg bg-gray-50 mb-4">
          {search && filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-200 text-sm transition-colors"
                onClick={() => setSelectedProduct(p)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{p.name}</span>
                  <span className="text-blue-600 font-bold">LKR {p.selling_price}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>
                    Stock:{' '}
                    <strong className={p.stock_quantity < 5 ? 'text-red-500' : 'text-green-600'}>
                      {p.stock_quantity}
                    </strong>
                  </span>
                  <span>Code: {p.barcode}</span>
                </div>
              </div>
            ))
          ) : search ? (
            <div className="p-4 text-center text-sm text-gray-400">No products found</div>
          ) : null}
        </div>

        {/* Selected Product Controls */}
        {selectedProduct && (
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm animate-fade-in">
            <h4 className="font-bold text-lg text-slate-800 truncate">{selectedProduct.name}</h4>
            <div className="flex justify-between mt-3 text-sm bg-white p-2 rounded-lg border border-blue-100">
              <p className="text-gray-600">
                Price:{' '}
                <span className="font-bold text-blue-700">LKR {selectedProduct.selling_price}</span>
              </p>
              <p className="text-gray-600">
                Min:{' '}
                <span className="font-bold text-red-600">
                  LKR {selectedProduct.min_selling_price}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Discount (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={addToCart}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-all shadow-md active:scale-[0.98]"
            >
              Add to Bill
            </button>
          </div>
        )}
      </div>

      {/* Right: Bill & Cart Panel */}
      <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col h-full">
        <h3 className="font-bold text-xl mb-4 text-slate-800">Current Bill</h3>

        <div className="flex-1 overflow-y-auto border rounded-xl bg-gray-50">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-200 text-xs text-gray-600 uppercase sticky top-0 shadow-sm">
              <tr>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Qty</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    Cart is empty
                  </td>
                </tr>
              ) : (
                cart.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-800 font-medium">{item.name}</td>
                    <td className="p-4 text-gray-600">{item.quantity}</td>
                    <td className="p-4 text-gray-600">{item.selling_price}</td>
                    <td className="p-4 text-blue-700 font-bold">{item.subtotal.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove Item"
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

        <div className="mt-5 pt-5 border-t-2 border-dashed border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-semibold uppercase tracking-wider">
              Grand Total
            </span>
            <h2 className="text-4xl font-black text-blue-700">LKR {grandTotal.toFixed(2)}</h2>
          </div>

          <button
            onClick={handlePrintAndSave}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg text-lg ${
              cart.length === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99]'
            }`}
          >
            <Printer size={24} /> Print & Save Bill
          </button>
        </div>
      </div>

      {/* Hidden Print Component */}
      <div className="hidden">
        <BillComponent ref={componentRef} cart={cart} total={grandTotal} />
      </div>
    </div>
  )
}

// Separate ForwardRef Component to avoid Linter Errors
const BillComponent = forwardRef(({ cart, total }, ref) => (
  <div ref={ref} className="p-6 text-sm max-w-[300px] text-black bg-white font-sans">
    <h2 className="text-xl font-extrabold text-center">TechTool POS</h2>
    <p className="text-center text-xs mt-1 text-gray-600">Thank you for your business!</p>
    <div className="border-t border-b border-dashed border-black my-4 py-3 space-y-2">
      {cart.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="w-2/3 truncate pr-2">
            {item.name} <span className="text-xs text-gray-600">x{item.quantity}</span>
          </span>
          <span className="w-1/3 text-right font-medium">{item.subtotal.toFixed(2)}</span>
        </div>
      ))}
    </div>
    <div className="text-right font-extrabold text-lg mt-2">Total: LKR {total.toFixed(2)}</div>
  </div>
))

// Adding displayName resolves ESLint react/display-name warning
BillComponent.displayName = 'BillComponent'

BillComponent.propTypes = {
  cart: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      quantity: PropTypes.number,
      subtotal: PropTypes.number
    })
  ).isRequired,
  total: PropTypes.number.isRequired
}
