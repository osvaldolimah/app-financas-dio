import React from 'react'
import { HelpCircle, MessageSquare, Target, Wallet, Eye } from 'lucide-react'

export default function Help() {
  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          <HelpCircle size={14} />
          Central de Ajuda
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Como usar o app?</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300/80">Tire suas dúvidas sobre as principais funcionalidades do nosso Banco Digital Premium.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-cyan-400">
            <Wallet size={24} />
            <h3 className="text-xl font-semibold text-white">Dashboard</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><strong className="text-white">Saldo:</strong> Use o ícone de lápis para ajustar seu saldo inicial.</li>
            <li><strong className="text-white">Privacidade (<Eye size={14} className="inline align-text-bottom" />):</strong> Clique no olho para ocultar ou exibir os valores na tela.</li>
            <li><strong className="text-white">Gráficos:</strong> Acompanhe a evolução do seu patrimônio e a divisão entre receitas, despesas e investimentos.</li>
          </ul>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-indigo-400">
            <MessageSquare size={24} />
            <h3 className="text-xl font-semibold text-white">Chat Inteligente</h3>
          </div>
          <p className="mt-4 text-sm text-slate-300">O chat entende suas mensagens. Experimente enviar:</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><strong className="text-white">Despesas:</strong> "Gastei 50 com internet" ou "Paguei 20 em lanche"</li>
            <li><strong className="text-white">Ganhos:</strong> "Recebi 100" ou "Coloquei 200 no saldo"</li>
            <li><strong className="text-white">Investimentos:</strong> "Investi 500 no tesouro"</li>
            <li><strong className="text-white">Dúvidas:</strong> "O que é CDB?" ou "Como funciona a Selic?"</li>
          </ul>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl md:col-span-2">
          <div className="flex items-center gap-3 text-fuchsia-400">
            <Target size={24} />
            <h3 className="text-xl font-semibold text-white">Metas (Caixinhas)</h3>
          </div>
          <p className="mt-4 text-sm text-slate-300">Crie metas para organizar seus objetivos (ex: "Viagem", "Reserva de Emergência").</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><strong className="text-white">Depositar:</strong> Vá no Chat e digite "Coloquei 100 na viagem" para transferir do seu saldo principal para a meta.</li>
            <li><strong className="text-white">Saque total:</strong> Na aba de Metas, clique no ícone de setas para estornar o valor inteiro de volta para o saldo.</li>
            <li><strong className="text-white">Saque parcial:</strong> Vá no Chat e digite "Saquei 100 da reserva" para retirar apenas uma parte do valor da meta.</li>
            <li><strong className="text-white">Excluir:</strong> Clique na lixeira para excluir a meta (qualquer valor guardado nela voltará automaticamente ao saldo).</li>
          </ul>
        </article>
      </div>
    </div>
  )
}