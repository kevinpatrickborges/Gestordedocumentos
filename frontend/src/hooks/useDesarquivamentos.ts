import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api as apiService } from '@/services/api'
import { 
  Desarquivamento, 
  CreateDesarquivamentoDto, 
  UpdateDesarquivamentoDto, 
  QueryDesarquivamentoDto,
  PaginatedResponse
} from '@/types'

// Query keys
export const QUERY_KEYS = {
  desarquivamentos: 'desarquivamentos',
  desarquivamento: 'desarquivamento',
  dashboard: 'dashboard',
  users: 'users',
} as const

// Hook para listar desarquivamentos
export const useDesarquivamentos = (params?: QueryDesarquivamentoDto) => {
  return useQuery<PaginatedResponse<Desarquivamento>>({
    queryKey: [QUERY_KEYS.desarquivamentos, params],
    queryFn: () => apiService.getDesarquivamentos(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para obter um desarquivamento específico
export const useDesarquivamento = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.desarquivamento, id],
    queryFn: () => apiService.getDesarquivamento(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para obter desarquivamento por código de barras
export const useDesarquivamentoByBarcode = (barcode: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.desarquivamento, 'barcode', barcode],
    queryFn: () => apiService.getDesarquivamentoByBarcode(barcode),
    enabled: !!barcode,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para criar desarquivamento
export const useCreateDesarquivamento = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDesarquivamentoDto) => apiService.createDesarquivamento(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.desarquivamentos] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] })
        toast.success('Solicitação criada com sucesso!')
      } else {
        toast.error(response.message || 'Erro ao criar solicitação')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar solicitação'
      toast.error(message)
    },
  })
}

// Hook para atualizar desarquivamento
export const useUpdateDesarquivamento = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDesarquivamentoDto }) => 
      apiService.updateDesarquivamento(id, data),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.desarquivamentos] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.desarquivamento, id] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] })
        toast.success('Solicitação atualizada com sucesso!')
      } else {
        toast.error(response.message || 'Erro ao atualizar solicitação')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar solicitação'
      toast.error(message)
    },
  })
}

// Hook para excluir desarquivamento
export const useDeleteDesarquivamento = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.deleteDesarquivamento(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.desarquivamentos] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] })
        toast.success('Solicitação excluída com sucesso!')
      } else {
        toast.error(response.message || 'Erro ao excluir solicitação')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao excluir solicitação'
      toast.error(message)
    },
  })
}

// Hook para dados do dashboard
export const useDashboard = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboard],
    queryFn: () => apiService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  })
}

// Hook para listar usuários
export const useUsers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.users],
    queryFn: () => apiService.getUsers(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Alias para compatibilidade
export const useDashboardStats = useDashboard