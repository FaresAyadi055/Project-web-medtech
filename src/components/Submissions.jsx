import React, { useEffect, useState } from 'react'
import dbClient from '../lib/dbClient'
import { useAuth } from '../lib/useAuth'
import { v4 as uuidv4 } from 'uuid'

export default function Submissions({ task }){
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(()=>{
    dbClient.getSubmissions(task.id).then(list=> setSubmissions(list))
  },[task.id])

  const handleFiles = (e)=> setFiles(Array.from(e.target.files))

  const handleSubmit = async ()=>{
    if(!files.length) return
    setUploading(true)
    try{
      await dbClient.addSubmission({ taskId: task.id, studentId: user.uid, status: 'submitted' }, files)

      // reload
      const list = await dbClient.getSubmissions(task.id)
      setSubmissions(list)
      setFiles([])
    }catch(err){
      console.error(err)
      alert(err.message)
    }finally{
      setUploading(false)
    }
  }

  return (
    <div className="p-4 rounded card">
      <h3 className="font-semibold mb-3">Submissions</h3>

      {user?.role === 'student' && (
        <div className="mb-4">
          <input type="file" multiple onChange={handleFiles} />
          <div className="mt-2">
            <button onClick={handleSubmit} disabled={uploading} className="py-1 px-3 bg-indigo-600 rounded">{uploading ? 'Uploading...' : 'Submit'}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {submissions.map(s => (
          <div key={s.id} className="p-2 border border-gray-800 rounded">
            <div className="text-xs text-slate-500">{s.studentId} • {s.status}</div>
            <ul className="mt-2">
              {s.files?.map((f,i)=> <li key={i}><a className="text-indigo-400" href={f.url} target="_blank" rel="noreferrer">{f.name}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
