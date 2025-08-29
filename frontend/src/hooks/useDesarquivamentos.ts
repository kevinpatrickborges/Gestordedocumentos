import {
  useQuery,
  useMutation,
  keepPreviousData,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import { apiService } from '@/services/api'
import {
  CreateDesarquivamentoDto,
  Desarquivamento,
  PaginatedResponse,
} from '@/types'

const DESARQUIVAMENTOS_QUERY_KEY = 'desarquivamentos'

/**
 * Hook para buscar uma lista paginada de desarquivamentos.
 */
export const useDesarquivamentos = (
  page = 1,
  limit = 10,
  filters: Record<string, any> = {},
): UseQueryResult<PaginatedResponse<Desarquivamento>> => {
  return useQuery({
    queryKey: [DESARQUIVAMENTOS_QUERY_KEY, page, limit, filters],
    queryFn: () => apiService.getDesarquivamentos(page, limit, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para buscar um único desarquivamento pelo ID.
 */
export const useDesarquivamento = (id: string) => {
  return useQuery({
    queryKey: [DESARQUIVAMENTOS_QUERY_KEY, id],
    queryFn: () => apiService.getDesarquivamentoById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar um novo desarquivamento.
 */
export const useCreateDesarquivamento = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDesarquivamentoDto) =>
      apiService.createDesarquivamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DESARQUIVAMENTOS_QUERY_KEY] })
    },
  })
}

/**
 * Hook para atualizar um desarquivamento existente.
 */
export const useUpdateDesarquivamento = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDesarquivamentoDto }) =>
      apiService.updateDesarquivamento(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DESARQUIVAMENTOS_QUERY_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: [DESARQUIVAMENTOS_QUERY_KEY] })
    },
  })
}

/**
 * Hook para excluir um desarquivamento.
 */
export const useDeleteDesarquivamento = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiService.deleteDesarquivamento(id),
    onSuccess: () => {
      // AQUI ESTÁ A CORREÇÃO:
      // Invalida todas as queries que começam com 'desarquivamentos'.
      // Isso força o React Query a buscar a lista novamente,
      // agora sem o item que foi excluído.
      queryClient.invalidateQueries({ queryKey: [DESARQUIVAMENTOS_QUERY_KEY] })
    },
  })
}