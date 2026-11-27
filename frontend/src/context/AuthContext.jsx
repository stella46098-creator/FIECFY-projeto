import { createContext, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fiecfy_user')) } catch { return null }
  })

  async function login(email, password) {
    const response = await api.post('/login', { email, password })
    localStorage.setItem('fiecfy_token', response.data.token)
    localStorage.setItem('fiecfy_user', JSON.stringify(response.data.user))
    setUser(response.data.user)
    return response.data
  }

  async function register(data) {
    const response = await api.post('/register', data)
    localStorage.setItem('fiecfy_token', response.data.token)
    localStorage.setItem('fiecfy_user', JSON.stringify(response.data.user))
    setUser(response.data.user)
    return response.data
  }

  async function logout() {
    try { await api.post('/logout') } catch { /* encerra a sessão local mesmo se a API estiver offline */ }
    localStorage.removeItem('fiecfy_token')
    localStorage.removeItem('fiecfy_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
