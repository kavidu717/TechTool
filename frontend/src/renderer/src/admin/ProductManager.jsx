const ProductsManager = () => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Inventory & Products</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          + Add New Product
        </button>
      </div>

      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
        <p className="text-gray-500">Product list table will be displayed here.</p>
      </div>
    </div>
  )
}

export default ProductsManager
