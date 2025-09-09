import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import DesarquivamentosPage from '@/pages/DesarquivamentosPage'
import NovoDesarquivamentoPage from '@/pages/NovoDesarquivamentoPage'
import DetalhesDesarquivamentoPage from '@/pages/DetalhesDesarquivamentoPage'
import EditDesarquivamentoPage from '@/pages/EditDesarquivamentoPage'
import UsuariosPage from '@/pages/usuarios/UsuariosPage'
import NovoUsuarioPage from '@/pages/usuarios/NovoUsuarioPage'
import EditarUsuarioPage from '@/pages/usuarios/EditarUsuarioPage'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'
import LixeiraPage from '@/pages/LixeiraPage'
import { UserRole } from '@/types'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas protegidas com layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          
          {/* Desarquivamentos */}
          <Route path="desarquivamentos" element={<DesarquivamentosPage />} />
          <Route path="desarquivamentos/novo" element={<NovoDesarquivamentoPage />} />
          <Route path="desarquivamentos/:id" element={<DetalhesDesarquivamentoPage />} />
          <Route path="desarquivamentos/:id/editar" element={<EditDesarquivamentoPage />} />
          
          {/* Lixeira */}
          <Route path="desarquivamentos/lixeira" element={<LixeiraPage />} />
          <Route path="lixeira" element={<Navigate to="/desarquivamentos/lixeira" replace />} />
          
          {/* Usuários - apenas para coordenadores e admins */}
          <Route path="usuarios" element={
            <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
              <UsuariosPage />
            </ProtectedRoute>
          } />
          <Route path="usuarios/novo" element={
            <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
              <NovoUsuarioPage />
            </ProtectedRoute>
          } />
          <Route path="usuarios/:id/editar" element={
            <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
              <EditarUsuarioPage />
            </ProtectedRoute>
          } />
          
          {/* Configurações */}
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
        </Route>
        
        {/* Redirecionar rotas não encontradas para o dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
