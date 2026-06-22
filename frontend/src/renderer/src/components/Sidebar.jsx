import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MonitorPlay,
  Package,
  Truck,
  Receipt,
  Users,
  LineChart,
  Settings,
  LogOut
} from 'lucide-react'

// Accept activeTab and setActiveTab as props from the parent component
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate()

  // Get logged user details
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Admin' }

  // Define sidebar menu items
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'POS Terminal', icon: <MonitorPlay size={20} /> },
    { name: 'Products', icon: <Package size={20} /> },
    { name: 'Suppliers', icon: <Truck size={20} /> },
    { name: 'Sales', icon: <Receipt size={20} /> },
    { name: 'Users', icon: <Users size={20} /> },
    { name: 'Reports', icon: <LineChart size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> }
  ]

  // Handle logout process
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="flex w-64 flex-col bg-slate-900 text-white shadow-2xl">
      {/* Brand Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">
          TechTool<span className="text-white">POS</span>
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setActiveTab(item.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  activeTab === item.name
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-bold text-white">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">{user.username}</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
