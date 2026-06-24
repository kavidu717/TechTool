import { useState } from 'react'

const ReturnProcess = () => {
  // State variables for managing the search and data
  const [invoiceNo, setInvoiceNo] = useState('')
  const [saleDetails, setSaleDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Function to handle the search form submission
  const handleSearch = async (e) => {
    e.preventDefault()

    // Prevent searching if the input is empty
    if (!invoiceNo.trim()) return

    // Reset states before fetching new data
    setLoading(true)
    setError('')
    setSaleDetails(null)

    try {
      const token = localStorage.getItem('token')

      // Call the API via the preload.js bridge
      const result = await window.api.getSaleForReturn(token, invoiceNo)

      if (result.success) {
        // If successful, save the data to state
        setSaleDetails(result.data)
      } else {
        // Show error message from backend or a default message
        setError(result.message || 'Invoice not found.')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred while searching for the invoice.')
    } finally {
      // Stop the loading animation
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[80vh]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">View Invoice Details</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter Invoice No (e.g. INV-123)"
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
        />
        <button
          type="submit"
          disabled={loading || !invoiceNo.trim()}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Searching...' : 'Search Invoice'}
        </button>
      </form>

      {/* Error Message Display */}
      {error && (
        <div className="p-4 mb-6 text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Invoice Details Section */}
      {saleDetails && (
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50 animate-in fade-in duration-300">
          {/* Top Summary Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-500">Invoice No</p>
              <p className="font-bold text-gray-800">{saleDetails.sale.invoiceNo}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Amount</p>
              <p className="font-bold text-blue-600">
                Rs.{' '}
                {Number(saleDetails.sale.totalAmount).toLocaleString('en-LK', {
                  minimumFractionDigits: 2
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Sale Date</p>
              <p className="font-bold text-gray-800">
                {new Date(saleDetails.sale.saleDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Cashier ID</p>
              <p className="font-bold text-gray-800">#{saleDetails.sale.cashierId}</p>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 mb-4">Purchased Items</h3>

          {/* Items Table */}
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="p-4 font-semibold">Product Name</th>
                  <th className="p-4 font-semibold text-center">Quantity</th>
                  <th className="p-4 font-semibold text-right">Unit Price</th>
                  <th className="p-4 font-semibold text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {saleDetails.items.map((item) => (
                  <tr key={item.sale_item_id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{item.product_name}</td>
                    <td className="p-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="p-4 text-right text-gray-600">
                      Rs.{' '}
                      {Number(item.selling_price).toLocaleString('en-LK', {
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      Rs.{' '}
                      {(item.quantity * Number(item.selling_price)).toLocaleString('en-LK', {
                        minimumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReturnProcess
