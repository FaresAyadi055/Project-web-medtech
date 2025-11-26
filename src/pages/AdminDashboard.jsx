import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../api/client'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [classes, setClasses] = useState([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [showClassForm, setShowClassForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' })
  const [newClass, setNewClass] = useState({ name: '', teacher: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersResp, classesResp] = await Promise.all([
        api.get('/users'),
        api.get('/classes')
      ])
      setUsers(usersResp.data)
      setClasses(classesResp.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', newUser)
      setNewUser({ name: '', email: '', password: '', role: 'student' })
      setShowUserForm(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    try {
      await api.post('/classes', newClass)
      setNewClass({ name: '', teacher: '' })
      setShowClassForm(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create class')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await api.delete(`/users/${userId}`)
      fetchData()
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this class?')) return
    try {
      await api.delete(`/classes/${classId}`)
      fetchData()
    } catch (err) {
      alert('Failed to delete class')
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-2 ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`pb-3 px-2 ${activeTab === 'classes' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
            >
              Classes
            </button>
          </div>

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Users ({users.length})</h3>
                    <button
                      onClick={() => setShowUserForm(!showUserForm)}
                      className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium text-sm"
                    >
                      {showUserForm ? 'Cancel' : 'Create User'}
                    </button>
                  </div>

                  {showUserForm && (
                    <form onSubmit={handleCreateUser} className="p-4 mb-6 rounded card space-y-3">
                      <input
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      />
                      <input
                        required
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="Email"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      />
                      <input
                        required
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Password"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="w-full py-2 bg-indigo-600 rounded hover:bg-indigo-700">
                        Create
                      </button>
                    </form>
                  )}

                  <div className="overflow-x-auto rounded">
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
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Classes Tab */}
              {activeTab === 'classes' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Classes ({classes.length})</h3>
                    <button
                      onClick={() => setShowClassForm(!showClassForm)}
                      className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium text-sm"
                    >
                      {showClassForm ? 'Cancel' : 'Create Class'}
                    </button>
                  </div>

                  {showClassForm && (
                    <form onSubmit={handleCreateClass} className="p-4 mb-6 rounded card space-y-3">
                      <input
                        required
                        value={newClass.name}
                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                        placeholder="Class Name (e.g., CS101)"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      />
                      <select
                        value={newClass.teacher}
                        onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      >
                        <option value="">Select Teacher</option>
                        {users
                          .filter((u) => u.role === 'teacher')
                          .map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name}
                            </option>
                          ))}
                      </select>
                      <button type="submit" className="w-full py-2 bg-indigo-600 rounded hover:bg-indigo-700">
                        Create
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                      <div key={cls._id} className="p-4 rounded card border border-gray-800">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg">{cls.name}</h4>
                          <button
                            onClick={() => handleDeleteClass(cls._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Teacher: {cls.teacher?.name || 'Unassigned'}</p>
                        <p className="text-sm text-slate-400">Students: {cls.students?.length || 0}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
