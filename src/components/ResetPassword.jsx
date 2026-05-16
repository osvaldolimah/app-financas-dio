import React, { useEffect, useState } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { loadResetToken, clearResetToken, loadUser, saveUser } from '../utils/storage'

export default function ResetPassword(){
  const [tokenObj, setTokenObj] = useState(null)
  const [valid, setValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    const token = getResetTokenFromLocation()
    const obj = loadResetToken()
    if (obj && obj.token === token && obj.expires > Date.now()) {
      setTokenObj(obj)
      setValid(true)
    } else {
      setValid(false)
    }
  }, [])

  function handleSubmit(e){
    e.preventDefault()
    if(!valid) return
    if(password.length < 4){ alert('Senha muito curta'); return }
    if(password !== confirm){ alert('Senhas não conferem'); return }
    const user = loadUser()
    if(!user || user.email !== tokenObj.email){ alert('Token inválido para usuário'); return }
    user.senha = password
    saveUser(user)
    clearResetToken()
    alert('Senha redefinida com sucesso. Faça login com a nova senha.')
    window.history.replaceState(null, '', window.location.pathname)
    window.location.reload()
  }

  if(!tokenObj) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-6 text-slate-100 shadow-[0_25px_90px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          <Sparkles size={14} /> Recuperação segura
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/55 p-4">
          Link de recuperação inválido ou expirado.
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_25px_90px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          <Lock size={14} /> Redefinir senha
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Redefinir senha</h2>
        <p className="mt-2 text-sm text-slate-300/80">Conta: {tokenObj.email}</p>

        <label className="mt-6 block text-sm font-medium text-slate-200">Nova senha</label>
        <input type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500" value={password} onChange={e=>setPassword(e.target.value)} required />

        <label className="mt-4 block text-sm font-medium text-slate-200">Confirme a nova senha</label>
        <input type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500" value={confirm} onChange={e=>setConfirm(e.target.value)} required />

        <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-3 font-semibold text-slate-950 transition hover:brightness-110" type="submit">
          Redefinir senha
        </button>
      </form>
    </div>
  )
}

function getResetTokenFromLocation(){
  const params = new URLSearchParams(window.location.search)
  const queryToken = params.get('reset')
  if(queryToken) return queryToken

  const hash = window.location.hash || ''
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : hash.replace(/^#\/?/, '')
  const hashParams = new URLSearchParams(hashQuery)
  return hashParams.get('token') || hashParams.get('reset') || null
}
