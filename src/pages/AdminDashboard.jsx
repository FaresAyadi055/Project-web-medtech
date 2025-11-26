import React, { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../api/client'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [classes, setClasses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersResp, classesResp, submissionsResp] = await Promise.all([
        api.get('/users'),
        api.get('/classes'),
        api.get('/submissions')
      ])
      setUsers(usersResp.data)
      setClasses(classesResp.data)
      setSubmissions(submissionsResp.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 text-lg">Monitor system performance and user statistics</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-slate-400 text-lg">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mr-3"></div>
                  Loading analytics...
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Total Users */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-white to-transparent transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <p className="text-blue-300 text-sm uppercase font-semibold opacity-75">👥 Total Users</p>
                      <p className="text-4xl font-bold text-blue-100 mt-3">{users.length}</p>
                      <div className="mt-3 pt-3 border-t border-blue-700 text-xs text-blue-300">
                        <p>👨‍🏫 {users.filter(u => u.role === 'teacher').length} Teachers</p>
                        <p>👨‍🎓 {users.filter(u => u.role === 'student').length} Students</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Classes */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-800 border border-indigo-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-white to-transparent transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <p className="text-indigo-300 text-sm uppercase font-semibold opacity-75">📚 Total Classes</p>
                      <p className="text-4xl font-bold text-indigo-100 mt-3">{classes.length}</p>
                      <div className="mt-3 pt-3 border-t border-indigo-700 text-xs text-indigo-300">
                        <p>👨‍🏫 {classes.filter(c => c.teacher).length} With Teachers</p>
                        <p>👨‍🎓 {classes.reduce((sum, c) => sum + (c.students?.length || 0), 0)} Total Students</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Submissions */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-white to-transparent transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <p className="text-purple-300 text-sm uppercase font-semibold opacity-75">📤 Total Submissions</p>
                      <p className="text-4xl font-bold text-purple-100 mt-3">{submissions.length}</p>
                      <div className="mt-3 pt-3 border-t border-purple-700 text-xs text-purple-300">
                        <p>✓ {submissions.filter(s => s.submittedAt && s.submittedAt !== null).length} Submitted</p>
                        <p>✗ {submissions.filter(s => !s.submittedAt || s.submittedAt === null).length} Pending</p>
                      </div>
                    </div>
                  </div>

                  {/* Submission Rate */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900 to-green-800 border border-green-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-white to-transparent transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <p className="text-green-300 text-sm uppercase font-semibold opacity-75">📊 Completion Rate</p>
                      <p className="text-4xl font-bold text-green-100 mt-3">
                        {submissions.length > 0 
                          ? Math.round((submissions.filter(s => s.submittedAt && s.submittedAt !== null).length / submissions.length) * 100)
                          : 0}%
                      </p>
                      <div className="mt-3 pt-3 border-t border-green-700 text-xs text-green-300">
                        <div className="w-full bg-green-950 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                            style={{
                              width: submissions.length > 0 
                                ? `${(submissions.filter(s => s.submittedAt && s.submittedAt !== null).length / submissions.length) * 100}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Submissions Chart */}
                  <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border border-gray-800 p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-2">📤 Submission Status</h3>
                    <p className="text-slate-400 text-sm mb-6">Overview of task submissions</p>
                    <div className="w-full h-80 flex items-center justify-center">
                      <Pie
                        data={{
                          labels: ['Submitted', 'Pending'],
                          datasets: [{
                            data: [
                              submissions.filter(s => s.submittedAt && s.submittedAt !== null).length,
                              submissions.filter(s => !s.submittedAt || s.submittedAt === null).length
                            ],
                            backgroundColor: ['#10b981', '#ef4444'],
                            borderColor: ['#059669', '#dc2626'],
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#cbd5e1', padding: 15, font: { size: 12, weight: 'bold' } }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-700 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Submissions:</span>
                        <span className="font-bold text-white">{submissions.length}</span>
                      </div>
                      <div className="flex justify-between text-green-400">
                        <span>✓ Submitted:</span>
                        <span className="font-bold">{submissions.filter(s => s.submittedAt && s.submittedAt !== null).length}</span>
                      </div>
                      <div className="flex justify-between text-red-400">
                        <span>✗ Pending:</span>
                        <span className="font-bold">{submissions.filter(s => !s.submittedAt || s.submittedAt === null).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teachers Chart */}
                  <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border border-gray-800 p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-2">👨‍🏫 Teachers Status</h3>
                    <p className="text-slate-400 text-sm mb-6">Workload distribution</p>
                    <div className="w-full h-80 flex items-center justify-center">
                      <Pie
                        data={{
                          labels: ['Have Classes', 'Unassigned'],
                          datasets: [{
                            data: [
                              users.filter(u => u.role === 'teacher' && classes.some(c => c.teacher?._id === u._id)).length,
                              users.filter(u => u.role === 'teacher' && !classes.some(c => c.teacher?._id === u._id)).length
                            ],
                            backgroundColor: ['#3b82f6', '#f59e0b'],
                            borderColor: ['#1d4ed8', '#d97706'],
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#cbd5e1', padding: 15, font: { size: 12, weight: 'bold' } }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-700 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Teachers:</span>
                        <span className="font-bold text-white">{users.filter(u => u.role === 'teacher').length}</span>
                      </div>
                      <div className="flex justify-between text-blue-400">
                        <span>✓ With Classes:</span>
                        <span className="font-bold">{users.filter(u => u.role === 'teacher' && classes.some(c => c.teacher?._id === u._id)).length}</span>
                      </div>
                      <div className="flex justify-between text-yellow-400">
                        <span>⊘ Unassigned:</span>
                        <span className="font-bold">{users.filter(u => u.role === 'teacher' && !classes.some(c => c.teacher?._id === u._id)).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Students Chart */}
                  <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border border-gray-800 p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-2">👨‍🎓 Student Enrollment</h3>
                    <p className="text-slate-400 text-sm mb-6">Participation metrics</p>
                    <div className="w-full h-80 flex items-center justify-center">
                      <Pie
                        data={{
                          labels: ['Enrolled', 'Not Enrolled'],
                          datasets: [{
                            data: [
                              users.filter(u => u.role === 'student' && classes.some(c => c.students?.some(s => s._id === u._id))).length,
                              users.filter(u => u.role === 'student' && !classes.some(c => c.students?.some(s => s._id === u._id))).length
                            ],
                            backgroundColor: ['#8b5cf6', '#64748b'],
                            borderColor: ['#7c3aed', '#475569'],
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#cbd5e1', padding: 15, font: { size: 12, weight: 'bold' } }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-700 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Students:</span>
                        <span className="font-bold text-white">{users.filter(u => u.role === 'student').length}</span>
                      </div>
                      <div className="flex justify-between text-purple-400">
                        <span>✓ Enrolled:</span>
                        <span className="font-bold">{users.filter(u => u.role === 'student' && classes.some(c => c.students?.some(s => s._id === u._id))).length}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>⊘ Not Enrolled:</span>
                        <span className="font-bold">{users.filter(u => u.role === 'student' && !classes.some(c => c.students?.some(s => s._id === u._id))).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
