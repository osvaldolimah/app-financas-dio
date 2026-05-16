import React, { useState } from 'react'
import { BookOpen, Lightbulb, Sparkles, MessageSquare, Send, Trash2 } from 'lucide-react'
import { parseMessage } from '../utils/aiParser'

function last4(messages){
  return messages.slice(-4)
}

function buildInvestmentOpinion(asset){
  const normalized = (asset || '').toLowerCase()

  if(normalized === 'poupança') return 'Minha opinião: a poupança é fácil de usar e tem liquidez, mas normalmente rende pouco. Se a ideia é guardar com segurança e ganhar melhor do que a poupança, Tesouro Selic ou um CDB de liquidez diária costumam ser opções mais interessantes.'
  if(normalized === 'ações') return 'Minha opinião: ações podem trazer retorno maior no longo prazo, mas oscilam bastante. Se você não quer ver o valor variar muito, Tesouro Selic ou CDB de liquidez diária são mais tranquilos. Se aceitar risco e prazo maior, ações fazem sentido com diversificação.'
  if(normalized === 'tesouro') return 'Minha opinião: o Tesouro é uma porta de entrada mais conservadora. Para reserva de emergência, o Tesouro Selic costuma ser mais adequado. Para proteger do aumento dos preços, o IPCA+ é uma alternativa melhor que a poupança.'
  if(normalized === 'cdb') return 'Minha opinião: CDB é uma opção prática de renda fixa. Para curto prazo, olhe liquidez diária e FGC. Em muitos casos ele é mais interessante do que a poupança e ainda simples de entender.'
  if(normalized === 'fii') return 'Minha opinião: FIIs podem gerar renda periódica, mas variam de preço e exigem mais atenção. Se você quer algo simples e conservador, Tesouro Selic ou CDB diário são mais previsíveis.'
  if(normalized === 'dólar' || normalized === 'dolar') return 'Minha opinião: ter exposição ao Dólar é excelente para proteger seu patrimônio de oscilações da economia local, mas lembre-se que moeda guardada não rende juros sozinha. Uma boa estratégia é investir em ativos atrelados a ele.'

  return 'Minha opinião: antes de investir, vale comparar risco, prazo e liquidez. Se você quiser, eu posso comparar esse ativo com Tesouro Selic, CDB ou poupança.'
}

export default function Chat({ data, setData }){
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState({})
  const messages = Array.isArray(data.chatMessages) ? data.chatMessages : []
  const pending = data.chatPending || null

  function send(){
    if(!input.trim()) return

    const userMsg = { role: 'user', text: input }
    const result = parseMessage(input, data)
    const botMsg = { role: 'bot', text: result.reply, details: result.details }

    setData(prev => {
      const next = { ...prev, chatPending: null }

      if(result.action === 'clarify'){
        next.chatPending = {
          kind: result.kind,
          amount: result.amount,
          candidates: result.candidates || [],
          asset: result.asset || null,
          originalText: result.text,
          reply: result.reply,
        }
      }

      if(result.action === 'deposit'){
        next.balance = (next.balance || 0) + result.amount
        next.transactions = [...(next.transactions || []), { type: 'deposit', amount: result.amount, desc: result.text, date: new Date().toISOString() }]
      }

      if(result.action === 'deposit_goal'){
                const nextGoals = (next.goals || []).map(g => g.name === result.goal ? { ...g, current: (g.current || 0) + result.amount } : g)
                if(nextGoals.find(g => g.name === result.goal)){
                  next.goals = nextGoals
                  next.balance = (next.balance || 0) - result.amount
          next.transactions = [...(next.transactions || []), { type: 'deposit_goal', amount: result.amount, goal: result.goal, desc: result.text, date: new Date().toISOString() }]
        }
      }

      if(result.action === 'withdraw_goal'){
                const nextGoals = (next.goals || []).map(g => g.name === result.goal ? { ...g, current: Math.max(0, (g.current || 0) - result.amount) } : g)
                if(nextGoals.find(g => g.name === result.goal)){
                  next.goals = nextGoals
          next.balance = (next.balance || 0) + result.amount
                  next.transactions = [...(next.transactions || []), { type: 'withdraw_goal', amount: result.amount, goal: result.goal, desc: result.text, date: new Date().toISOString() }]
        }
      }

      if(result.action === 'expense'){
        next.balance = (next.balance || 0) - result.amount
        next.transactions = [...(next.transactions || []), { type: 'expense', amount: result.amount, category: result.category, desc: result.text, date: new Date().toISOString() }]
      }

      if(result.action === 'invest'){
        next.balance = (next.balance || 0) - result.amount
        next.investments = [...(next.investments || []), { asset: result.asset || 'Investimento', amount: result.amount, date: new Date().toISOString() }]
        next.transactions = [...(next.transactions || []), { type: 'invest', amount: result.amount, asset: result.asset || 'Investimento', desc: result.text, date: new Date().toISOString() }]
      }

      next.chatMessages = last4([...(next.chatMessages || []), userMsg, botMsg])
      return next
    })

    setInput('')
    setExpanded({})
  }

  function resolvePending(choice){
    if(!pending) return

    setData(prev => {
      const next = { ...prev, chatPending: null }
      const amount = pending.amount || 0
      const userText = pending.originalText || 'operação'
      let botReply = pending.reply || 'Confirmação aplicada.'

      if(pending.kind === 'deposit'){
        if(choice === 'saldo'){
          next.balance = (next.balance || 0) + amount
          next.transactions = [...(next.transactions || []), { type: 'deposit', amount, desc: userText, date: new Date().toISOString() }]
          botReply = `Depósito de ${amount} registrado no saldo.`
        } else {
                  const nextGoals = (next.goals || []).map(g => g.name === choice ? { ...g, current: (g.current || 0) + amount } : g)
                  if(nextGoals.find(g => g.name === choice)){
                    next.goals = nextGoals
                    next.balance = (next.balance || 0) - amount
            next.transactions = [...(next.transactions || []), { type: 'deposit_goal', amount, goal: choice, desc: userText, date: new Date().toISOString() }]
            botReply = `Depósito de ${amount} na meta ${choice} registrado.`
          }
        }
      }

      if(pending.kind === 'withdraw_goal'){
                const nextGoals = (next.goals || []).map(g => g.name === choice ? { ...g, current: Math.max(0, (g.current || 0) - amount) } : g)
                if(nextGoals.find(g => g.name === choice)){
                  next.goals = nextGoals
          next.balance = (next.balance || 0) + amount
                  next.transactions = [...(next.transactions || []), { type: 'withdraw_goal', amount, goal: choice, desc: userText, date: new Date().toISOString() }]
          botReply = `Saque de ${amount} da meta ${choice} realizado.`
        }
      }

      if(pending.kind === 'expense'){
        next.balance = (next.balance || 0) - amount
        next.transactions = [...(next.transactions || []), { type: 'expense', amount, category: choice, desc: userText, date: new Date().toISOString() }]
        botReply = `Despesa de ${amount} em ${choice} registrada.`
      }

      if(pending.kind === 'invest'){
        next.balance = (next.balance || 0) - amount
        next.investments = [...(next.investments || []), { asset: choice, amount, date: new Date().toISOString() }]
        next.transactions = [...(next.transactions || []), { type: 'invest', amount, asset: choice, desc: userText, date: new Date().toISOString() }]
        botReply = `Registro de investimento ${choice} de ${amount}.`
      }

      if(pending.kind === 'invest_plan'){
        if(choice === 'Registrar investimento'){
          botReply = 'Certo. Quando quiser registrar, envie algo como "investi 500 em tesouro" ou informe o valor e o ativo.'
        } else {
          botReply = buildInvestmentOpinion(pending.asset || '')
        }
      }

      next.chatMessages = last4([...(next.chatMessages || []), { role: 'bot', text: botReply }])
      return next
    })
  }

  function clearChat(){
    setData(prev => ({ ...prev, chatMessages: [], chatPending: null }))
    setExpanded({})
  }

  return (
    <div className="flex h-[74vh] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/70">Assistente premium</p>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
            <MessageSquare size={18} /> Chat Financeiro
          </div>
        </div>
        <button onClick={clearChat} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white" type="button">
          <Trash2 size={16} /> Apagar mensagens
        </button>
      </div>

      {pending && (
        <div className="border-b border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-slate-100">
          <div className="mb-2 flex items-center gap-2 font-medium text-cyan-100">
            <Sparkles size={16} /> {pending.reply || 'Confirme a ação'}
          </div>
          <div className="flex flex-wrap gap-2">
            {pending.kind === 'deposit' && (
              <>
                {(pending.candidates || []).map(goal => (
                  <button key={goal} onClick={() => resolvePending(goal)} className="rounded-full bg-cyan-400 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300" type="button">{goal}</button>
                ))}
                <button onClick={() => resolvePending('saldo')} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10" type="button">Saldo</button>
              </>
            )}
            {pending.kind === 'withdraw_goal' && (pending.candidates || []).map(goal => (
              <button key={goal} onClick={() => resolvePending(goal)} className="rounded-full bg-cyan-400 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300" type="button">{goal}</button>
            ))}
            {pending.kind === 'expense' && (pending.candidates || []).map(category => (
              <button key={category} onClick={() => resolvePending(category)} className="rounded-full bg-cyan-400 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300" type="button">{category}</button>
            ))}
            {pending.kind === 'invest' && (pending.candidates || []).map(asset => (
              <button key={asset} onClick={() => resolvePending(asset)} className="rounded-full bg-cyan-400 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300" type="button">{asset}</button>
            ))}
            {pending.kind === 'invest_plan' && (
              <>
                <button onClick={() => resolvePending('Opinião')} className="rounded-full bg-cyan-400 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300" type="button">Quero opinião</button>
                <button onClick={() => resolvePending('Registrar investimento')} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10" type="button">Registrar depois</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] sm:max-w-[70%]">
              <div className={`${m.role === 'user' ? 'rounded-[1.6rem] rounded-br-md bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.18)]' : 'rounded-[1.6rem] rounded-bl-md border border-white/10 bg-slate-950/60 text-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.25)]'} p-4`}>
                {m.text}
                {m.details && m.role === 'bot' && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100" onClick={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))} type="button">
                      <Lightbulb size={15} />
                      {expanded[i] ? 'Fechar nota estratégica' : 'Mais detalhes'}
                    </button>
                  </div>
                )}
              </div>
              {m.details && expanded[i] && (
                <div className="mt-2 rounded-[1.4rem] border border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 via-indigo-500/10 to-fuchsia-500/10 p-4 text-sm text-slate-100 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                    <BookOpen size={14} /> Modo Warren Buffett
                  </div>
                  {m.details.split('\n').map((line, idx) => <div key={idx} className="leading-relaxed text-slate-200">{line}</div>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 bg-slate-950/40 p-4 backdrop-blur-xl">
        <div className="flex gap-2 rounded-[1.4rem] border border-white/10 bg-white/5 p-2">
          <input
            aria-label="mensagem"
            className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm sm:text-base text-slate-100 outline-none placeholder:text-slate-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Escreva sua operação financeira..."
          />
          <button onClick={send} className="inline-flex shrink-0 items-center gap-2 rounded-[1.1rem] bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110" type="button">
            <Send size={16} /> <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
