import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function Profile(){
  const { user, setUser } = useAuth()
  const [name, setName] = useState('')
  const [major, setMajor] = useState('')
  const [role, setRole] = useState('student')

  useEffect(()=>{
    if(user){
      setName(user.name || '')
      setMajor(user.major || '')
      setRole(user.role || 'student')
    }
  },[user])

  const save = async ()=>{
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, { ...user, name, major, role }, { merge: true })
    // update local
    setUser({ ...user, name, major, role })
    alert('Saved')
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-64 p-4 border-r border-gray-800 min-h-screen bg-black">
        <h2 className="font-semibold">Profile</h2>
      </div>
      <div className="flex-1 p-6">
        <div className="card p-6 rounded max-w-2xl">
          <label className="block mb-2">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 bg-gray-800 rounded mb-3" />

          <label className="block mb-2">Major / Class</label>
          <input value={major} onChange={e=>setMajor(e.target.value)} className="w-full p-2 bg-gray-800 rounded mb-3" />

          <label className="block mb-2">Role</label>
          <select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-2 bg-gray-800 rounded mb-4">
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>

          <div className="text-right">
            <button onClick={save} className="py-2 px-4 bg-indigo-600 rounded">Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  )
}
