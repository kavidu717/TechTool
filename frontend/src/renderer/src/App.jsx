import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'

import AdminDashboard from './pages/AdminDashboard'
import CashierDashboard from './pages/CashierDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/cashier-dashboard" element={<CashierDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
