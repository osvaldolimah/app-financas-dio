import React, { useMemo, useRef, useState } from 'react'
import {
  Edit,
  Eye,
  EyeOff,
  MessageSquare,
  Target,
  Wallet,
  ArrowRight,
  Shield,
  DollarSign,
  CreditCard,
  Activity,
  Building,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '../utils/storage'

const neonPalette = ['#22d3ee', '#8b5cf6', '#34d399', '#f472b6', '#f59e0b', '#60a5fa']

function normalizeAsset(asset = '') {
  return asset
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getAssetMeta(asset) {
  const normalized = normalizeAsset(asset)
  if (normalized.includes('tesouro')) return { Icon: Shield, tone: '#22d3ee' }
  if (normalized.includes('cdb')) return { Icon: DollarSign, tone: '#a78bfa' }
  if (normalized.includes('dolar')) return { Icon: DollarSign, tone: '#22c55e' }
  if (normalized.includes('acao')) return { Icon: TrendingUp, tone: '#34d399' }
  if (normalized.includes('fii')) return { Icon: Building, tone: '#f472b6' }
  if (normalized.includes('poupanca')) return { Icon: CreditCard, tone: '#f59e0b' }
  return { Icon: Activity, tone: '#60a5fa' }
}

export default function Dashboard({ data, setData, onLogout, setView }){
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(data.balance ?? 0)
  const [showValues, setShowValues] = useState(true)
  const walletRef = useRef(null)
  const chartFont = { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
  const axisTickStyle = { fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }
  const chartLabelStyle = { fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }

  function saveBalance(){
    const newBalance = Number(value)
    setData(prev=> {
      const diff = newBalance - (prev.balance ?? 0)
      if (diff === 0) return prev
      return {
        ...prev, 
        balance: newBalance,
        transactions: [...(prev.transactions || []), { type: 'adjustment', amount: diff, desc: 'Ajuste manual de saldo', date: new Date().toISOString() }]
      }
    })
    setEditing(false)
  }

  const transactions = Array.isArray(data.transactions) ? data.transactions : []
  const investments = Array.isArray(data.investments) ? data.investments : []
  const goals = Array.isArray(data.goals) ? data.goals : []
  const balanceValue = Number(data.balance ?? 0)
  const totalInvested = investments.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  // helper: get month key like '2026-05'
  function monthKey(dateStr){
    try{
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    }catch{ return null }
  }

  const currentMonthKey = monthKey(new Date().toISOString())
  const expensesTotal = transactions
    .filter(t => t.type === 'expense' && monthKey(t.date) === currentMonthKey)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

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
    if(ev.type==='deposit' || ev.type==='withdraw_goal' || ev.type==='adjustment') running += ev.amount
    else if(ev.type==='expense' || ev.type==='invest' || ev.type==='deposit_goal') running -= ev.amount
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

  const portfolio = useMemo(() => {
    const grouped = investments.reduce((acc, item) => {
      const asset = item.asset || 'Investimento'
      const current = acc.get(asset) || 0
      acc.set(asset, current + Number(item.amount || 0))
      return acc
    }, new Map())

    return [...grouped.entries()]
      .map(([asset, amount]) => ({ asset, amount }))
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({ ...item, color: neonPalette[index % neonPalette.length] }))
  }, [investments])

  const quickActions = [
    { label: 'Chat', icon: MessageSquare, action: 'chat' },
    { label: 'Meta', icon: Target, action: 'goals' },
    { label: 'Carteira', icon: Wallet, action: 'wallet' },
  ]

  const visibleBalance = showValues ? formatCurrency(balanceValue) : '****'
  const visibleInvested = showValues ? formatCurrency(totalInvested) : '****'

  function handleQuickAction(action){
    if(action === 'chat') setView?.('chat')
    if(action === 'goals') setView?.('goals')
    if(action === 'wallet') {
      setView?.('dashboard')
      walletRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/70 font-semibold">Visão geral premium</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Dashboard</h2>
        </div>
        <button
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
          onClick={onLogout}
        >
          Sair
        </button>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_90px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                <Sparkles size={14} />
                Conta digital
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div>
                  <p className="text-sm text-slate-300">Saldo Atual</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {editing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          className="w-36 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none ring-0 placeholder:text-slate-500"
                          value={value}
                          onChange={e => setValue(e.target.value)}
                        />
                        <button className="rounded-2xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400" onClick={saveBalance} type="button">
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                        {visibleBalance}
                      </div>
                    )}
                    <button
                      className="btn-touch rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10"
                      onClick={() => setShowValues(v => !v)}
                      aria-label={showValues ? 'Ocultar valores' : 'Exibir valores'}
                      type="button"
                    >
                      {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      className="btn-touch rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10"
                      onClick={() => { setValue(data.balance ?? 0); setEditing(v => !v); }}
                      aria-label="editar-saldo"
                      type="button"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {quickActions.map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleQuickAction(action)}
                    className="group flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 shadow-lg transition group-hover:scale-105">
                      <Icon size={18} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Gastos do mês</p>
                <strong className="mt-2 block text-2xl text-white">{showValues ? formatCurrency(expensesTotal) : '****'}</strong>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Total investido</p>
                <strong className="mt-2 block text-2xl text-white">{visibleInvested}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
          <h4 className="text-lg font-semibold text-white">Receitas vs Despesas vs Investimento</h4>
          <p className="mt-1 text-sm text-slate-400">Últimos 6 meses.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} style={chartFont}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} width={42} />
                <Tooltip
                  contentStyle={{
                    ...chartFont,
                    background: 'rgba(15, 23, 42, 0.96)',
                    borderRadius: 16,
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#e2e8f0',
                    boxShadow: '0 20px 40px rgba(15,23,42,.45)',
                  }}
                  labelStyle={chartLabelStyle}
                  itemStyle={chartLabelStyle}
                />
                <Legend wrapperStyle={{ ...chartFont, fontSize: 12, color: '#cbd5e1' }} iconType="circle" />
                <Bar dataKey="expense" fill="#22d3ee" name="Despesas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="income" fill="#a78bfa" name="Receitas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="invest" fill="#34d399" name="Investimentos" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
          <h4 className="text-lg font-semibold text-white">Saldo ao longo do tempo</h4>
          <p className="mt-1 text-sm text-slate-400">Linha de evolução patrimonial.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              {balanceSeries.length > 0 ? (
                <LineChart data={balanceSeries} style={chartFont}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} width={42} />
                  <Tooltip
                    contentStyle={{
                      ...chartFont,
                      background: 'rgba(15, 23, 42, 0.96)',
                      borderRadius: 16,
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: '#e2e8f0',
                      boxShadow: '0 20px 40px rgba(15,23,42,.45)',
                    }}
                    labelStyle={chartLabelStyle}
                    itemStyle={chartLabelStyle}
                  />
                  <Line type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              ) : (
                <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-slate-950/30 text-center text-slate-400">
                  <p className="text-sm">Nenhuma transação para gerar o gráfico.</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
          <h4 className="text-lg font-semibold text-white">Investimentos acumulados</h4>
          <p className="mt-1 text-sm text-slate-400">Acompanhamento dos aportes ao longo de 6 meses.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={investMonthly} style={chartFont}>
                <defs>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} width={42} />
                <Tooltip
                  contentStyle={{
                    ...chartFont,
                    background: 'rgba(15, 23, 42, 0.96)',
                    borderRadius: 16,
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#e2e8f0',
                    boxShadow: '0 20px 40px rgba(15,23,42,.45)',
                  }}
                  labelStyle={chartLabelStyle}
                  itemStyle={chartLabelStyle}
                />
                <Area type="monotone" dataKey="invested" stroke="#60A5FA" strokeWidth={3} fillOpacity={1} fill="url(#colorInv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section ref={walletRef} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/70">Extrato de investimentos</p>
            <h3 className="text-xl font-semibold text-white">Minha Carteira</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            Total {showValues ? formatCurrency(totalInvested) : '****'}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {portfolio.length ? portfolio.map(item => {
            const { Icon, tone } = getAssetMeta(item.asset)
            const percent = totalInvested ? (item.amount / totalInvested) * 100 : 0
            return (
              <article key={item.asset} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 shadow-lg backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10" style={{ background: `${tone}18`, color: tone }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.asset}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{percent.toFixed(0)}% da carteira</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{showValues ? formatCurrency(item.amount) : '****'}</p>
                    <p className="text-xs text-slate-400">Ativo premium</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.max(percent, 4)}%`, background: `linear-gradient(90deg, ${tone}, #ffffff)` }} />
                </div>
              </article>
            )
          }) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center text-slate-400">
              Nenhum investimento ainda. Quando os ativos aparecerem, esta seção vira um extrato premium.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Últimas 3 transações</h3>
        <div className="mt-4 space-y-3">
          {transactions.slice(-3).reverse().map((t, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
              <div>
                <p className="font-medium text-white">{t.desc || t.type}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{t.category || t.asset || t.type}</p>
              </div>
              <span className="font-semibold text-cyan-100">{formatCurrency(t.amount)}</span>
            </div>
          ))}
          {!transactions.length && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-sm text-slate-400">
              Ainda não há transações registradas.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
