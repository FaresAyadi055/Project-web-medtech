import React, { useEffect, useState } from 'react'
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../lib/useAuth'

export default function Comments({ taskId }){
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  useEffect(()=>{
    const q = query(collection(db, 'comments'), where('taskId','==',taskId), orderBy('timestamp','asc'))
    getDocs(q).then(snap=>{
      setComments(snap.docs.map(d=>({ id: d.id, ...d.data() })))
    })
  },[taskId])

  const handleAdd = async ()=>{
    if(!text.trim()) return
    await addDoc(collection(db, 'comments'), {
      taskId,
      userId: user.uid,
      text: text.trim(),
      timestamp: serverTimestamp(),
    })
    setText('')
    // reload
    const q = query(collection(db, 'comments'), where('taskId','==',taskId), orderBy('timestamp','asc'))
    const snap = await getDocs(q)
    setComments(snap.docs.map(d=>({ id: d.id, ...d.data() })))
  }

  return (
    <div className="p-4 rounded card">
      <h3 className="font-semibold mb-3">Discussion</h3>
      <div className="space-y-3 max-h-80 overflow-auto">
        {comments.map(c=> (
          <div key={c.id} className="p-2 border-b border-gray-800">
            <div className="text-xs text-slate-500">{c.userId}</div>
            <div className="mt-1">{c.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <textarea rows={3} value={text} onChange={e=>setText(e.target.value)} className="w-full p-2 bg-gray-800 rounded" placeholder="Write a comment..."></textarea>
        <div className="mt-2 text-right">
          <button onClick={handleAdd} className="py-1 px-3 bg-indigo-600 rounded">Comment</button>
        </div>
      </div>
    </div>
  )
}
