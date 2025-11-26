import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'
import Logo from '../assets/logo.svg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setLoading: setAuthLoading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const resp = await api.post('/auth/login', { email, password })
      if (resp.data?.token) {
        localStorage.setItem('uni_tasks_token', resp.data.token)
        localStorage.setItem('uni_tasks_auth_user', JSON.stringify({ 
          uid: resp.data.user.id, 
          email: resp.data.user.email, 
          name: resp.data.user.name,
          role: resp.data.user.role 
        }))
        setUser({ uid: resp.data.user.id, ...resp.data.user })
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg card">
        <div className="flex items-center gap-4 mb-4">
          <img src={Logo} alt="UniTasks" className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold mb-0">UniTasks</h1>
            <p className="text-xs text-slate-400">School task management</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">School task management system</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-slate-400">
            <p>Admin: admin@local / password123</p>
            <p>Teacher: alice@local / password123</p>
            <p>Student: bob@local / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
