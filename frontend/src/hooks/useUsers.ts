import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiService } from '@/services/api'
import {
  User,
  UsersQueryParams,
  CreateUserDto,
  UpdateUserDto,
  UsersResponse,
  UserResponse,
  DeleteResponse,
  UserRole
} from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export const QUERY_KEYS = {
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,
}

// Hook para listar usuários com filtros e paginação
export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, params],
    queryFn: () => apiService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  })
}

// Hook para obter um usuário específico
export function useUser(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => apiService.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

// Hook para criar usuário
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserDto) => apiService.createUser(data),
    onSuccess: (response: UserResponse) => {
      // Invalidar cache da lista de usuários
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
      
      toast.success(response.message || 'Usuário criado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar usuário'
      toast.error(message)
    },
  })
}

// Hook para atualizar usuário
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      apiService.updateUser(id, data),
    onSuccess: (response: UserResponse, { id }) => {
      // Invalidar cache da lista de usuários
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
      // Invalidar cache do usuário específico
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(id) })
      
      toast.success(response.message || 'Usuário atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar usuário'
      toast.error(message)
    },
  })
}

// Hook para desativar usuário
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.deleteUser(id),
    onSuccess: (response: DeleteResponse) => {
      // Invalidar cache da lista de usuários
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
      
      toast.success(response.message || 'Usuário desativado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao desativar usuário'
      toast.error(message)
    },
  })
}

// Hook para reativar usuário
export function useReactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.reactivateUser(id),
    onSuccess: (response: UserResponse) => {
      // Invalidar cache da lista de usuários
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
      
      toast.success(response.message || 'Usuário reativado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao reativar usuário'
      toast.error(message)
    },
  })
}

// Hook personalizado para verificar permissões de usuário
/**
 * Determina permissões do usuário autenticado a partir do AuthContext e/ou localStorage.
 * Normaliza a role para o enum UserRole para evitar inconsistências (string vs objeto { name }).
 * Retorna flags canManageUsers e canViewUsers além do usuário atual.
 */
export function useUserPermissions() {
  const { user: authUser } = useAuth()
  const localUser = safelyParseUser(localStorage.getItem('user'))
  const currentUser = authUser ?? localUser

  const normalizedRole = normalizeUserRole((currentUser as any)?.role)
  const canManageUsers = normalizedRole === UserRole.ADMIN
  const canViewUsers = normalizedRole === UserRole.ADMIN || normalizedRole === UserRole.COORDENADOR

  return {
    canManageUsers,
    canViewUsers,
    currentUser: currentUser as User | null,
  }
}

function safelyParseUser(raw: string | null): User | null {
  try {
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

/**
 * Normaliza diferentes formatos de role para o enum UserRole.
 * Aceita: string ('admin', 'coordenador', 'usuario', 'nugecid_operator')
 * ou objeto { name: string }. Retorna undefined para valores inválidos.
 */
function normalizeUserRole(role: unknown): UserRole | undefined {
  if (!role) return undefined

  if (typeof role === 'string') {
    const value = role.toLowerCase()
    if (value === UserRole.ADMIN) return UserRole.ADMIN
    if (value === UserRole.COORDENADOR) return UserRole.COORDENADOR
    if (value === UserRole.NUGECID_OPERATOR) return UserRole.NUGECID_OPERATOR
    if (value === UserRole.USUARIO) return UserRole.USUARIO
    return undefined
  }

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