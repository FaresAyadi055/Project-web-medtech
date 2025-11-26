import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'
import Logo from '../assets/logo.svg'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileFile, setProfileFile] = useState(null)
  const navigate = useNavigate()
  const { setUser, setLoading: setAuthLoading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const form = new FormData()
      form.append('name', name)
      form.append('email', email)
      form.append('password', password)
      form.append('role', role)
      if (profileFile) form.append('profilePicture', profileFile)
      const resp = await api.post('/auth/register', form, { headers: { 'Content-Type': 'multipart/form-data' } })
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
      setError(err.response?.data?.message || 'Registration failed')
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
            <h1 className="text-2xl font-bold mb-0">Create Account</h1>
            <p className="text-xs text-slate-400">Join UniTasks to manage school assignments</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

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
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Contact admin for admin account</p>
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

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Profile Picture (optional)</label>
            <input type="file" onChange={(e)=>setProfileFile(e.target.files[0])} className="mt-2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
