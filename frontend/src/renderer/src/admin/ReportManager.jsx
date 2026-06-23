import { useState, useEffect } from 'react'
import { BarChart, DollarSign, Package, TrendingUp, Download } from 'lucide-react'

export default function ReportsManager() {
  const [reportType, setReportType] = useState('sales')
  const [timeFilter, setTimeFilter] = useState('today')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  const [reportData, setReportData] = useState([])
  const [suppliersList, setSuppliersList] = useState([])
  const [summary, setSummary] = useState({ revenue: 0, salesCount: 0, lowStockCount: 0 })

  // 1. Load Suppliers for the Dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      const result = await window.api.getSuppliers(localStorage.getItem('token'))
      if (result.success) setSuppliersList(result.data)
    }
    fetchSuppliers()
  }, [])

  // 2. Fetch Report Data from Database
  useEffect(() => {
    const loadReports = async () => {
      const params = {
        type: reportType,
        timeFilter: timeFilter,
        supplierId: selectedSupplier
      }

      const result = await window.api.getReports(params, localStorage.getItem('token'))
      if (result.success) {
        setReportData(result.data)

        // Calculate dynamic summary
        if (reportType === 'sales') {
          const totalRev = result.data.reduce((sum, item) => sum + Number(item.total_amount), 0)
          setSummary((prev) => ({ ...prev, revenue: totalRev, salesCount: result.data.length }))
        } else if (reportType === 'stock') {
          const lowStock = result.data.filter((item) => item.current_stock < 5).length
          setSummary((prev) => ({ ...prev, lowStockCount: lowStock }))
        }
      }
    }
    loadReports()
  }, [reportType, timeFilter, selectedSupplier])

  // Excel Export Function
  const exportToExcel = () => {
    if (reportData.length === 0) {
      alert('No data to export!')
      return
    }
    const headers = Object.keys(reportData[0]).join(',')
    const rows = reportData
      .map((obj) =>
        Object.values(obj)
          .map((val) => `"${val}"`)
          .join(',')
      )
      .join('\n')

    const csvContent = `${headers}\n${rows}`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart className="text-blue-600" /> Business Reports
        </h2>
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <Download size={18} /> Export to Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Filtered Revenue</p>
            <h3 className="text-xl font-bold text-slate-800">
              LKR {summary.revenue.toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sales Count</p>
            <h3 className="text-xl font-bold text-slate-800">{summary.salesCount}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Low/Out of Stock</p>
            <h3 className="text-xl font-bold text-slate-800">{summary.lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Report Controls (Filters) */}
      <div className="bg-white p-5 rounded-t-xl border-b border-gray-200 flex flex-wrap gap-4 shadow-sm mt-4 items-center">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Report Type</label>
          <select
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-48"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="sales">Sales Report</option>
            <option value="stock">Stock/Inventory Report</option>
            <option value="supplier">Supplier History</option>
          </select>
        </div>

        {reportType === 'sales' && (
          <div className="flex flex-col animate-fade-in">
            <label className="text-xs font-semibold text-gray-500 mb-1">Time Period</label>
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-48"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="today">Today s Sales</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        )}

        {reportType === 'supplier' && (
          <div className="flex flex-col animate-fade-in">
            <label className="text-xs font-semibold text-gray-500 mb-1">Select Supplier</label>
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliersList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Report Data Table */}
      <div className="bg-white shadow-sm rounded-b-xl overflow-hidden border border-t-0 border-gray-200 mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-600 text-sm border-b">
              {reportType === 'sales' && (
                <tr>
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount (LKR)</th>
                </tr>
              )}
              {reportType === 'stock' && (
                <tr>
                  <th className="p-4">Product Code</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Status</th>
                </tr>
              )}
              {reportType === 'supplier' && (
                <tr>
                  <th className="p-4">GRN No</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Items Received</th>
                  <th className="p-4">Total Value (LKR)</th>
                </tr>
              )}
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-sm"
                >
                  {reportType === 'sales' && (
                    <>
                      <td className="p-4 font-medium text-blue-600">{row.invoice_no}</td>
                      <td className="p-4 text-gray-600">{row.date}</td>
                      <td className="p-4 text-gray-600">{row.items_count}</td>
                      <td className="p-4 font-bold text-slate-800">
                        {Number(row.total_amount).toFixed(2)}
                      </td>
                    </>
                  )}
                  {reportType === 'stock' && (
                    <>
                      <td className="p-4 text-gray-500">{row.code}</td>
                      <td className="p-4 font-medium text-slate-800">{row.name}</td>
                      <td className="p-4 text-gray-600 font-bold">{row.current_stock}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-bold ${row.current_stock == 0 ? 'bg-red-100 text-red-600' : row.current_stock < 5 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </>
                  )}
                  {reportType === 'supplier' && (
                    <>
                      <td className="p-4 font-medium text-blue-600">{row.grn_no}</td>
                      <td className="p-4 text-gray-600">{row.date}</td>
                      <td className="p-4 font-medium text-slate-800">{row.supplier}</td>
                      <td
                        className="p-4 text-gray-500 truncate max-w-xs"
                        title={row.items_received}
                      >
                        {row.items_received}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {Number(row.total_value).toFixed(2)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No data available from database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
