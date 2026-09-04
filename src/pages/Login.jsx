import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'
import Logo from '../assets/logo.svg'

const DEMO_USERS = [
  { label: 'Admin', email: 'admin@local', password: 'password123', desc: 'Full system access', color: 'from-red-900 to-red-800', border: 'border-red-700', text: 'text-red-200', icon: '🛡️' },
  { label: 'Teacher', email: 'alice@local', password: 'password123', desc: 'Manage classes & grade', color: 'from-blue-900 to-blue-800', border: 'border-blue-700', text: 'text-blue-200', icon: '👨‍🏫' },
  { label: 'Student', email: 'bob@local', password: 'password123', desc: 'Submit assignments', color: 'from-green-900 to-green-800', border: 'border-green-700', text: 'text-green-200', icon: '👨‍🎓' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const fillCredentials = (demo) => {
    setEmail(demo.email)
    setPassword(demo.password)
    setError('')
  }

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 px-4">
      <div className="w-full max-w-lg p-8 rounded-lg card">
        <div className="flex items-center gap-4 mb-4">
          <img src={Logo} alt="UniTasks" className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold mb-0">UniTasks</h1>
            <p className="text-xs text-slate-400">School task management - Demo Mode</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">Sign in to explore the application</p>

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

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-sm font-semibold text-slate-300 mb-4">Demo Accounts</p>
          <p className="text-xs text-slate-500 mb-4">Click a role to auto-fill credentials and sign in.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.label}
                onClick={() => fillCredentials(demo)}
                className={`p-4 rounded-xl bg-gradient-to-br ${demo.color} border-2 ${demo.border} text-left hover:scale-105 transition-all duration-200 hover:shadow-lg group`}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{demo.icon}</div>
                <div className={`font-bold text-sm ${demo.text}`}>{demo.label}</div>
                <div className="text-xs text-slate-400 mt-1">{demo.email}</div>
                <div className="text-xs text-slate-500 mt-1">{demo.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
