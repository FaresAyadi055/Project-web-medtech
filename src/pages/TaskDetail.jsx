import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import dbClient from '../lib/dbClient'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Comments from '../components/Comments'
import Submissions from '../components/Submissions'

export default function TaskDetail(){
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    dbClient.fetchTaskById(id).then(t=>{
      setTask(t)
      setLoading(false)
    })
  },[id])

  if(loading) return <div className="p-8">Loading...</div>
  if(!task) return <div className="p-8">Task not found</div>

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar />

        <div className="card p-6 rounded">
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <p className="mt-3 text-slate-300">{task.description}</p>

          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Attachments</h4>
              <ul className="mt-2 space-y-1">
                {task.attachments.map((a, i)=> (
                  <li key={i}><a className="text-indigo-400" href={a.url} target="_blank" rel="noreferrer">{a.name}</a></li>
                ))}
              </ul>
            </div>
          )}

        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Comments taskId={task.id} />
          <Submissions task={task} />
        </div>
      </div>
    </div>
  )
}
