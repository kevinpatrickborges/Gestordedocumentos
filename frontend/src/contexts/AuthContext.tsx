import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, LoginDto, UserRole } from '@/types'
import { apiService } from '@/services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginDto) => Promise<void>
  logout: () => Promise<void>
  checkPermission: (action: string, resource?: any) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const savedUser = localStorage.getItem('user')
      
      if (accessToken && savedUser) {
        setUser(JSON.parse(savedUser))
        
        // Verificar se o token ainda é válido
        try {
          const response = await apiService.getCurrentUser()
          if (response.success && response.data) {
            setUser(response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
          }
        } catch (error) {
          // Token inválido, limpar dados
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginDto) => {
    try {
      const response = await apiService.login(credentials)
      
      if (response.success && response.data) {
        const { user: userData, accessToken } = response.data
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } else {
        throw new Error(response.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const checkPermission = (action: string, resource: string): boolean => {
    console.log('🔍 Verificando permissão:', { user: user?.nome, role: user?.role?.name, action, resource })
    
    if (!user) {
      console.log('❌ Usuário não autenticado')
      return false
    }

    // Admin tem acesso total
    if (user.role?.name === 'admin') {
      console.log('✅ Admin - acesso total concedido')
      return true
    }

    // Coordenador tem permissões específicas
    if (user.role?.name === 'coordenador') {
      console.log('🔧 Verificando permissões de coordenador')
      // Pode gerenciar desarquivamentos
      if (resource === 'desarquivamentos') {
        const hasPermission = ['create', 'read', 'update', 'delete'].includes(action)
        console.log(`${hasPermission ? '✅' : '❌'} Coordenador - desarquivamentos:${action}`)
        return hasPermission
      }
      // Pode visualizar usuários mas não gerenciar
      if (resource === 'users') {
        const hasPermission = action === 'read'
        console.log(`${hasPermission ? '✅' : '❌'} Coordenador - users:${action}`)
        return hasPermission
      }
      // Pode acessar relatórios
      if (resource === 'reports') {
        const hasPermission = action === 'read'
        console.log(`${hasPermission ? '✅' : '❌'} Coordenador - reports:${action}`)
        return hasPermission
      }
    }

    // Usuário comum tem permissões limitadas
    if (user.role?.name === 'usuario') {
      console.log('👤 Verificando permissões de usuário comum')
      // Pode apenas visualizar desarquivamentos
      if (resource === 'desarquivamentos') {
        const hasPermission = action === 'read'
        console.log(`${hasPermission ? '✅' : '❌'} Usuario - desarquivamentos:${action}`)
        return hasPermission
      }
    }

    console.log('❌ Permissão negada - nenhuma regra aplicável')
    return false
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
