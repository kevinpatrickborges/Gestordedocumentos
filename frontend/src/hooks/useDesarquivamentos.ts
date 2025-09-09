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
  params: {
    page?: number
    limit?: number
    search?: string
    status?: string | string[]
    tipo?: string
    tipoDesarquivamento?: string | string[]
    startDate?: string
    endDate?: string
  } = {}
): UseQueryResult<PaginatedResponse<Desarquivamento>> => {
  const { page = 1, limit = 10, ...filters } = params
  
  // Remove propriedades undefined para evitar cache desnecessário
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined)
  )
  
  // Monta o objeto de parâmetros conforme esperado pela API
  const queryParams = {
    page,
    limit,
    ...cleanFilters
  }
  
  return useQuery({
    queryKey: [DESARQUIVAMENTOS_QUERY_KEY, page, limit, cleanFilters],
    queryFn: () => apiService.getDesarquivamentos(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 0, // Desabilita cache para evitar dados obsoletos
    gcTime: 0, // Remove dados do cache imediatamente
  })
}

/**
 * Hook para buscar um único desarquivamento pelo ID.
 */
export const useDesarquivamento = (id: string | number | null | undefined) => {
  const numericId = Number(id);
  const isIdValid = !!id && !isNaN(numericId) && numericId > 0;

  return useQuery({
    queryKey: [DESARQUIVAMENTOS_QUERY_KEY, id],
    queryFn: () => apiService.getDesarquivamento(numericId),
    enabled: isIdValid,
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
      apiService.updateDesarquivamento(Number(id), data),
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
    mutationFn: async (id: string | number) => {
      const timestamp = new Date().toISOString()
      
      // Log detalhado da entrada com stack trace para rastrear origem
      console.group(`[${timestamp}] 🗑️ useDeleteDesarquivamento - ANÁLISE DETALHADA DO ID`)
      console.log('📋 ID recebido:', id)
      console.log('📋 Tipo do ID:', typeof id)
      console.log('📋 ID como string:', String(id))
      console.log('📋 ID é null/undefined:', id === null || id === undefined)
      console.log('📋 ID é string vazia:', id === '')
      
      // Capturar stack trace para identificar origem do ID
      const stackTrace = new Error().stack
      console.log('📋 Stack trace (origem da chamada):')
      console.log(stackTrace)
      
      // Verificação específica para UUID
      const idStr = String(id).trim()
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const isUUID = uuidPattern.test(idStr)
      
      console.log('🔍 Análise do formato:')
      console.log('  - ID trimmed:', idStr)
      console.log('  - É UUID?:', isUUID)
      console.log('  - Contém apenas dígitos?:', /^\d+$/.test(idStr))
      console.log('  - Comprimento:', idStr.length)
      
      if (isUUID) {
        console.error('❌ UUID DETECTADO NO HOOK!')
        console.error('❌ Este é o problema! Um UUID está sendo passado onde deveria ser um ID numérico.')
        console.error('❌ UUID encontrado:', idStr)
        console.error('❌ Stack trace da origem:')
        console.error(stackTrace)
        console.groupEnd()
        
        throw new Error(
          `ERRO CRÍTICO: UUID detectado no hook useDeleteDesarquivamento! ` +
          `ID recebido: '${id}' (UUID). ` +
          `Este sistema espera IDs numéricos (ex: 1, 2, 3...). ` +
          `Verifique o componente que está chamando este hook e certifique-se de usar o ID numérico correto do desarquivamento.`
        )
      }
      
      // Verificar se o ID é válido antes de enviar
      if (id === null || id === undefined || id === '') {
        console.error('❌ ID nulo/vazio detectado:', id)
        console.groupEnd()
        throw new Error('ID não pode ser nulo ou vazio')
      }
      
      // Verificar se contém apenas números
      if (!/^\d+$/.test(idStr)) {
        console.error('❌ ID contém caracteres não numéricos:', idStr)
        console.error('❌ Stack trace:')
        console.error(stackTrace)
        console.groupEnd()
        
        throw new Error(
          `ID inválido: '${id}'. Deve conter apenas números. ` +
          `Formato esperado: número inteiro positivo (ex: 1, 2, 3...).`
        )
      }
      
      console.log('✅ ID passou em todas as validações')
      console.groupEnd()
      
      const result = await apiService.deleteDesarquivamento(Number(id))
      
      // Verifica se a exclusão foi bem-sucedida
      if (result?.success) {
        const completedTimestamp = new Date().toISOString()
        console.log(`[${completedTimestamp}] ✅ EXCLUSÃO CONFIRMADA - ID: ${id} foi EXCLUÍDO DO BANCO DE DADOS`)
        console.log(`[${completedTimestamp}] 📊 Dados da exclusão:`, result.data)
      } else {
        console.error(`[${timestamp}] ❌ useDeleteDesarquivamento - Resultado não indica sucesso:`, result)
      }
      
      return result
    },
    onSuccess: (result, deletedId) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] 🔄 ATUALIZANDO CACHE - Removendo ID: ${deletedId} da lista`)
      
      // Invalida todas as queries relacionadas a desarquivamentos
      queryClient.invalidateQueries({ 
        queryKey: [DESARQUIVAMENTOS_QUERY_KEY],
        exact: false // Invalida todas as queries que começam com a chave
      })
      
      // Remove o item específico do cache se existir
      queryClient.removeQueries({ 
        queryKey: [DESARQUIVAMENTOS_QUERY_KEY, String(deletedId)]
      })
      
      // Força refetch imediato das queries ativas
      queryClient.refetchQueries({ 
        queryKey: [DESARQUIVAMENTOS_QUERY_KEY],
        type: 'active'
      }).then(() => {
        const refetchTimestamp = new Date().toISOString()
        console.log(`[${refetchTimestamp}] ✅ LISTA ATUALIZADA - Item ID: ${deletedId} removido da interface`)
      })
    },
    onError: (error: any, deletedId) => {
      const errorTimestamp = new Date().toISOString()
      console.error(`[${errorTimestamp}] ❌ ERRO NA EXCLUSÃO - ID: ${deletedId}`, error)

      // Log mais detalhado do erro
      if (error?.response?.data) {
        console.error(`[${errorTimestamp}] 📋 Detalhes do erro:`, error.response.data)
      }
    }
  })
}

/**
 * Hook para buscar itens excluídos (lixeira).
 */
export const useDesarquivamentosLixeira = (
  params: {
    page?: number
    limit?: number
    search?: string
  } = {}
): UseQueryResult<PaginatedResponse<Desarquivamento>> => {
  const { page = 1, limit = 10, ...filters } = params
  
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined)
  )
  
  const queryParams = {
    page,
    limit,
    ...cleanFilters
  }
  
  return useQuery({
    queryKey: ['desarquivamentos-lixeira', page, limit, cleanFilters],
    queryFn: () => apiService.getDesarquivamentosLixeira(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

/**
 * Hook para restaurar um desarquivamento da lixeira.
 */
export const useRestoreDesarquivamento = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string | number) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] 🔄 INICIANDO RESTAURAÇÃO - ID: ${id}`)
      
      const result = await apiService.restoreDesarquivamento(String(id))
      
      if (result?.success) {
        const completedTimestamp = new Date().toISOString()
        console.log(`[${completedTimestamp}] ✅ RESTAURAÇÃO CONFIRMADA - ID: ${id} foi RESTAURADO no banco de dados`)
        console.log(`[${completedTimestamp}] 📊 Dados da restauração:`, result.data)
      }
      
      return result
    },
    onSuccess: (result, restoredId) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] 🔄 ATUALIZANDO CACHE - Item ID: ${restoredId} restaurado`)
      
      // Invalida queries da lixeira e da lista principal
      queryClient.invalidateQueries({ 
        queryKey: ['desarquivamentos-lixeira'],
        exact: false
      })
      
      queryClient.invalidateQueries({ 
        queryKey: [DESARQUIVAMENTOS_QUERY_KEY],
        exact: false
      })
      
      // Força refetch das queries ativas
      queryClient.refetchQueries({ 
        queryKey: ['desarquivamentos-lixeira'],
        type: 'active'
      })
      
      queryClient.refetchQueries({ 
        queryKey: [DESARQUIVAMENTOS_QUERY_KEY],
        type: 'active'
      }).then(() => {
        const refetchTimestamp = new Date().toISOString()
        console.log(`[${refetchTimestamp}] ✅ LISTAS ATUALIZADAS - Item ID: ${restoredId} restaurado com sucesso`)
      })
    },
    onError: (error: any, restoredId) => {
      const errorTimestamp = new Date().toISOString()
      console.error(`[${errorTimestamp}] ❌ ERRO NA RESTAURAÇÃO - ID: ${restoredId}`, error)

      if (error?.response?.data) {
        console.error(`[${errorTimestamp}] 📋 Detalhes do erro:`, error.response.data)
      }
    }
  })
}

/**
 * Hook para buscar estatísticas do dashboard (total, pendentes, por status, etc.).
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => apiService.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}
