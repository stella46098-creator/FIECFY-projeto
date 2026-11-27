import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user } = useAuth()
  return localStorage.getItem('fiecfy_token') && user
    ? <Outlet />
    : <Navigate to="/login" replace />
}
