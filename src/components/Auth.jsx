import React, { useState } from 'react'
import { saveUser, loadUser, loadData, saveData, saveResetToken } from '../utils/storage'

export default function Auth({ onLogin, initialData, setData }){
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [resetInfo, setResetInfo] = useState('')

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

  function handleForgot(){
    const forgotEmail = prompt('Informe o email cadastrado para receber o link de redefinição:')
    if(!forgotEmail) return

    const existing = loadUser()
    if(!existing){ alert('Nenhum usuário cadastrado neste dispositivo.'); return }
    if(existing.email !== forgotEmail){ alert('Email não corresponde ao usuário cadastrado.'); return }

    const token = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
    const expires = Date.now() + 1000*60*60 // 1 hour
    const tokenObj = { token, email: forgotEmail, expires }
    saveResetToken(tokenObj)

    const link = `${window.location.origin}${window.location.pathname}#/reset?token=${token}`
    setResetLink(link)
    setResetInfo('Link de recuperação gerado. Você pode copiá-lo abaixo ou abrir seu cliente de e-mail.')

    const subject = encodeURIComponent('Redefinição de senha - Finanças MVP')
    const body = encodeURIComponent(`Use este link para redefinir sua senha:\n\n${link}\n\nSe você não solicitou, ignore.`)
    window.location.href = `mailto:${forgotEmail}?subject=${subject}&body=${body}`
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

        {resetLink ? (
          <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-900 mb-2">{resetInfo || 'Link de recuperação gerado.'}</p>
            <input
              readOnly
              value={resetLink}
              className="w-full p-2 border rounded bg-white text-xs mb-3"
              aria-label="Link de redefinição"
            />
            <button
              type="button"
              className="w-full bg-blue-700 text-white py-2 rounded"
              onClick={async () => {
                try {
                  if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(resetLink)
                  } else {
                    const temp = document.createElement('textarea')
                    temp.value = resetLink
                    temp.setAttribute('readonly', 'true')
                    temp.style.position = 'absolute'
                    temp.style.left = '-9999px'
                    document.body.appendChild(temp)
                    temp.select()
                    document.execCommand('copy')
                    document.body.removeChild(temp)
                  }
                  setResetInfo('Link copiado para a área de transferência.')
                } catch {
                  const input = document.querySelector('input[aria-label="Link de redefinição"]')
                  if (input) {
                    input.focus()
                    input.select()
                  }
                  setResetInfo('Não foi possível copiar automaticamente. Selecione o link acima e copie manualmente.')
                }
              }}
            >
              Copiar link
            </button>
          </div>
        ) : null}
      </form>
    </div>
  )
}
