import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api'
import {
  User,
  UsersQueryParams,
  CreateUserDto,
  UpdateUserDto,
  UsersResponse,
  UserResponse,
  DeleteResponse
} from '@/types'

export const QUERY_KEYS = {
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,
}

// Hook para listar usuários com filtros e paginação
export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, params],
    queryFn: () => api.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  })
}

// Hook para obter um usuário específico
export function useUser(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => api.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

// Hook para criar usuário
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserDto) => api.createUser(data),
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
      api.updateUser(id, data),
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
    mutationFn: (id: number) => api.deleteUser(id),
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
    mutationFn: (id: number) => api.reactivateUser(id),
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
export function useUserPermissions() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null') as User | null
  
  const canManageUsers = currentUser?.role === 'admin'
  const canViewUsers = currentUser?.role === 'admin' || currentUser?.role === 'coordenador'
  
  return {
    canManageUsers,
    canViewUsers,
    currentUser,
  }
}