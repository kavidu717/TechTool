import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

const OverviewTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isSales = data.name === 'Sales (Rs)'
    return (
      <div className="bg-white/90 backdrop-blur-sm p-4 border border-gray-100 shadow-xl rounded-xl">
        <p className="text-sm font-medium text-gray-500 mb-1">{data.name}</p>
        <p className="text-2xl font-extrabold tracking-tight" style={{ color: data.color }}>
          {isSales
            ? `Rs. ${data.value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
            : data.value}
        </p>
      </div>
    )
  }
  return null
}

OverviewTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object)
}

const Last7DaysTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-4 border border-blue-100 shadow-xl rounded-xl">
        <p className="text-sm font-medium text-gray-500 mb-1">Date: {label}</p>
        <p className="text-2xl font-extrabold text-blue-600 tracking-tight">
          Rs. {payload[0].value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
        </p>
      </div>
    )
  }
  return null
}

Last7DaysTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string
}

const DashboardOverview = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const [stats, setStats] = useState({
    selectedDateSales: 0,
    totalProducts: 0,
    totalSuppliers: 0,
    lowStockCount: 0,
    last7DaysSales: []
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const result = await window.api.getDashboardStats(token, selectedDate)

        if (result.success) {
          const formattedLast7Days = result.data.last7DaysSales.map((item) => {
            const d = new Date(item.date)
            return {
              day: `${d.getMonth() + 1}/${d.getDate()}`,
              amount: Number(item.amount)
            }
          })

          setStats({
            selectedDateSales: result.data.selectedDateSales,
            totalProducts: result.data.totalProducts,
            totalSuppliers: result.data.totalSuppliers,
            lowStockCount: result.data.lowStockProducts.length,
            last7DaysSales: formattedLast7Days
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const overviewChartData = [
    { name: 'Sales (Rs)', value: Number(stats.selectedDateSales), color: '#3b82f6' },
    { name: 'Total Products', value: Number(stats.totalProducts), color: '#8b5cf6' },
    { name: 'Total Suppliers', value: Number(stats.totalSuppliers), color: '#10b981' },
    { name: 'Low Stock', value: Number(stats.lowStockCount), color: '#ef4444' }
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 rounded-3xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            System Overview
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Analyze your business performance at a glance.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 transition-all hover:bg-white hover:shadow-md hover:border-blue-200 cursor-pointer">
          <label
            htmlFor="datePicker"
            className="text-sm font-semibold text-gray-600 cursor-pointer"
          >
            Select Date:
          </label>
          <input
            type="date"
            id="datePicker"
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-transparent text-gray-800 font-medium outline-none cursor-pointer focus:text-blue-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading data for {selectedDate}...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 group">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800 tracking-wide">
                Metrics for <span className="text-blue-600">{selectedDate}</span>
              </h4>
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overviewChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    content={<OverviewTooltip />}
                    cursor={{ fill: '#f8fafc', opacity: 0.6 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={45}>
                    {overviewChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 group">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800 tracking-wide">
                Revenue <span className="text-blue-600">(Last 7 Days)</span>
              </h4>
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="h-[320px] w-full">
              {stats.last7DaysSales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.last7DaysSales}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                      dy={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(val) => {
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
                        return val
                      }}
                    />
                    <Tooltip
                      content={<Last7DaysTooltip />}
                      cursor={{ fill: '#f8fafc', opacity: 0.6 }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                      barSize={45}
                      className="hover:fill-blue-500 transition-colors duration-300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col h-full items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <svg
                    className="w-12 h-12 mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    ></path>
                  </svg>
                  <p className="font-medium">No sales data for the last 7 days.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardOverview
