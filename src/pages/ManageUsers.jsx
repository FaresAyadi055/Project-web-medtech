import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../api/client'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' })
  const [newUserFile, setNewUserFile] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const resp = await api.get('/users')
      setUsers(resp.data)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const form = new FormData()
      form.append('name', newUser.name)
      form.append('email', newUser.email)
      form.append('password', newUser.password)
      form.append('role', newUser.role)
      if (newUserFile) form.append('profilePicture', newUserFile)
      await api.post('/auth/register', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setNewUser({ name: '', email: '', password: '', role: 'student' })
      setNewUserFile(null)
      setShowUserForm(false)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await api.delete(`/users/${userId}`)
      fetchUsers()
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-400">Total Users: {users.length}</p>
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium text-sm"
            >
              {showUserForm ? 'Cancel' : 'Create User'}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} className="p-4 mb-6 rounded bg-gray-900 border border-gray-800 space-y-3">
              <input
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full Name"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <input
                required
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <input
                required
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Password"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <div>
                <label className="text-sm text-slate-400">Profile Picture (optional)</label>
                <input type="file" onChange={(e) => setNewUserFile(e.target.files[0])} className="mt-2" />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-medium">
                Create User
              </button>
            </form>
          )}

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto rounded border border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Role</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-gray-800 hover:bg-gray-900">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3 text-slate-400">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-900 text-red-200' :
                          user.role === 'teacher' ? 'bg-blue-900 text-blue-200' :
                          'bg-gray-800 text-slate-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
