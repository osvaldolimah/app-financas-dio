import React, { useState } from 'react'
import { parseMessage } from '../utils/aiParser'

function last4(messages){
  return messages.slice(-4)
}

function buildInvestmentOpinion(asset){
  const normalized = (asset || '').toLowerCase()

  if(normalized === 'poupança'){
    return 'Minha opinião: a poupança é fácil de usar e tem liquidez, mas normalmente rende pouco. Se a ideia é guardar com segurança e ganhar melhor do que a poupança, Tesouro Selic ou um CDB de liquidez diária costumam ser opções mais interessantes.'
  }

  if(normalized === 'ações'){
    return 'Minha opinião: ações podem trazer retorno maior no longo prazo, mas oscilam bastante. Se você não quer ver o valor variar muito, Tesouro Selic ou CDB de liquidez diária são mais tranquilos. Se aceitar risco e prazo maior, ações fazem sentido com diversificação.'
  }

  if(normalized === 'tesouro'){
    return 'Minha opinião: o Tesouro é uma porta de entrada mais conservadora. Para reserva de emergência, o Tesouro Selic costuma ser mais adequado. Para proteger do aumento dos preços, o IPCA+ é uma alternativa melhor que a poupança.'
  }

  if(normalized === 'cdb'){
    return 'Minha opinião: CDB é uma opção prática de renda fixa. Para curto prazo, olhe liquidez diária e FGC. Em muitos casos ele é mais interessante do que a poupança e ainda simples de entender.'
  }

  if(normalized === 'fii'){
    return 'Minha opinião: FIIs podem gerar renda periódica, mas variam de preço e exigem mais atenção. Se você quer algo simples e conservador, Tesouro Selic ou CDB diário são mais previsíveis.'
  }

  return 'Minha opinião: antes de investir, vale comparar risco, prazo e liquidez. Se você quiser, eu posso comparar esse ativo com Tesouro Selic, CDB ou poupança.'
}

export default function Chat({ data, setData }){
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState({})
  const messages = Array.isArray(data.chatMessages) ? data.chatMessages : []
  const pending = data.chatPending || null

  function persistMessages(nextMessages){
    setData(prev => ({ ...prev, chatMessages: last4(nextMessages) }))
  }

  function send(){
    if(!input.trim()) return
    const userMsg = { role:'user', text: input }
    const result = parseMessage(input, data)
    const botMsg = { role:'bot', text: result.reply, details: result.details }

    setData(prev => {
      const next = { ...prev, chatPending: null }

      if(result.action === 'clarify'){
        next.chatPending = {
          kind: result.kind,
          amount: result.amount,
          candidates: result.candidates || [],
          asset: result.asset || null,
          originalText: result.text,
          reply: result.reply
        }
      }

      if(result.action === 'deposit'){
        next.balance = (next.balance || 0) + result.amount
        next.transactions = [...(next.transactions || []), { type: 'deposit', amount: result.amount, desc: result.text, date: new Date().toISOString() }]
      }

      if(result.action === 'deposit_goal'){
        const goal = (next.goals || []).find(g => g.name === result.goal)
        if(goal){
          goal.current = (goal.current || 0) + result.amount
          next.transactions = [...(next.transactions || []), { type: 'deposit_goal', amount: result.amount, goal: result.goal, desc: result.text, date: new Date().toISOString() }]
        }
      }

      if(result.action === 'withdraw_goal'){
        const goal = (next.goals || []).find(g => g.name === result.goal)
        if(goal){
          goal.current = Math.max(0, (goal.current || 0) - result.amount)
          next.balance = (next.balance || 0) + result.amount
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

      const nextMessages = last4([...(next.chatMessages || []), userMsg, botMsg])
      next.chatMessages = nextMessages
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
          const goal = (next.goals || []).find(g => g.name === choice)
          if(goal){
            goal.current = (goal.current || 0) + amount
            next.transactions = [...(next.transactions || []), { type: 'deposit_goal', amount, goal: choice, desc: userText, date: new Date().toISOString() }]
            botReply = `Depósito de ${amount} na meta ${choice} registrado.`
          }
        }
      }

      if(pending.kind === 'withdraw_goal'){
        const goal = (next.goals || []).find(g => g.name === choice)
        if(goal){
          goal.current = Math.max(0, (goal.current || 0) - amount)
          next.balance = (next.balance || 0) + amount
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
          const asset = pending.asset || ''
          botReply = buildInvestmentOpinion(asset)
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
    <div className="h-[70vh] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b">
        <div className="text-sm font-semibold text-gray-700">Chat Financeiro</div>
        <button onClick={clearChat} className="text-sm text-red-600">Apagar mensagens</button>
      </div>

      {pending && (
        <div className="px-3 py-2 bg-yellow-50 border-b text-sm text-gray-800">
          <div className="mb-2 font-medium">{pending.reply || 'Confirme a ação'}</div>
          <div className="flex flex-wrap gap-2">
            {pending.kind === 'deposit' && (
              <>
                {(pending.candidates || []).map(goal => (
                  <button key={goal} onClick={() => resolvePending(goal)} className="px-3 py-2 rounded bg-blue-600 text-white">{goal}</button>
                ))}
                <button onClick={() => resolvePending('saldo')} className="px-3 py-2 rounded bg-gray-700 text-white">Saldo</button>
              </>
            )}
            {pending.kind === 'withdraw_goal' && (pending.candidates || []).map(goal => (
              <button key={goal} onClick={() => resolvePending(goal)} className="px-3 py-2 rounded bg-blue-600 text-white">{goal}</button>
            ))}
            {pending.kind === 'expense' && (pending.candidates || []).map(category => (
              <button key={category} onClick={() => resolvePending(category)} className="px-3 py-2 rounded bg-blue-600 text-white">{category}</button>
            ))}
            {pending.kind === 'invest' && (pending.candidates || []).map(asset => (
              <button key={asset} onClick={() => resolvePending(asset)} className="px-3 py-2 rounded bg-blue-600 text-white">{asset}</button>
            ))}
            {pending.kind === 'invest_plan' && (
              <>
                <button onClick={() => resolvePending('Opinião')} className="px-3 py-2 rounded bg-blue-600 text-white">Quero opinião</button>
                <button onClick={() => resolvePending('Registrar investimento')} className="px-3 py-2 rounded bg-gray-700 text-white">Registrar depois</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div>
              <div className={`${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} p-3 rounded-lg max-w-xs`}>
                {m.text}
                {m.details && m.role === 'bot' && (
                  <div className="mt-2">
                    <button className="text-sm text-blue-600" onClick={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))}>
                      {expanded[i] ? 'Fechar' : 'Mais detalhes'}
                    </button>
                  </div>
                )}
              </div>
              {m.details && expanded[i] && (
                <div className="mt-1 text-sm text-gray-700 bg-gray-100 p-2 rounded max-w-xs">
                  {m.details.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <input aria-label="mensagem" className="flex-1 border p-2 rounded" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} />
          <button onClick={send} className="bg-blue-600 text-white px-4 rounded">Enviar</button>
        </div>
      </div>
    </div>
  )
}
