import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
    mutations: {
      retry: 1,
    },
  },
})

if (import.meta.env?.DEV) {
  // Suprime ruído de extensões do navegador que causam:
  // "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason
      const message = typeof reason === 'string' ? reason : (reason?.message ?? '')
      if (typeof message === 'string' && message.includes('listener indicated an asynchronous response')) {
        event.preventDefault()
        // console.debug('[suppress] unhandledrejection de extensão ignorado:', message)
      }
    } catch (_) {
      // noop
    }
  })

  window.addEventListener('error', (event) => {
    try {
      const message = event.message || ''
      if (typeof message === 'string' && message.includes('listener indicated an asynchronous response')) {
        event.preventDefault()
        // console.debug('[suppress] error de extensão ignorado:', message)
      }
    } catch (_) {
      // noop
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
)
