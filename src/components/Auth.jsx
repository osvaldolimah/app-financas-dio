import React, { useState } from 'react'
import { saveUser, loadUser, loadData, saveData, saveResetToken } from '../utils/storage'

export default function Auth({ onLogin, initialData, setData }){
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    const existing = loadUser()
    if(!existing){
      // first-time registration: create the single local user
      const user = { email, senha, createdAt: new Date().toISOString() }
      saveUser(user)
      onLogin({ email })
      if(!initialData) setData({ balance:0, transactions:[], investments:[], goals:[], metaFeedback: {yes:0, no:0} })
      return
    }

    // If a user already exists, only allow login for that user
    if(existing.email !== email){
      alert('Já existe um usuário registrado neste dispositivo. Use o email cadastrado.')
      return
    }

    // same email — check password
    if(existing.senha !== senha){
      alert('Senha incorreta para este email.')
      return
    }

    onLogin({ email })
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
        <div className="mt-3 text-center">
          <button type="button" className="text-sm text-blue-600 underline" onClick={() => handleForgot()}>Esqueci a senha</button>
        </div>
      </form>
    </div>
  )
}

function handleForgot(){
  const email = prompt('Informe o email cadastrado para receber o link de redefinição:')
  if(!email) return
  const existing = loadUser()
  if(!existing){ alert('Nenhum usuário cadastrado neste dispositivo.'); return }
  if(existing.email !== email){ alert('Email não corresponde ao usuário cadastrado.'); return }
  // generate token
  const token = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
  const expires = Date.now() + 1000*60*60 // 1 hour
  const tokenObj = { token, email, expires }
  saveResetToken(tokenObj)
  const resetLink = `${window.location.origin}${window.location.pathname}#/reset?token=${token}`
  const subject = encodeURIComponent('Redefinição de senha - Finanças MVP')
  const body = encodeURIComponent(`Use este link para redefinir sua senha:\n\n${resetLink}\n\nSe você não solicitou, ignore.`)
  // Open mail client with prefilled message
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  alert('Um link de redefinição foi preparado no seu cliente de e-mail. Se preferir, copie o link:\n' + resetLink)
}
