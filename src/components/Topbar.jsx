import React from 'react'
import { useAuth } from '../lib/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Topbar(){
  const { user } = useAuth()

  const handleSignOut = async ()=>{
    await signOut(auth)
    window.location.href = '/login'
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div></div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-300">{user?.name || user?.email}</div>
        <button onClick={handleSignOut} className="py-1 px-3 bg-gray-800 rounded">Sign out</button>
      </div>
    </div>
  )
}
