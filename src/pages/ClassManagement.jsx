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
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [draggedTeacher, setDraggedTeacher] = useState(null)
  const [draggedStudent, setDraggedStudent] = useState(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const [classesResp, usersResp] = await Promise.all([
        api.get('/classes'),
        user?.role === 'admin' ? api.get('/users') : Promise.resolve({ data: [] })
      ])
      if (user?.role === 'teacher') {
        const teacherClasses = classesResp.data.filter((c) => c.teacher?._id === user?.uid)
        setClasses(teacherClasses)
      } else {
        setClasses(classesResp.data)
      }
      setAllUsers(usersResp.data)
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
    if (!selectedStudentToAdd) return alert('Select a student to add')
    try {
      await api.post(`/classes/${selectedClass._id}/enroll`, { studentId: selectedStudentToAdd })
      setShowAddStudent(false)
      setSelectedStudentToAdd('')
      await fetchClasses()
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

  const handleCreateClass = async (e) => {
    e.preventDefault()
    if (!newClassName.trim()) {
      alert('Please enter a class name')
      return
    }

    try {
      await api.post('/classes', { name: newClassName })
      setNewClassName('')
      setShowCreateForm(false)
      fetchClasses()
    } catch (err) {
      alert('Failed to create class')
    }
  }

  // Drag and Drop handlers for Teachers
  const handleTeacherDragStart = (e, teacher) => {
    e.dataTransfer.setData('teacherId', teacher._id)
    e.dataTransfer.setData('teacherName', teacher.name)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedTeacher(teacher)
  }

  const handleTeacherDragEnd = () => {
    setDraggedTeacher(null)
  }

  const handleTeacherDrop = async (e, classId) => {
    e.preventDefault()
    e.stopPropagation()
    
    const teacherId = e.dataTransfer.getData('teacherId')
    if (!teacherId) return

    try {
      await api.post(`/classes/${classId}/assign-teacher`, { teacherId })
      await fetchClasses()
      if (selectedClass?._id === classId) {
        const updatedClass = classes.find(c => c._id === classId)
        if (updatedClass) handleSelectClass(updatedClass)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign teacher')
    } finally {
      setDraggedTeacher(null)
    }
  }

  // Drag and Drop handlers for Students
  const handleStudentDragStart = (e, student) => {
    e.dataTransfer.setData('studentId', student._id)
    e.dataTransfer.setData('studentName', student.name)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedStudent(student)
  }

  const handleStudentDragEnd = () => {
    setDraggedStudent(null)
  }

  const handleStudentDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const studentId = e.dataTransfer.getData('studentId')
    if (!studentId || !selectedClass) return

    try {
      await api.post(`/classes/${selectedClass._id}/enroll`, { studentId })
      await fetchClasses()
      const updatedClass = classes.find(c => c._id === selectedClass._id)
      if (updatedClass) handleSelectClass(updatedClass)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll student')
    } finally {
      setDraggedStudent(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }


  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-10">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                Class Management
              </h1>
              <p className="text-slate-400 text-lg">Organize your classes, manage teachers and students</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-slate-400 text-lg">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mr-3"></div>
                  Loading...
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Admin Section - Create & Drag Drop */}
                {user?.role === 'admin' && (
                  <div className="space-y-6">
                    {/* Create Class Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border border-gray-800 hover:border-gray-700 transition-all duration-300 p-6 shadow-lg hover:shadow-xl">
                      <div className="flex justify-between items-center mb-5">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">✨ Create New Class</h3>
                          <p className="text-slate-400 text-sm">Add a new class to your organization</p>
                        </div>
                        <button
                          onClick={() => setShowCreateForm(!showCreateForm)}
                          className={`py-2 px-5 rounded-lg font-medium transition-all duration-300 ${
                            showCreateForm
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                          }`}
                        >
                          {showCreateForm ? '✕ Cancel' : '+ New Class'}
                        </button>
                      </div>
                      {showCreateForm && (
                        <form onSubmit={handleCreateClass} className="space-y-4 pt-5 border-t border-gray-700">
                          <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="Enter class name (e.g., CS101 - Web Development)"
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
                          >
                            Create Class
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Drag and Drop Pools */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Teachers Pool */}
                      <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-850 border border-blue-800 p-6 shadow-lg">
                        <div className="mb-5">
                          <h3 className="text-lg font-bold text-blue-200 mb-1">👨‍🏫 Available Teachers</h3>
                          <p className="text-blue-300 text-sm opacity-75">Drag to assign to a class</p>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                          {allUsers.filter(u => u.role === 'teacher').length > 0 ? (
                            allUsers.filter(u => u.role === 'teacher').map(teacher => (
                              <div
                                key={teacher._id}
                                draggable="true"
                                onDragStart={(e) => handleTeacherDragStart(e, teacher)}
                                onDragEnd={handleTeacherDragEnd}
                                className="p-4 border border-blue-600 rounded-xl bg-gradient-to-r from-blue-900 to-blue-800 bg-opacity-50 cursor-move hover:from-blue-800 hover:to-blue-700 hover:shadow-md transition-all duration-200 active:scale-95"
                              >
                                <div className="font-semibold text-blue-100">{teacher.name}</div>
                                <div className="text-xs text-blue-300 opacity-75 mt-1">{teacher.email}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm text-center py-6">No teachers available</p>
                          )}
                        </div>
                      </div>

                      {/* Students Pool */}
                      <div className="rounded-2xl bg-gradient-to-br from-green-900 to-green-850 border border-green-800 p-6 shadow-lg">
                        <div className="mb-5">
                          <h3 className="text-lg font-bold text-green-200 mb-1">👨‍🎓 Available Students</h3>
                          <p className="text-green-300 text-sm opacity-75">Drag to enroll in a class</p>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                          {allUsers.filter(u => u.role === 'student').length > 0 ? (
                            allUsers.filter(u => u.role === 'student').map(student => (
                              <div
                                key={student._id}
                                draggable="true"
                                onDragStart={(e) => handleStudentDragStart(e, student)}
                                onDragEnd={handleStudentDragEnd}
                                className="p-4 border border-green-600 rounded-xl bg-gradient-to-r from-green-900 to-green-800 bg-opacity-50 cursor-move hover:from-green-800 hover:to-green-700 hover:shadow-md transition-all duration-200 active:scale-95"
                              >
                                <div className="font-semibold text-green-100">{student.name}</div>
                                <div className="text-xs text-green-300 opacity-75 mt-1">{student.email}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm text-center py-6">No students available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content - Classes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Classes Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border border-gray-800 p-6 sticky top-24 shadow-lg max-h-[calc(100vh-200px)] flex flex-col">
                      <div className="mb-5">
                        <h3 className="text-lg font-bold text-white">📚 Classes</h3>
                        <p className="text-slate-400 text-xs mt-1">Total: {classes.length}</p>
                      </div>
                      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {classes.length > 0 ? (
                          classes.map((cls) => {
                            const isEnrolled = cls.students?.some(s => s._id === user?.uid)
                            return (
                              <div
                                key={cls._id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleTeacherDrop(e, cls._id)}
                                className={`group p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                  selectedClass?._id === cls._id 
                                    ? 'bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-500 shadow-lg' 
                                    : draggedTeacher
                                    ? 'border-blue-400 bg-blue-900 bg-opacity-30'
                                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800 hover:shadow-md'
                                }`}
                              >
                                <button
                                  onClick={() => handleSelectClass(cls)}
                                  className="w-full text-left"
                                >
                                  <div className="font-semibold text-white group-hover:text-indigo-300 transition">{cls.name}</div>
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    <div>👨‍🏫 {cls.teacher?.name || 'No teacher'}</div>
                                    <div>👨‍🎓 {cls.students?.length || 0} students</div>
                                  </div>
                                </button>
                                {user?.role === 'student' && !isEnrolled && (
                                  <button
                                    onClick={() => handleEnrollSelf(cls._id)}
                                    className="mt-3 w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                                  >
                                    Enroll Now
                                  </button>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-slate-400 text-sm text-center py-8">No classes yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Class Details */}
                  <div className="lg:col-span-3 space-y-6">
                    {selectedClass ? (
                      <div className="space-y-6">
                        {/* Class Header Card */}
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-800 p-8 shadow-xl">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h2 className="text-4xl font-bold text-white mb-3">{selectedClass.name}</h2>
                              <p className="text-indigo-200 text-sm opacity-75">Class ID: {selectedClass._id?.slice(-8)}</p>
                            </div>
                          </div>

                          {/* Class Stats */}
                          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-indigo-700">
                            <div className="bg-black bg-opacity-30 rounded-lg p-4">
                              <p className="text-indigo-300 text-xs uppercase font-semibold opacity-75 mb-2">👨‍🏫 Teacher</p>
                              <p className="text-white text-lg font-bold">{selectedClass.teacher?.name || 'Unassigned'}</p>
                              {selectedClass.teacher && (
                                <p className="text-slate-400 text-xs mt-1">{selectedClass.teacher.email}</p>
                              )}
                            </div>
                            <div className="bg-black bg-opacity-30 rounded-lg p-4">
                              <p className="text-indigo-300 text-xs uppercase font-semibold opacity-75 mb-2">👨‍🎓 Students</p>
                              <p className="text-white text-lg font-bold">{selectedClass.students?.length || 0}</p>
                              <p className="text-slate-400 text-xs mt-1">Total enrolled</p>
                            </div>
                          </div>

                          {/* Teacher Management */}
                          {user?.role === 'admin' && (
                            <div className="mt-6 pt-6 border-t border-indigo-700 flex gap-3">
                              <button
                                onClick={handleAssignTeacher}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                              >
                                🔄 Change Teacher
                              </button>
                              {selectedClass.teacher && (
                                <button
                                  onClick={handleRemoveTeacher}
                                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                                >
                                  ✕ Remove Teacher
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Enrolled Students Section */}
                        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border border-gray-800 p-8 shadow-lg">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">👨‍🎓 Enrolled Students</h3>
                              <p className="text-slate-400 text-sm">{students.length} students in this class</p>
                            </div>
                            {user?.role === 'teacher' && (
                              <div>
                                {!showAddStudent ? (
                                  <button
                                    onClick={() => setShowAddStudent(true)}
                                    className="py-2 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                                  >
                                    + Add Student
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <select value={selectedStudentToAdd} onChange={(e) => setSelectedStudentToAdd(e.target.value)} className="p-2 rounded bg-gray-800 border border-gray-700 text-sm">
                                      <option value="">Select student...</option>
                                      {allUsers.filter(u => u.role === 'student' && !(selectedClass.students||[]).some(s=>s._id===u._id)).map(s => (
                                        <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                                      ))}
                                    </select>
                                    <button onClick={handleEnrollStudent} className="py-2 px-3 bg-green-600 rounded text-sm">Add</button>
                                    <button onClick={() => { setShowAddStudent(false); setSelectedStudentToAdd('') }} className="py-2 px-3 bg-gray-700 rounded text-sm">Cancel</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Drop Zone */}
                          <div
                            onDragOver={handleDragOver}
                            onDrop={handleStudentDrop}
                            className={`p-8 rounded-xl border-2 border-dashed transition-all duration-300 mb-6 flex flex-col items-center justify-center min-h-32 ${
                              draggedStudent
                                ? 'border-green-500 bg-green-900 bg-opacity-30 shadow-lg shadow-green-500/50'
                                : 'border-slate-600 hover:border-slate-400 bg-slate-900 bg-opacity-30'
                            }`}
                          >
                            <p className="text-slate-300 font-medium text-center">
                              {draggedStudent ? '✅ Drop to enroll' : '🎯 Drag students here'}
                            </p>
                            <p className="text-slate-500 text-xs mt-2">From the available students list</p>
                          </div>

                          {/* Students List */}
                          {students.length === 0 ? (
                            <div className="text-center py-12 bg-black bg-opacity-20 rounded-lg border border-gray-800">
                              <p className="text-slate-400 text-lg">No students enrolled yet</p>
                              <p className="text-slate-500 text-sm mt-2">Drag students from the panel or add manually</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {students.map((student) => (
                                <div
                                  key={student._id}
                                  className="flex items-center justify-between p-4 border border-gray-700 rounded-xl hover:border-gray-600 hover:bg-gray-800 transition-all duration-200 group"
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold text-white">{student.name}</div>
                                    <div className="text-sm text-slate-400 mt-1">{student.email}</div>
                                  </div>
                                  {(user?.role === 'teacher' || (user?.role === 'student' && student._id === user?.uid)) && (
                                    <button
                                      onClick={() => handleRemoveStudent(student._id)}
                                      className="ml-4 py-2 px-4 bg-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all duration-200"
                                    >
                                      {user?.role === 'student' ? 'Leave' : 'Remove'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-96 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border-2 border-dashed border-gray-700">
                        <div className="text-center">
                          <p className="text-3xl mb-3">📖</p>
                          <p className="text-slate-400 text-lg font-medium">Select a class to view details</p>
                          <p className="text-slate-500 text-sm mt-2">Click on any class from the left panel</p>
                        </div>
                      </div>
                    )}
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
