import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../lib/useAuth'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import TaskCard from '../components/TaskCard'
import TaskEditor from '../components/TaskEditor'

export default function Dashboard(){
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(()=>{
    const q = query(collection(db, 'tasks'), orderBy('deadline', 'asc'))
    getDocs(q).then(snap=>{
      const arr = snap.docs.map(d=>({ id: d.id, ...d.data() }))
      setTasks(arr)
      setLoading(false)
    })
  },[])

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tasks</h2>
          {user?.role === 'professor' && (
            <button onClick={()=>setShowEditor(true)} className="py-2 px-4 rounded bg-indigo-600">Create Task</button>
          )}
        </div>

        {showEditor && <TaskEditor onClose={()=>setShowEditor(false)} />}

        {loading ? <div>Loading tasks...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(t=> <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
