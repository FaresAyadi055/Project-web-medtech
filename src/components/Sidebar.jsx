import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="w-64 p-4 border-r border-gray-800 min-h-screen bg-black">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">UniTasks</h1>
        <p className="text-sm text-slate-400">University task manager</p>
      </div>

      <nav className="space-y-2">
        <NavLink to="/" end className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`} >Tasks</NavLink>
        <NavLink to="/forum" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>Forum</NavLink>
        <NavLink to="/submissions" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>My Submissions</NavLink>
        <NavLink to="/profile" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>Profile</NavLink>
      </nav>

      <div className="mt-6 text-xs text-slate-500">Dark theme • Local datastore (localStorage)</div>
    </aside>
  )
}
