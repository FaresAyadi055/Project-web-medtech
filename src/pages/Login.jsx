import React, { useState } from 'react'
import dbClient from '../lib/dbClient'
import { useAuth } from '../lib/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const navigate = useNavigate()

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (mode === 'signup') {
        const newUser = await signUp(email, password)
        // ensure profile is saved
        await dbClient.saveProfile(newUser.uid || newUser.id, { id: newUser.uid || newUser.id, name: email.split('@')[0], email, role: 'student', major: '' })
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg card">
        <h1 className="text-2xl font-semibold mb-4">UniTasks</h1>
        <p className="text-sm text-slate-400 mb-6">University task management — Sign in with email (local-only mode)</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 rounded bg-gray-800" />
          <input required value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 rounded bg-gray-800" />
          <div className="flex items-center justify-between">
            <button type="submit" className="py-2 px-4 rounded bg-indigo-600">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
            <button type="button" onClick={()=>setMode(mode==='login'?'signup':'login')} className="text-sm text-slate-400">{mode==='login'?'Create an account':'Have an account? Sign in'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
