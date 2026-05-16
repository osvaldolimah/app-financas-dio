import React from 'react'
import { Home, MessageSquare, Target, HelpCircle, LogOut } from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'help', label: 'Ajuda', icon: HelpCircle },
]

export default function Navbar({ view, setView, onLogout }){
  return (
    <nav className="fixed bottom-4 left-0 right-0 z-40 px-4">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/80 px-3 py-3 shadow-[0_25px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = view === id
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex-1 rounded-[1.25rem] px-3 py-3 transition ${active ? 'border border-cyan-400/20 bg-gradient-to-b from-cyan-400/15 to-indigo-500/20 text-white shadow-[0_12px_30px_rgba(34,211,238,0.12)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  <Icon size={20} />
                  <span>{label}</span>
                </div>
              </button>
            )
          })}

          <button
            onClick={onLogout}
            className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Logout"
          >
            <div className="flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <LogOut size={20} />
              <span>Sair</span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  )
}
