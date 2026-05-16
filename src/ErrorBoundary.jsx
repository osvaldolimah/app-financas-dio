import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error){
    return { error }
  }
  componentDidCatch(error, info){
    console.error('ErrorBoundary caught', error, info)
    try{ localStorage.setItem('financas_last_error', JSON.stringify({error: String(error), info})) }catch{}
  }
  render(){
    if(this.state.error){
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Ocorreu um erro</h2>
            <p className="text-sm text-gray-600 mt-2">Verifique o console do navegador para detalhes. Salvando um log em LocalStorage: <strong>financas_last_error</strong>.</p>
            <pre className="mt-3 text-xs bg-gray-100 p-2 rounded">{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
