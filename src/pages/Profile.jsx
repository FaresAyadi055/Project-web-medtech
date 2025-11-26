import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../api/client'

export default function Profile(){
  const { user, setUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(()=>{
    if(user){
      setName(user.name || '')
      setEmail(user.email || '')
      setRole(user.role || 'student')
    }
  },[user])

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    try {
      const resp = await api.put(`/users/${user.uid}`, { name, role })
      setUser({ ...user, name, role })
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>

            {message && (
              <div className={`mb-4 p-3 rounded ${
                message.includes('successfully')
                  ? 'bg-green-900 bg-opacity-20 border border-green-700 text-green-300'
                  : 'bg-red-900 bg-opacity-20 border border-red-700 text-red-300'
              }`}>
                {message}
              </div>
            )}

            <div className="rounded card p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="font-semibold mb-4">Account Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      value={email}
                      disabled
                      className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-slate-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      value={name}
                      onChange={e=>setName(e.target.value)}
                      className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <input
                      value={role}
                      disabled
                      className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-slate-400 capitalize"
                    />
                    <p className="text-xs text-slate-400 mt-1">Contact admin to change role</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded font-medium"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-800">
                <h3 className="font-semibold mb-4 text-red-400">Danger Zone</h3>
                <button
                  onClick={handleSignOut}
                  className="py-2 px-4 bg-red-900 hover:bg-red-800 text-red-200 rounded font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
