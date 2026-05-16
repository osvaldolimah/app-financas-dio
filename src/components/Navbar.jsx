import React from 'react'
import { Home, MessageSquare, Target, LogOut } from 'lucide-react'

export default function Navbar({ view, setView, onLogout }){
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
      <div className="max-w-xl mx-auto flex justify-between p-3">
        <button onClick={()=>setView('dashboard')} className="flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <Home size={20} />
          Dashboard
        </button>
        <button onClick={()=>setView('chat')} className="flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <MessageSquare size={20} />
          Chat
        </button>
        <button onClick={()=>setView('goals')} className="flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <Target size={20} />
          Metas
        </button>
        <button onClick={onLogout} className="flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </nav>
  )
}
