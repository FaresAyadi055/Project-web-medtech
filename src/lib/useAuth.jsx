import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uni_tasks_auth_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        api.setCurrentUser({ uid: parsed.uid })
        setUser({ uid: parsed.uid, ...parsed })
      }
    } catch (e) {}
    setLoading(false)
  }, [])

  const signOut = () => {
    setUser(null)
    api.setCurrentUser(null)
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
