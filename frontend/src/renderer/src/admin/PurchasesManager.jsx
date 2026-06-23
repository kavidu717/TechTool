import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { Plus, Loader2, FileText, Calendar } from 'lucide-react'

export default function PurchasesManager({ setActiveTab }) {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch purchase history from the database on component load
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const token = localStorage.getItem('token')
        const result = await window.api.getPurchases(token)

        if (result.success) {
          setPurchases(result.data)
        } else {
          setError(result.message)
        }
      } catch (err) {
        console.error(err)
        setError('System Error! Check your connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [])

  // Format date for better readability
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      {/* Header section */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FileText className="text-blue-600" size={28} />
            Manage Purchases (GRN)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View your purchase history and goods receipt notes.
          </p>
        </div>

        {/* Navigation to Create GRN */}
        <button
          onClick={() => setActiveTab('CreateGRN')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shadow-sm"
        >
          <Plus size={18} />
          Create New GRN
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        /* Data table */
        <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">GRN ID</th>
                <th className="px-6 py-4 font-semibold">Reference No</th>
                <th className="px-6 py-4 font-semibold">Supplier ID</th>
                <th className="px-6 py-4 font-semibold text-right">Total Amount (LKR)</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">#{purchase.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block mt-3">
                      {purchase.reference_no}
                    </td>
                    <td className="px-6 py-4 text-slate-600">Supplier #{purchase.supplier_id}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {Number(purchase.total_amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDate(purchase.purchase_date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No purchases found. Click Create New GRN to add stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

PurchasesManager.propTypes = {
  setActiveTab: PropTypes.func.isRequired
}
