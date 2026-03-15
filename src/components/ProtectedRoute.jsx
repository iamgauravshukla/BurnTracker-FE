import { Navigate } from 'react-router-dom'
import { getStoredToken } from '../services/auth'

export default function ProtectedRoute({ children }) {
  return getStoredToken() ? children : <Navigate replace to="/login" />
}