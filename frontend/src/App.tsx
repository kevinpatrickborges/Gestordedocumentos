import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import { RelatoriosPage } from '@/pages/RelatoriosPage'
import DesarquivamentosPage from '@/pages/DesarquivamentosPage'
import NovoDesarquivamentoPage from '@/pages/NovoDesarquivamentoPage'
import DetalhesDesarquivamentoPage from '@/pages/DetalhesDesarquivamentoPage'
import EditarDesarquivamentoPage from '@/pages/EditarDesarquivamentoPage'
import {
  NugecidListPage,
  NugecidCreatePage,
  NugecidEditPage,
  NugecidDetailPage,
  DesarquivamentosExcluidosPage
} from '@/pages/nugecid'
import UsuariosPage from '@/pages/usuarios/UsuariosPage'
import NovoUsuarioPage from '@/pages/usuarios/NovoUsuarioPage'
import EditarUsuarioPage from '@/pages/usuarios/EditarUsuarioPage'
import { UserRole } from '@/types'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rota de Login - Não requer autenticação */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              }
            />

            {/* Rotas Protegidas - Requerem autenticação */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard - Todos os usuários autenticados */}
              <Route index element={<DashboardPage />} />

              {/* Rota de Relatórios */}
              <Route path="relatorios" element={<RelatoriosPage />} />

              {/* Rotas de Desarquivamentos */}
              <Route path="desarquivamentos">
                {/* Lista de desarquivamentos - Todos os usuários */}
                <Route index element={<DesarquivamentosPage />} />
                
                {/* Nova solicitação - Coordenadores e Admins */}
                <Route
                  path="novo"
                  element={
                    <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
                      <NovoDesarquivamentoPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Detalhes da solicitação - Todos os usuários */}
                <Route path=":id" element={<DetalhesDesarquivamentoPage />} />
                
                {/* Editar solicitação - Coordenadores e Admins */}
                <Route
                  path=":id/editar"
                  element={
                    <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
                      <EditarDesarquivamentoPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Rotas NUGECID */}
              <Route path="nugecid">
                {/* Lista de registros NUGECID - Todos os usuários */}
                <Route index element={<NugecidListPage />} />
                
                {/* Registros excluídos - Apenas Admins e Operadores NUGECID */}
                <Route
                  path="excluidos"
                  element={
                    <ProtectedRoute requiredRole={UserRole.NUGECID_OPERATOR}>
                      <DesarquivamentosExcluidosPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Novo registro NUGECID - Coordenadores e Admins */}
                <Route
                  path="novo"
                  element={
                    <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
                      <NugecidCreatePage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Detalhes do registro NUGECID - Todos os usuários */}
                <Route path=":id" element={<NugecidDetailPage />} />
                
                {/* Editar registro NUGECID - Coordenadores e Admins */}
                <Route
                  path=":id/editar"
                  element={
                    <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
                      <NugecidEditPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Rotas de Usuários */}
              <Route path="usuarios">
                {/* Lista de usuários - Coordenadores e Admins podem visualizar */}
                <Route 
                  index 
                  element={
                    <ProtectedRoute requiredRole={UserRole.COORDENADOR}>
                      <UsuariosPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Novo usuário - Apenas Admins */}
                <Route
                  path="novo"
                  element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <NovoUsuarioPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Editar usuário - Apenas Admins */}
                <Route
                  path=":id/editar"
                  element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <EditarUsuarioPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Rota de fallback para rotas não encontradas dentro do layout */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Página não encontrada
                      </h1>
                      <p className="text-gray-600 mb-4">
                        A página que você está procurando não existe.
                      </p>
                      <button
                        onClick={() => window.history.back()}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Voltar
                      </button>
                    </div>
                  </div>
                }
              />
            </Route>

            {/* Rota de fallback global - Redireciona para login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: 'black',
                border: '1px solid #e5e7eb',
              },
              className: 'toast',
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
