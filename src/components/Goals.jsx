import React, { useState } from 'react'
import { Trash2, ArrowRightLeft, Sparkles } from 'lucide-react'
import { formatCurrency } from '../utils/storage'

export default function Goals({ data, setData }){
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')

  function createGoal(e){
    e.preventDefault()
    if(!name || !target) return
    setData(prev=> ({ ...prev, goals: [...(prev.goals||[]), { name, target: Number(target), current: 0 }] }))
    setName('')
    setTarget('')
  }
  function deleteGoal(name){
    setData(prev => {
      const targetGoal = (prev.goals || []).find(g => g.name === name)
      const refundAmount = targetGoal?.current || 0
      
      return {
        ...prev,
        goals: (prev.goals || []).filter(g => g.name !== name),
        balance: (prev.balance || 0) + refundAmount,
        transactions: refundAmount > 0 
          ? [...(prev.transactions || []), { type: 'withdraw_goal', amount: refundAmount, goal: name, desc: `Estorno por exclusão da meta ${name}`, date: new Date().toISOString() }] 
          : prev.transactions
      }
    })
  }

  function withdraw(name){
    setData(prev=>{
      const targetGoal = (prev.goals||[]).find(x=>x.name===name)
      if(!targetGoal) return prev
      
      const amt = targetGoal.current; 
      const nextGoals = (prev.goals||[]).map(g => g.name === name ? { ...g, current: 0 } : g)
      
      return { 
        ...prev, 
        goals: nextGoals, 
        balance: (prev.balance||0) + amt,
        transactions: [...(prev.transactions||[]), { type: 'withdraw_goal', amount: amt, goal: name, desc: `Saque total da meta ${name}`, date: new Date().toISOString() }]
      }
    })
  }

  function voteFeedback(ans){
    setData(prev=> ({ ...prev, metaFeedback: { yes: (prev.metaFeedback?.yes||0) + (ans==='yes'?1:0), no: (prev.metaFeedback?.no||0) + (ans==='no'?1:0) } }))
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-100">
          <Sparkles size={14} />
          Metas dinâmicas
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Caixinhas de investimento</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300/80">Crie objetivos, acompanhe o progresso com barras suaves e use as ações discretas para sacar ou excluir quando quiser.</p>
      </header>

      <form onSubmit={createGoal} className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.7fr_auto]">
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Nome da meta (ex: Reserva Premium)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Valor-alvo"
            value={target}
            onChange={e => setTarget(e.target.value)}
          />
          <button className="rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110" type="submit">
            Criar meta
          </button>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {(data.goals || []).map((g, i) => {
          const progress = g.target ? Math.min(100, ((g.current || 0) / g.target) * 100) : 0
          const progressStyle = { width: `${progress}%` }

          return (
            <article key={i} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/70">Meta premium</div>
                  <h3 className="mt-1 text-2xl font-semibold text-white">{g.name}</h3>
                  <p className="mt-2 text-sm text-slate-300/80">{showingAmount(g.current)} / {showingAmount(g.target)} • {progress.toFixed(0)}% concluído</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={() => deleteGoal(g.name)} aria-label="excluir-meta" type="button">
                    <Trash2 size={16} />
                  </button>
                  <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={() => withdraw(g.name)} aria-label="sacar-meta" type="button">
                    <ArrowRightLeft size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-400 transition-all duration-700 ease-out" style={progressStyle} />
              </div>
            </article>
          )
        })}

        {!(data.goals || []).length && (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/30 p-8 text-sm text-slate-400 lg:col-span-2">
            Nenhuma meta criada ainda. Comece com uma caixinha de reserva ou viagem.
          </div>
        )}
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
        <div className="font-semibold text-white">Este app está te ajudando?</div>
        <div className="mt-3 flex gap-2">
          <button className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:brightness-110" onClick={() => voteFeedback('yes')} type="button">Sim</button>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-200 transition hover:bg-white/10" onClick={() => voteFeedback('no')} type="button">Não</button>
        </div>
        <div className="mt-3 text-sm text-slate-400">Sim: {data.metaFeedback?.yes || 0} • Não: {data.metaFeedback?.no || 0}</div>
      </section>
    </div>
  )
}

function showingAmount(value){
  return formatCurrency(value || 0)
}
