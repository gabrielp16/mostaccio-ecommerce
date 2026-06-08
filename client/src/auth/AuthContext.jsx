import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, loginUser, setAuthToken } from '../services/api.js'

const TOKEN_KEY = 'storefront_token'
const USER_KEY = 'storefront_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY) || ''
    if (savedToken) {
      setAuthToken(savedToken)
    }
    return savedToken
  })
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY)
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  const clearSession = () => {
    setToken('')
    setUser(null)
    setAuthToken('')
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const login = async (credentials) => {
    const data = await loginUser(credentials)
    persistSession(data.token, data.user)
    return data.user
  }

  const logout = () => {
    clearSession()
  }

  const refreshMe = async () => {
    if (!token) {
      return null
    }

    try {
      const data = await getMe()
      setUser(data.user)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return data.user
    } catch {
      clearSession()
      return null
    }
  }

  useEffect(() => {
    if (token) {
      refreshMe()
    }
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAdmin: user?.role === 'admin',
      hasPermission: (permission) => Boolean(user?.permissions?.includes(permission)),
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshMe,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
