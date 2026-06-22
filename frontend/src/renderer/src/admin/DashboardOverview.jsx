const DashboardOverview = () => {
  return (
    <div>
      <h3 className="mb-6 text-2xl font-bold text-gray-800">System Overview</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Sample Stat Cards */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Today Sales</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">Rs. 0.00</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Products</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">0</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
          <p className="mt-2 text-3xl font-bold text-red-600">0</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
