import { useState } from 'react'
import { User, Lock } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import bgImage from '../assets/wallpaper.jpg'

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
    // Main container
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Background image */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* Login box */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">TechTool POS</h1>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded border border-gray-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
