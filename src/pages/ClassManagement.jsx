import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'

export default function ClassManagement() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const resp = await api.get('/classes')
      if (user?.role === 'teacher') {
        const teacherClasses = resp.data.filter((c) => c.teacher?._id === user?.uid)
        setClasses(teacherClasses)
      } else {
        setClasses(resp.data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectClass = async (cls) => {
    setSelectedClass(cls)
    setStudents(cls.students || [])
  }

  const handleEnrollStudent = async () => {
    const email = prompt('Enter student email:')
    if (!email) return

    try {
      const usersResp = await api.get('/users')
      const student = usersResp.data.find((u) => u.email === email)
      if (!student) {
        alert('Student not found')
        return
      }

      await api.post(`/classes/${selectedClass._id}/enroll`, { studentId: student._id })
      fetchClasses()
      handleSelectClass(selectedClass)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll student')
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the class?')) return

    try {
      await api.post(`/classes/${selectedClass._id}/remove-student`, { studentId })
      fetchClasses()
      handleSelectClass(selectedClass)
    } catch (err) {
      alert('Failed to remove student')
    }
  }

  const handleEnrollSelf = async (classId) => {
    try {
      await api.post(`/classes/${classId}/enroll-self`)
      fetchClasses()
      if (selectedClass?._id === classId) handleSelectClass(selectedClass)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll')
    }
  }

  const handleAssignTeacher = async () => {
    const email = prompt('Enter teacher email:')
    if (!email) return

    try {
      const usersResp = await api.get('/users')
      const teacher = usersResp.data.find((u) => u.email === email && u.role === 'teacher')
      if (!teacher) {
        alert('Teacher not found')
        return
      }

      await api.post(`/classes/${selectedClass._id}/assign-teacher`, { teacherId: teacher._id })
      fetchClasses()
      handleSelectClass(selectedClass)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign teacher')
    }
  }

  const handleRemoveTeacher = async () => {
    if (!window.confirm('Remove teacher from this class?')) return

    try {
      await api.post(`/classes/${selectedClass._id}/remove-teacher`)
      fetchClasses()
      handleSelectClass(selectedClass)
    } catch (err) {
      alert('Failed to remove teacher')
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <h2 className="text-2xl font-bold mb-6">Class Management</h2>

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Classes List */}
              <div className="lg:col-span-1">
                <div className="rounded card p-4 sticky top-24">
                  <h3 className="font-semibold mb-4">Classes</h3>
                  <div className="space-y-2">
                    {classes.map((cls) => {
                      const isEnrolled = cls.students?.some(s => s._id === user?.uid)
                      return (
                        <div key={cls._id} className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelectClass(cls)}
                            className={`flex-1 text-left p-3 rounded border ${
                              selectedClass?._id === cls._id
                                ? 'bg-indigo-900 border-indigo-600'
                                : 'border-gray-800 hover:bg-gray-900'
                            }`}
                          >
                            <div className="font-medium">{cls.name}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {cls.students?.length || 0} students
                            </div>
                          </button>
                          {user?.role === 'student' && !isEnrolled && (
                            <button
                              onClick={() => handleEnrollSelf(cls._id)}
                              className="py-1 px-2 bg-green-600 text-xs rounded hover:bg-green-700"
                            >
                              Enroll
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {classes.length === 0 && (
                    <p className="text-slate-400 text-sm">No classes available</p>
                  )}
                </div>
              </div>

              {/* Class Details */}
              <div className="lg:col-span-2">
                {selectedClass ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{selectedClass.name}</h3>
                      <div className="flex gap-4 text-slate-400">
                        <div>
                          <span className="text-xs text-slate-500">Teacher</span>
                          <p className="font-medium">{selectedClass.teacher?.name || 'Unassigned'}</p>
                          {user?.role === 'admin' && (
                            <div className="mt-1 space-x-2">
                              <button
                                onClick={handleAssignTeacher}
                                className="text-xs py-1 px-2 bg-blue-600 rounded hover:bg-blue-700"
                              >
                                Assign Teacher
                              </button>
                              {selectedClass.teacher && (
                                <button
                                  onClick={handleRemoveTeacher}
                                  className="text-xs py-1 px-2 bg-red-600 rounded hover:bg-red-700"
                                >
                                  Remove Teacher
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Students</span>
                          <p className="font-medium">{selectedClass.students?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Students List */}
                    <div className="rounded card p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg">Enrolled Students</h4>
                        {user?.role === 'teacher' && (
                          <button
                            onClick={handleEnrollStudent}
                            className="py-1 px-3 bg-indigo-600 text-sm rounded hover:bg-indigo-700"
                          >
                            Add Student
                          </button>
                        )}
                      </div>

                      {students.length === 0 ? (
                        <p className="text-slate-400 text-sm">No students enrolled yet</p>
                      ) : (
                        <div className="space-y-2">
                          {students.map((student) => (
                            <div
                              key={student._id}
                              className="flex justify-between items-center p-3 border border-gray-800 rounded hover:bg-gray-900"
                            >
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-slate-400">{student.email}</div>
                              </div>
                              {user?.role === 'teacher' && (
                                <button
                                  onClick={() => handleRemoveStudent(student._id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              )}
                              {user?.role === 'student' && student._id === user?.uid && (
                                <button
                                  onClick={() => handleRemoveStudent(student._id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Leave Class
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded card text-slate-400">
                    Select a class to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
