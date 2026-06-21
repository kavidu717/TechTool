import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-blue-50">
      <h1 className="text-4xl font-bold text-blue-800">Admin Dashboard</h1>
      <p className="mt-4 text-lg text-gray-700">Welcome, {user?.username}!</p>
      <button
        onClick={handleLogout}
        className="mt-8 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  )
}

export default AdminDashboard
