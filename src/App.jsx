import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TaskDetail from './pages/TaskDetail'
import Profile from './pages/Profile'
import { useAuth } from './lib/useAuth'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route path="/tasks/:id" element={user ? <TaskDetail /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
