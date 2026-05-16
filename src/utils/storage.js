const USER_KEY = 'financas_user'
const DATA_KEY = 'financas_data'

export function saveUser(user){ localStorage.setItem(USER_KEY, JSON.stringify(user)) }
export function loadUser(){ try{ return JSON.parse(localStorage.getItem(USER_KEY)) } catch{ return null } }
export function clearUser(){ localStorage.removeItem(USER_KEY) }

export function loadData(){
  try{ const v = JSON.parse(localStorage.getItem(DATA_KEY)); if(v) return v }catch{};
  const initial = { balance: 0, transactions: [], investments: [], goals: [], chatMessages: [], chatPending: null, metaFeedback: { yes:0, no:0 } }
  localStorage.setItem(DATA_KEY, JSON.stringify(initial))
  return initial
}

export function saveData(data){ localStorage.setItem(DATA_KEY, JSON.stringify(data)) }

export function formatCurrency(v){
  return (Number(v)||0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Password reset token helpers (stored locally — no email server)
const RESET_KEY = 'financas_reset'
export function saveResetToken(obj){ localStorage.setItem(RESET_KEY, JSON.stringify(obj)) }
export function loadResetToken(){ try{ return JSON.parse(localStorage.getItem(RESET_KEY)) }catch{return null} }
export function clearResetToken(){ localStorage.removeItem(RESET_KEY) }
