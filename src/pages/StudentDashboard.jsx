import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [classes, setClasses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch classes for this student
      const classesResp = await api.get('/classes')
      const studentClasses = classesResp.data.filter((c) =>
        c.students?.some((s) => s._id === user?.uid)
      )
      setClasses(studentClasses)

      // Fetch all tasks for student's classes
      const allTasks = []
      for (const cls of studentClasses) {
        const tasksResp = await api.get(`/tasks/class/${cls._id}`)
        allTasks.push(...tasksResp.data)
      }
      setTasks(allTasks)

      // Fetch submissions for this student
      const submissionsResp = await api.get('/submissions/student')
      setSubmissions(submissionsResp.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSubmissionStatus = (taskId) => {
    const submission = submissions.find((s) => s.task?._id === taskId)
    return submission?.status || 'not-submitted'
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`pb-3 px-2 ${activeTab === 'tasks' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`pb-3 px-2 ${activeTab === 'submissions' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
                >
                  Submissions
                </button>
                <button
                  onClick={() => setActiveTab('classes')}
                  className={`pb-3 px-2 ${activeTab === 'classes' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
                >
                  My Classes
                </button>
              </div>

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  <h3 className="font-semibold mb-4">Tasks for Your Classes</h3>
                  {tasks.length === 0 ? (
                    <div className="p-8 text-center rounded card text-slate-400">
                      No tasks available yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tasks.map((task) => {
                        const status = getSubmissionStatus(task._id)
                        return (
                          <div key={task._id} className="p-4 rounded card border border-gray-800 hover:border-gray-700">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-lg flex-1">{task.title}</h4>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  status === 'approved'
                                    ? 'bg-green-900 text-green-200'
                                    : status === 'rejected'
                                    ? 'bg-red-900 text-red-200'
                                    : status === 'pending'
                                    ? 'bg-yellow-900 text-yellow-200'
                                    : 'bg-gray-800 text-slate-300'
                                }`}
                              >
                                {status === 'not-submitted' ? 'Not Submitted' : status}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm mb-4">{task.description}</p>
                            <Link
                              to={`/tasks/${task._id}`}
                              className="inline-block py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium"
                            >
                              View Task
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Submissions Tab */}
              {activeTab === 'submissions' && (
                <div>
                  <h3 className="font-semibold mb-4">Your Submissions</h3>
                  {submissions.length === 0 ? (
                    <div className="p-8 text-center rounded card text-slate-400">
                      No submissions yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <div key={submission._id} className="p-4 rounded card border border-gray-800">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{submission.task?.title}</h4>
                              <p className="text-sm text-slate-400 mt-1">
                                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                submission.status === 'approved'
                                  ? 'bg-green-900 text-green-200'
                                  : submission.status === 'rejected'
                                  ? 'bg-red-900 text-red-200'
                                  : 'bg-yellow-900 text-yellow-200'
                              }`}
                            >
                              {submission.status}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm">{submission.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Classes Tab */}
              {activeTab === 'classes' && (
                <div>
                  <h3 className="font-semibold mb-4">My Classes</h3>
                  {classes.length === 0 ? (
                    <div className="p-8 text-center rounded card text-slate-400">
                      Not enrolled in any classes yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classes.map((cls) => (
                        <div key={cls._id} className="p-4 rounded card border border-gray-800">
                          <h4 className="font-semibold text-lg mb-2">{cls.name}</h4>
                          <div className="space-y-1 text-sm text-slate-400">
                            <p>Teacher: {cls.teacher?.name}</p>
                            <p>Students: {cls.students?.length}</p>
                            <p>Tasks: {cls.tasks?.length || 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
