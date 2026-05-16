import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
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
    setData(prev=> ({ ...prev, goals: (prev.goals||[]).filter(g=>g.name!==name) }))
  }

  function withdraw(name){
    setData(prev=>{
      const next = { ...prev }
      const g = (next.goals||[]).find(x=>x.name===name)
      if(g){ const amt = g.current; g.current = 0; next.balance = (next.balance||0) + amt }
      return next
    })
  }

  function voteFeedback(ans){
    setData(prev=> ({ ...prev, metaFeedback: { yes: (prev.metaFeedback?.yes||0) + (ans==='yes'?1:0), no: (prev.metaFeedback?.no||0) + (ans==='no'?1:0) } }))
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Metas & Validação</h2>

      <div className="mt-4 space-y-3">
        <form onSubmit={createGoal} className="bg-white p-3 rounded shadow mb-3">
          <div className="flex gap-2">
            <input className="flex-1 border p-2 rounded" placeholder="Nome da meta (ex: Reserva)" value={name} onChange={e=>setName(e.target.value)} />
            <input className="w-32 border p-2 rounded" placeholder="Valor" value={target} onChange={e=>setTarget(e.target.value)} />
            <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Criar</button>
          </div>
        </form>
        {(data.goals||[]).map((g,i)=> (
          <div key={i} className="bg-white p-3 rounded shadow flex items-center justify-between">
            <div>
              <div className="font-semibold">{g.name}</div>
              <div className="text-sm text-gray-500">{formatCurrency(g.current)} / {formatCurrency(g.target)}</div>
              <div className="w-full bg-gray-200 h-2 rounded mt-2"><div style={{width: `${Math.min(100, (g.current/g.target||0)*100)}%`}} className="h-2 bg-green-500 rounded"/></div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="p-2 bg-red-100 rounded" onClick={()=>deleteGoal(g.name)} aria-label="excluir-meta"><Trash2 /></button>
              <button className="p-2 bg-yellow-100 rounded" onClick={()=>withdraw(g.name)}>Sacar</button>
            </div>
          </div>
        ))}

        {!(data.goals||[]).length && <div className="text-sm text-gray-500">Nenhuma meta criada.</div>}
      </div>

      <div className="mt-6 bg-white p-3 rounded shadow">
        <div className="font-semibold">Este app está te ajudando?</div>
        <div className="mt-2 flex gap-2">
          <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={()=>voteFeedback('yes')}>Sim</button>
          <button className="bg-gray-200 px-3 py-2 rounded" onClick={()=>voteFeedback('no')}>Não</button>
        </div>
        <div className="text-sm text-gray-500 mt-2">Sim: {data.metaFeedback?.yes||0} • Não: {data.metaFeedback?.no||0}</div>
      </div>
    </div>
  )
}
