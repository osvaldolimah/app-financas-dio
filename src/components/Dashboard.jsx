import React, { useState } from 'react'
import { Edit } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '../utils/storage'

export default function Dashboard({ data, setData, onLogout }){
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(data.balance ?? 0)
  const chartFont = { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
  const axisTickStyle = { fill: '#475569', fontSize: 12, fontWeight: 500 }
  const chartLabelStyle = { fill: '#334155', fontSize: 12, fontWeight: 600 }

  function saveBalance(){
    setData(prev=> ({...prev, balance: Number(value)}))
    setEditing(false)
  }

  const transactions = Array.isArray(data.transactions) ? data.transactions : []
  const investments = Array.isArray(data.investments) ? data.investments : []

  // helper: get month key like '2026-05'
  function monthKey(dateStr){
    try{
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    }catch{ return null }
  }

  // build last 6 months keys
  const months = []
  const now = new Date()
  for(let i=5;i>=0;i--){ const d = new Date(now.getFullYear(), now.getMonth()-i, 1); months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`) }

  const monthly = months.map(m=>({ month: m, income:0, expense:0, invest:0 }))
  const monthIndex = key => months.indexOf(key)

  transactions.forEach(t=>{
    const k = monthKey(t.date || new Date())
    const idx = monthIndex(k)
    if(idx>=0){
      if(t.type==='deposit') monthly[idx].income += Number(t.amount||0)
      if(t.type==='expense') monthly[idx].expense += Number(t.amount||0)
      if(t.type==='invest') monthly[idx].invest += Number(t.amount||0)
    }
  })

  // balance over time: cumulative from transactions sorted by date
  const allEvents = transactions.map(t=>({ date: t.date||new Date().toISOString(), amount: Number(t.amount||0), type: t.type }))
  allEvents.sort((a,b)=> new Date(a.date) - new Date(b.date))
  const balanceSeries = []
  let running = 0
  allEvents.forEach(ev=>{
    if(ev.type==='deposit') running += ev.amount
    else if(ev.type==='expense' || ev.type==='invest') running -= ev.amount
    const d = new Date(ev.date)
    balanceSeries.push({ date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, balance: running })
  })

  // investments cumulative by month
  const investMonthly = months.map(m=>({ month: m, invested: 0 }))
  transactions.filter(t=>t.type==='invest').forEach(t=>{
    const k = monthKey(t.date||new Date())
    const idx = monthIndex(k)
    if(idx>=0) investMonthly[idx].invested += Number(t.amount||0)
  })
  // cumulative
  for(let i=1;i<investMonthly.length;i++) investMonthly[i].invested += investMonthly[i-1].invested

  return (
    <div>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Visão geral</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
        </div>
        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" onClick={onLogout}>Sair</button>
      </header>

      <section className="bg-white p-4 rounded-2xl mt-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Saldo Atual</div>
            {!editing ? (
              <div className="text-3xl font-semibold tracking-tight text-slate-900 mt-1">{formatCurrency(data.balance ?? 0)}</div>
            ) : (
              <div className="flex gap-2">
                <input className="border border-slate-200 p-2 rounded-lg text-slate-900" value={value} onChange={e=>setValue(e.target.value)} />
                <button className="bg-blue-600 text-white px-3 rounded-lg font-medium" onClick={saveBalance}>Salvar</button>
              </div>
            )}
          </div>
          <button className="btn-touch p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors" onClick={()=>setEditing(v=>!v)} aria-label="editar-saldo">
            <Edit />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Gastos do mês</div>
            <strong className="block mt-1 text-lg font-semibold text-slate-900">{formatCurrency(transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0))}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Total investido</div>
            <strong className="block mt-1 text-lg font-semibold text-slate-900">{formatCurrency(investments.reduce((s,i)=>s+i.amount,0))}</strong>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="h-56 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-semibold tracking-tight text-slate-800 mb-2">Receitas vs Despesas vs Investimento (últimos 6 meses)</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthly} style={chartFont}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} width={42} />
                <Tooltip contentStyle={{ ...chartFont, borderRadius: 12, borderColor: '#e2e8f0' }} labelStyle={chartLabelStyle} itemStyle={chartLabelStyle} />
                <Legend wrapperStyle={{ ...chartFont, fontSize: 12, color: '#475569' }} iconType="circle" />
                <Bar dataKey="expense" fill="#EF4444" name="Despesas" radius={[6, 6, 0, 0]} />
                <Bar dataKey="income" fill="#10B981" name="Receitas" radius={[6, 6, 0, 0]} />
                <Bar dataKey="invest" fill="#3B82F6" name="Investimentos" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-56 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-semibold tracking-tight text-slate-800 mb-2">Saldo ao longo do tempo</h4>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={balanceSeries} style={chartFont}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} width={42} />
                <Tooltip contentStyle={{ ...chartFont, borderRadius: 12, borderColor: '#e2e8f0' }} labelStyle={chartLabelStyle} itemStyle={chartLabelStyle} />
                <Line type="monotone" dataKey="balance" stroke="#4F46E5" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-56 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-semibold tracking-tight text-slate-800 mb-2">Investimentos acumulados (últimos 6 meses)</h4>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={investMonthly} style={chartFont}>
                <defs>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} width={42} />
                <Tooltip contentStyle={{ ...chartFont, borderRadius: 12, borderColor: '#e2e8f0' }} labelStyle={chartLabelStyle} itemStyle={chartLabelStyle} />
                <Area type="monotone" dataKey="invested" stroke="#60A5FA" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Minha carteira</h3>
          <ul className="mt-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {investments.map((inv, i)=> (
              <li key={i} className="flex justify-between text-sm py-3 px-3 border-b border-slate-100 last:border-b-0 text-slate-700">{inv.asset} <span className="font-medium text-slate-900">{formatCurrency(inv.amount)}</span></li>
            ))}
            {!investments.length && <li className="text-sm text-slate-500 px-3 py-3">Nenhum investimento ainda.</li>}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Últimas 3 transações</h3>
          <ul className="mt-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {transactions.slice(-3).reverse().map((t,i)=> (
              <li key={i} className="flex justify-between text-sm py-3 px-3 border-b border-slate-100 last:border-b-0 text-slate-700">{t.desc || t.type} <span className="font-medium text-slate-900">{formatCurrency(t.amount)}</span></li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
