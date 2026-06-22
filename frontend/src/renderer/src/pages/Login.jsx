import { useState } from 'react'
import { User, Lock } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await window.api.login({ username, password })
      if (result.success) {
        const { token, user } = result.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        if (user.role === 'ADMIN') navigate('/admin-dashboard')
        else navigate('/cashier-dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">TechTool POS</h1>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-200"
                required
                placeholder="Enter your username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-200"
                required
                placeholder="Enter your password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
