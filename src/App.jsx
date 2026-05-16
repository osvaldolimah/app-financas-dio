import React, { useEffect, useState } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import Goals from './components/Goals'
import Navbar from './components/Navbar'
import ResetPassword from './components/ResetPassword'
import { loadData, saveData } from './utils/storage'
import ErrorBoundary from './ErrorBoundary'

export default function App() {
  const [user, setUser] = useState(null)
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-xl mx-auto p-4">
          {view === 'dashboard' && <Dashboard data={data} setData={setData} onLogout={handleLogout} />}
          {view === 'chat' && <Chat data={data} setData={setData} />}
          {view === 'goals' && <Goals data={data} setData={setData} />}
        </div>
        <Navbar view={view} setView={setView} onLogout={handleLogout} />
      </div>
    </ErrorBoundary>
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
