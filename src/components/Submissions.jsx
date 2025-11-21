import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from '../lib/useAuth'
import { v4 as uuidv4 } from 'uuid'

export default function Submissions({ task }){
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(()=>{
    const q = query(collection(db, 'submissions'), where('taskId','==',task.id))
    getDocs(q).then(snap=> setSubmissions(snap.docs.map(d=>({ id: d.id, ...d.data() }))))
  },[task.id])

  const handleFiles = (e)=> setFiles(Array.from(e.target.files))

  const handleSubmit = async ()=>{
    if(!files.length) return
    setUploading(true)
    try{
      const uploaded = []
      for(const f of files){
        const r = ref(storage, `submissions/${uuidv4()}_${f.name}`)
        const s = await uploadBytes(r, f)
        const url = await getDownloadURL(s.ref)
        uploaded.push({ name: f.name, url })
      }

      await addDoc(collection(db, 'submissions'), {
        taskId: task.id,
        studentId: user.uid,
        files: uploaded,
        status: 'submitted',
        createdAt: serverTimestamp(),
      })

      // reload
      const q = query(collection(db, 'submissions'), where('taskId','==',task.id))
      const snap = await getDocs(q)
      setSubmissions(snap.docs.map(d=>({ id: d.id, ...d.data() })))
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
