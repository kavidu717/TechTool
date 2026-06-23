import { useEffect, useState } from 'react'

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    lowStockCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the authentication token from local storage
        const token = localStorage.getItem('token')

        // Fetch dashboard statistics from the main process via IPC
        const result = await window.api.getDashboardStats(token)

        if (result.success) {
          // Update the state with fetched data
          setStats({
            todaySales: result.data.todaySales,
            totalProducts: result.data.totalProducts,
            lowStockCount: result.data.lowStockProducts.length // Calculate the number of low stock items
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        // Stop loading state
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Display loading state while data is being fetched
  if (loading) return <div className="p-6 text-center">Loading Dashboard...</div>

  return (
    <div>
      <h3 className="mb-6 text-2xl font-bold text-gray-800">System Overview</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card showing today's total sales */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Today Sales</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            Rs. {Number(stats.todaySales).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card showing the total count of products */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Products</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
        </div>

        {/* Card showing the count of low stock items */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
