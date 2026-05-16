import React, { useEffect, useState } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import Goals from './components/Goals'
import Help from './components/Help'
import Navbar from './components/Navbar'
import ResetPassword from './components/ResetPassword'
import { loadData, saveData, loadUser } from './utils/storage'

export default function App() {
  const [user, setUser] = useState(() => {
    const existing = loadUser()
    return (existing && existing.email) ? { email: existing.email } : null
  })
  const [view, setView] = useState('dashboard')
  const [data, setData] = useState(() => loadData())

  const resetToken = getResetTokenFromLocation()

  useEffect(()=>{
    saveData(data)
  },[data])

  function handleLogin(u){
    console.log('login:', u)
    setUser(u)
  }

  function handleLogout(){
    setUser(null)
  }

  if(resetToken) return <ResetPassword />

  if(!user) return <Auth onLogin={handleLogin} initialData={data} setData={setData} />

  return (
      <div className="relative min-h-screen overflow-hidden text-slate-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:px-8">
          {view === 'dashboard' && <Dashboard data={data} setData={setData} onLogout={handleLogout} setView={setView} />}
          {view === 'chat' && <Chat data={data} setData={setData} />}
          {view === 'goals' && <Goals data={data} setData={setData} />}
          {view === 'help' && <Help />}
        </div>
        <Navbar view={view} setView={setView} onLogout={handleLogout} />
      </div>
  )
}

function getResetTokenFromLocation(){
  const params = new URLSearchParams(window.location.search)
  const queryToken = params.get('reset')
  if(queryToken) return queryToken

  const hash = window.location.hash || ''
  // supports URLs like #/reset?token=abc123 or #reset=abc123
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : hash.replace(/^#\/?/, '')
  const hashParams = new URLSearchParams(hashQuery)
  return hashParams.get('token') || hashParams.get('reset') || null
}
