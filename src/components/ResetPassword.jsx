import React, { useState, useEffect } from 'react'
import { loadResetToken, clearResetToken, loadUser, saveUser } from '../utils/storage'

export default function ResetPassword(){
  const [tokenObj, setTokenObj] = useState(null)
  const [valid, setValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(()=>{
    const token = getResetTokenFromLocation()
    const obj = loadResetToken()
    if(obj && obj.token === token && obj.expires > Date.now()){
      setTokenObj(obj)
      setValid(true)
    } else {
      setValid(false)
    }
  },[])

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
    // remove token from URL
    window.history.replaceState(null, '', window.location.pathname)
    window.location.reload()
  }

  if(!tokenObj) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow">Link de recuperação inválido ou expirado.</div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Redefinir senha para {tokenObj.email}</h2>
        <label className="text-sm">Nova senha</label>
        <input type="password" className="w-full p-2 border rounded mb-3" value={password} onChange={e=>setPassword(e.target.value)} required />
        <label className="text-sm">Confirme a nova senha</label>
        <input type="password" className="w-full p-2 border rounded mb-4" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
        <button className="w-full bg-green-600 text-white py-2 rounded" type="submit">Redefinir senha</button>
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
