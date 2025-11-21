import React, { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, db } from '../firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const navigate = useNavigate()

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const fbUser = result.user
      // ensure user doc exists
      await setDoc(doc(db, 'users', fbUser.uid), {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
        role: 'student',
        major: '',
        createdAt: serverTimestamp(),
      }, { merge: true })
      navigate('/')
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (mode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password)
        const fbUser = res.user
        await setDoc(doc(db, 'users', fbUser.uid), {
          id: fbUser.uid,
          name: email.split('@')[0],
          email,
          role: 'student',
          major: '',
          createdAt: serverTimestamp(),
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
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
        <p className="text-sm text-slate-400 mb-6">University task management — Sign in with Google or email</p>

        <button onClick={handleGoogle} className="w-full mb-4 py-2 rounded bg-slate-800 hover:bg-slate-700">Sign in with Google</button>

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
