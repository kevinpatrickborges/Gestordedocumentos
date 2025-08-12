import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, LoginDto } from '@/types'
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

  const checkPermission = (action: string, resource?: any): boolean => {
    if (!user) return false

    // Admins têm acesso total
    if (user.role === 'admin') return true

    // Coordenadores têm acesso a quase tudo
    if (user.role === 'coordenador') {
      if (action === 'delete' && resource) {
        // Coordenadores só podem excluir seus próprios registros
        return resource.usuarioId === user.id
      }
      return true
    }

    // Usuários comuns têm acesso limitado
    if (user.role === 'usuario') {
      switch (action) {
        case 'create':
          return true
        case 'read':
          return true
        case 'update':
          return resource ? resource.usuarioId === user.id : false
        case 'delete':
          return resource ? resource.usuarioId === user.id : false
        default:
          return false
      }
    }

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
