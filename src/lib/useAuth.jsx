import React, { createContext, useContext, useEffect, useState } from 'react'
import dbClient from './dbClient'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Development shortcut: allow forcing a mock user for UI inspection.
    // Set `VITE_FORCE_MOCK_USER=true` in `.env.local` to enable.
    if (import.meta.env.VITE_FORCE_MOCK_USER === 'true') {
      const mock = {
        uid: 'mock-uid-1',
        email: 'student1@test.local',
        name: 'Student One',
        role: 'student',
        major: 'Computer Science',
      }
      setUser(mock)
      setLoading(false)
      return () => {}
    }

    // Load persisted session from localStorage (local-only app)
    try {
      const stored = localStorage.getItem('uni_tasks_auth_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        // make sure user doc exists in the local DB
        dbClient.ensureUserDoc({ uid: parsed.uid || parsed.id, displayName: parsed.name, email: parsed.email }).then(doc => {
          setUser({ uid: parsed.uid || parsed.id, email: parsed.email, ...doc })
          setLoading(false)
        }).catch(() => { setUser(null); setLoading(false) })
      } else {
        setUser(null)
        setLoading(false)
      }
    } catch (e) {
      // on error, fallback to anonymous state
      setUser(null)
      setLoading(false)
    }
  }, [])

  const signIn = async (email, password) => {
    const userDoc = await dbClient.signIn(email, password)
    setUser({ uid: userDoc.uid || userDoc.id, ...userDoc })
    try { localStorage.setItem('uni_tasks_auth_user', JSON.stringify({ uid: userDoc.uid || userDoc.id, email: userDoc.email, name: userDoc.name })) } catch (e) {}
    return userDoc
  }

  const signUp = async (email, password) => {
    const userDoc = await dbClient.createUser(email, password, email.split('@')[0])
    // ensure user exists in local store
    await dbClient.ensureUserDoc({ uid: userDoc.uid || userDoc.id, displayName: userDoc.name, email: userDoc.email })
    setUser({ uid: userDoc.uid || userDoc.id, ...userDoc })
    try { localStorage.setItem('uni_tasks_auth_user', JSON.stringify({ uid: userDoc.uid || userDoc.id, email: userDoc.email, name: userDoc.name })) } catch (e) {}
    return userDoc
  }

  const signOutLocal = () => {
    setUser(null)
    try { localStorage.removeItem('uni_tasks_auth_user') } catch (e) {}
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, setLoading, signIn, signUp, signOut: signOutLocal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
