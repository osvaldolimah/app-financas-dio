import React, { useState } from 'react'
import { saveUser, loadUser, saveResetToken } from '../utils/storage'

export default function Auth({ onLogin, initialData, setData }){
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [resetInfo, setResetInfo] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    const existing = loadUser()
    if(!existing){
      const user = { email, senha, createdAt: new Date().toISOString() }
      saveUser(user)
      onLogin({ email })
      if(!initialData) setData({ balance:0, transactions:[], investments:[], goals:[], metaFeedback: {yes:0, no:0} })
      return
    }

    if(existing.email !== email){
      alert('Já existe um usuário registrado neste dispositivo. Use o email cadastrado.')
      return
    }

    if(existing.senha !== senha){
      alert('Senha incorreta para este email.')
      return
    }

    onLogin({ email })
  }

  function handleForgot(){
    const existing = loadUser()
    setForgotEmail(email || existing?.email || '')
    setResetInfo('')
    setResetLink('')
    setForgotOpen(true)
  }

  function generateResetLink(){
    const emailToReset = forgotEmail.trim()
    if(!emailToReset){
      setResetInfo('Informe o email cadastrado para continuar.')
      return
    }

    const existing = loadUser()
    if(!existing){
      setResetInfo('Nenhum usuário cadastrado neste dispositivo.')
      return
    }
    if(existing.email !== emailToReset){
      setResetInfo('Email não corresponde ao usuário cadastrado.')
      return
    }

    const token = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
    const expires = Date.now() + 1000*60*60
    const tokenObj = { token, email: emailToReset, expires }
    saveResetToken(tokenObj)

    const link = `${window.location.origin}${window.location.pathname}#/reset?token=${token}`
    setResetLink(link)
    setResetInfo('Link de recuperação gerado. Você pode copiá-lo abaixo.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_25px_90px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          Banco Digital Premium
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Bem-vindo ao Finanças MVP</h1>
        <p className="mt-2 text-sm text-slate-300/80">Acesse sua conta local com um visual moderno, seguro e elegante.</p>

        <label className="mt-6 block text-sm font-medium text-slate-200">Email</label>
        <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500" value={email} onChange={e=>setEmail(e.target.value)} required />

        <label className="mt-4 block text-sm font-medium text-slate-200">Senha</label>
        <input type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500" value={senha} onChange={e=>setSenha(e.target.value)} required />

        <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-3 font-semibold text-slate-950 transition hover:brightness-110" type="submit">
          Entrar / Registrar
        </button>

        <div className="mt-4 text-center">
          <button type="button" className="text-sm font-medium text-cyan-200 underline decoration-cyan-400/30 underline-offset-4 transition hover:text-cyan-100" onClick={handleForgot}>
            Esqueci a senha
          </button>
        </div>

        {forgotOpen ? (
          <div className="mt-5 rounded-[1.75rem] border border-cyan-400/20 bg-slate-950/55 p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Recuperar senha</h2>
              <button type="button" className="text-xs font-medium text-slate-400 transition hover:text-white" onClick={() => setForgotOpen(false)}>Fechar</button>
            </div>
            <label className="mt-4 block text-sm text-slate-200">Email cadastrado</label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="Digite o email da conta"
            />
            <button type="button" className="mt-4 w-full rounded-2xl bg-white/10 py-3 font-semibold text-white transition hover:bg-white/15" onClick={generateResetLink}>
              Gerar link de redefinição
            </button>
            {resetInfo ? <p className="mt-3 text-sm text-slate-300">{resetInfo}</p> : null}
            {resetLink ? (
              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-sm text-cyan-100">Link de recuperação gerado.</p>
                <input
                  readOnly
                  value={resetLink}
                  className="mb-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-xs text-slate-100 outline-none"
                  aria-label="Link de redefinição"
                />
                <button
                  type="button"
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-3 font-semibold text-slate-950 transition hover:brightness-110"
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
          </div>
        ) : null}
      </form>
    </div>
  )
}
