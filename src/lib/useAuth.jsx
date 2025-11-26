import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load persisted session from localStorage
    try {
      const stored = localStorage.getItem('uni_tasks_auth_user')
      const token = localStorage.getItem('uni_tasks_token')
      
      if (stored && token) {
        const parsed = JSON.parse(stored)
        // Verify token is still valid by calling /me endpoint
        api.get('/auth/me').then(resp => {
          setUser({ uid: parsed.uid, ...resp.data.user })
          setLoading(false)
        }).catch(() => {
          // Token expired or invalid
          localStorage.removeItem('uni_tasks_auth_user')
          localStorage.removeItem('uni_tasks_token')
          setUser(null)
          setLoading(false)
        })
      } else {
        setUser(null)
        setLoading(false)
      }
    } catch (e) {
      setUser(null)
      setLoading(false)
    }
  }, [])

  const signOut = () => {
    setUser(null)
    try {
      localStorage.removeItem('uni_tasks_auth_user')
      localStorage.removeItem('uni_tasks_token')
    } catch (e) {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, setLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
