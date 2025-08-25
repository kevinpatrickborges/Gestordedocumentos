import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoading } from '@/components/ui/Loading'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requireAuth?: boolean
}

/**
 * Rota protegida por autenticação e/ou nível mínimo de papel (requiredRole).
 * - requireAuth: quando false, redireciona usuários autenticados para home (ex: página de login)
 * - requiredRole: nível mínimo de acesso, considerando hierarquia (ADMIN>COORDENADOR>NUGECID_OPERATOR>USUARIO)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <PageLoading />
  }

  // Se requer autenticação mas usuário não está logado
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se não requer autenticação mas usuário está logado (ex: página de login)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Verificar permissões de role
  if (requiredRole && user) {
    const normalizedRole = normalizeUserRole(user.role as any)
    const hasPermission = normalizedRole ? checkRolePermission(normalizedRole, requiredRole) : false
    if (!hasPermission) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso Negado
            </h1>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-500"
            >
              Voltar
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

/**
 * Normaliza diferentes formatos de role para o enum UserRole.
 * Aceita string (ex: 'admin') ou objeto { name: string }.
 */
function normalizeUserRole(role: unknown): UserRole | undefined {
  if (!role) return undefined

  // Caso já seja o enum (string com valores válidos)
  if (typeof role === 'string') {
    const value = role.toLowerCase()
    if (value === UserRole.ADMIN) return UserRole.ADMIN
    if (value === UserRole.COORDENADOR) return UserRole.COORDENADOR
    if (value === UserRole.NUGECID_OPERATOR) return UserRole.NUGECID_OPERATOR
    if (value === UserRole.USUARIO) return UserRole.USUARIO
    return undefined
  }

  // Caso seja objeto { name: 'admin' | 'coordenador' | ... }
  if (typeof role === 'object' && role !== null && 'name' in (role as any)) {
    const name = String((role as any).name || '').toLowerCase()
    if (name === UserRole.ADMIN) return UserRole.ADMIN
    if (name === UserRole.COORDENADOR) return UserRole.COORDENADOR
    if (name === UserRole.NUGECID_OPERATOR) return UserRole.NUGECID_OPERATOR
    if (name === UserRole.USUARIO) return UserRole.USUARIO
    return undefined
  }

  return undefined
}

/**
 * Verifica se userRole possui acesso ao nível exigido (requiredRole),
 * respeitando hierarquia ADMIN > COORDENADOR > NUGECID_OPERATOR > USUARIO.
 */
function checkRolePermission(userRole: UserRole, requiredRole: UserRole): boolean {
  // Hierarquia de permissões: ADMIN > COORDENADOR > NUGECID_OPERATOR > USUARIO
  const roleHierarchy = {
    [UserRole.ADMIN]: 4,
    [UserRole.COORDENADOR]: 3,
    [UserRole.NUGECID_OPERATOR]: 2,
    [UserRole.USUARIO]: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export default ProtectedRoute