import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api, clearToken, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const token = getToken()
      if (!token) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      try {
        const data = await api.me()
        if (!cancelled) setUser(data.user)
      } catch {
        clearToken()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await api.register({ name, email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const refreshProfile = useCallback(async () => {
    const data = await api.getProfile()
    setUser(data.user)
    return data
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const data = await api.updateProfile(payload)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      refreshProfile,
      updateProfile,
      logout,
    }),
    [user, loading, login, register, refreshProfile, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
