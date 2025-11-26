import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'

export default function TaskDetail(){
  const { id } = useParams()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [content, setContent] = useState('')

  useEffect(()=>{
    fetchTask()
    if(user?.role !== 'student') {
      fetchSubmissions()
    }
  },[id])

  const fetchTask = async () => {
    try {
      const resp = await api.get(`/tasks/${id}`)
      setTask(resp.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching task:', err)
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const resp = await api.get(`/submissions/task/${id}`)
      setSubmissions(resp.data)
    } catch (err) {
      console.error('Error fetching submissions:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      alert('Please enter submission content')
      return
    }

    try {
      await api.post('/submissions', { taskId: id, content })
      setContent('')
      setShowSubmitForm(false)
      alert('Submission successful!')
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed')
    }
  }

  const handleGradeSubmission = async (submissionId, status) => {
    try {
      await api.post(`/submissions/${submissionId}/grade`, { status })
      fetchSubmissions()
    } catch (err) {
      alert('Failed to grade submission')
    }
  }

  if(loading) return <div className="p-8">Loading...</div>
  if(!task) return <div className="p-8">Task not found</div>

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <div className="max-w-4xl">
            <div className="p-6 rounded card mb-6 border border-gray-800">
              <h2 className="text-3xl font-bold mb-3">{task.title}</h2>
              <p className="text-slate-300 mb-4">{task.description}</p>
              <div className="text-sm text-slate-400">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Student submission section */}
            {user?.role === 'student' && (
              <div className="mb-6 p-6 rounded card border border-gray-800">
                <h3 className="font-semibold mb-4">Submit Your Work</h3>
                {!showSubmitForm ? (
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded"
                  >
                    Submit Task
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your submission content..."
                      className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubmitForm(false)
                          setContent('')
                        }}
                        className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Teacher submission review section */}
            {user?.role === 'teacher' && (
              <div className="p-6 rounded card border border-gray-800">
                <h3 className="font-semibold mb-4">Student Submissions ({submissions.length})</h3>
                {submissions.length === 0 ? (
                  <p className="text-slate-400">No submissions yet</p>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission._id} className="p-4 border border-gray-700 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{submission.student?.name}</h4>
                            <p className="text-sm text-slate-400">{submission.student?.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            submission.status === 'approved'
                              ? 'bg-green-900 text-green-200'
                              : submission.status === 'rejected'
                              ? 'bg-red-900 text-red-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-slate-300 my-3">{submission.content}</p>
                        <div className="text-xs text-slate-400 mb-3">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGradeSubmission(submission._id, 'approved')}
                            className="py-1 px-3 bg-green-900 hover:bg-green-800 text-green-200 text-sm rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleGradeSubmission(submission._id, 'rejected')}
                            className="py-1 px-3 bg-red-900 hover:bg-red-800 text-red-200 text-sm rounded"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
