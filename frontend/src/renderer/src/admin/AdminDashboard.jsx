import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import DashboardOverview from '../admin/DashboardOverview'
import ProductsManager from '../admin/ProductManager'
import SuppliersManager from '../admin/SuppliersManager'
import AddProducts from '../admin/AddProducts'
import PurchasesManager from '../admin/PurchasesManager'
import CreateGRN from './CreateGRN'
import POSTerminal from './POSTerminal'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard')

  // Function to render the correct component based on the selected tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardOverview />
      case 'Products':
        return <ProductsManager setActiveTab={setActiveTab} />

      case 'AddProducts':
        return <AddProducts setActiveTab={setActiveTab} />
      // Add other cases here as we build them
      case 'Purchases':
        return <PurchasesManager setActiveTab={setActiveTab} />
      case 'CreateGRN':
        return <CreateGRN setActiveTab={setActiveTab} />
      case 'Suppliers':
        return <SuppliersManager />
      case 'POS Terminal':
        return <POSTerminal />
      case 'Users':
      case 'Reports':
      case 'Settings':
      default:
        return (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-2xl font-medium text-gray-600">{activeTab} Module</h3>
            <p className="mt-2 max-w-md text-gray-400">
              The user interface and functionalities for the {activeTab} section are currently under
              development.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white px-8 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-gray-800">{activeTab}</h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {/* Dynamically render the content here */}
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
