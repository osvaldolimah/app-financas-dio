import React, { useState } from 'react'
import { saveUser, loadUser, loadData, saveData } from '../utils/storage'

export default function Auth({ onLogin, initialData, setData }){
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    const existing = loadUser()
    if(existing && existing.email === email){
      // user exists — check password
      if(existing.senha !== senha){
        alert('Senha incorreta para este email.')
        return
      }
      onLogin({ email })
    } else {
      // register new user
      const user = { email, senha, createdAt: new Date().toISOString() }
      saveUser(user)
      onLogin({ email })
      // ensure data exists
      if(!initialData) setData({ balance:0, transactions:[], investments:[], goals:[], metaFeedback: {yes:0, no:0} })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao Finanças MVP</h1>
        <label className="text-sm">Email</label>
        <input className="w-full p-2 border rounded mb-3" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="text-sm">Senha</label>
        <input type="password" className="w-full p-2 border rounded mb-4" value={senha} onChange={e=>setSenha(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">Entrar / Registrar</button>
      </form>
    </div>
  )
}
