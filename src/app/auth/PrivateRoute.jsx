import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { Spin } from "antd"
import { AuthContext } from "./AuthContext"

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <Spin fullscreen />

  return user ? children : <Navigate to="/login" replace />
}
