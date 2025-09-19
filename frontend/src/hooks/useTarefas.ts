import { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import type {
  Tarefa,
  CreateTarefaDto,
  UpdateTarefaDto,
  QueryTarefaDto,
  MoveTarefaDto,
  PaginatedResponse,
  ApiResponse,
  StatusTarefa
} from '@/types'

interface EstatisticasTarefas {
  total: number
  pendentes: number
  em_andamento: number
  concluidas: number
  canceladas: number
}

interface UseTarefasReturn {
  tarefas: Tarefa[]
  loading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  total: number
  estatisticas: EstatisticasTarefas
  
  // CRUD operations
  fetchTarefas: (params?: QueryTarefaDto) => Promise<void>
  createTarefa: (data: CreateTarefaDto) => Promise<Tarefa | null>
  updateTarefa: (id: number, data: UpdateTarefaDto) => Promise<Tarefa | null>
  deleteTarefa: (id: number) => Promise<boolean>
  getTarefa: (id: number) => Promise<Tarefa | null>
  
  // Specific operations
  moveTarefa: (id: number, data: MoveTarefaDto) => Promise<Tarefa | null>
  getTarefasAtrasadas: (projetoId: number) => Promise<Tarefa[]>
  getHistoricoTarefa: (id: number) => Promise<any[]>
  
  // Utility functions
  refresh: () => Promise<void>
  clearError: () => void
}

export const useTarefas = (initialParams?: QueryTarefaDto): UseTarefasReturn => {
  const { isAuthenticated, user } = useAuth()
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [lastParams, setLastParams] = useState<QueryTarefaDto | undefined>(initialParams)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchTarefas = useCallback(async (params?: QueryTarefaDto) => {
    if (!isAuthenticated || !user) {
      setError('Usuário não autenticado')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      
      if (params?.projetoId) queryParams.append('projetoId', params.projetoId.toString())
      if (params?.colunaId) queryParams.append('colunaId', params.colunaId.toString())
      if (params?.responsavelId) queryParams.append('responsavelId', params.responsavelId.toString())
      if (params?.criadorId) queryParams.append('criadorId', params.criadorId.toString())
      if (params?.prioridade) queryParams.append('prioridade', params.prioridade)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      if (params?.incluirExcluidas) queryParams.append('incluirExcluidas', params.incluirExcluidas.toString())

      const response = await api.get<PaginatedResponse<Tarefa>>(
        `/tarefas?${queryParams.toString()}`
      )

      if (response.data.success) {
        setTarefas(response.data.data)
        setTotalPages(response.data.meta.totalPages)
        setCurrentPage(response.data.meta.page)
        setTotal(response.data.meta.total)
        setLastParams(params)
      } else {
        throw new Error('Erro ao buscar tarefas')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao buscar tarefas'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const createTarefa = useCallback(async (data: CreateTarefaDto): Promise<Tarefa | null> => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.post<ApiResponse<Tarefa>>('/tarefas', data)

      if (response.data.success && response.data.data) {
        const novaTarefa = response.data.data
        setTarefas(prev => [novaTarefa, ...prev])
        setTotal(prev => prev + 1)
        toast.success('Tarefa criada com sucesso!')
        return novaTarefa
      } else {
        throw new Error(response.data.message || 'Erro ao criar tarefa')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao criar tarefa'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const updateTarefa = useCallback(async (id: number, data: UpdateTarefaDto): Promise<Tarefa | null> => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.patch<ApiResponse<Tarefa>>(`/tarefas/${id}`, data)

      if (response.data.success && response.data.data) {
        const tarefaAtualizada = response.data.data
        setTarefas(prev => prev.map(tarefa => 
          tarefa.id === id ? tarefaAtualizada : tarefa
        ))
        toast.success('Tarefa atualizada com sucesso!')
        return tarefaAtualizada
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar tarefa')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao atualizar tarefa'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const deleteTarefa = useCallback(async (id: number): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.delete<ApiResponse>(`/tarefas/${id}`)

      if (response.data.success) {
        setTarefas(prev => prev.filter(tarefa => tarefa.id !== id))
        setTotal(prev => prev - 1)
        toast.success('Tarefa excluída com sucesso!')
        return true
      } else {
        throw new Error(response.data.message || 'Erro ao excluir tarefa')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao excluir tarefa'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const getTarefa = useCallback(async (id: number): Promise<Tarefa | null> => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.get<ApiResponse<Tarefa>>(`/tarefas/${id}`)

      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Erro ao buscar tarefa')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao buscar tarefa'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const moveTarefa = useCallback(async (id: number, data: MoveTarefaDto): Promise<Tarefa | null> => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.patch<ApiResponse<Tarefa>>(`/tarefas/${id}/move`, data)

      if (response.data.success && response.data.data) {
        const tarefaMovida = response.data.data
        setTarefas(prev => prev.map(tarefa => 
          tarefa.id === id ? tarefaMovida : tarefa
        ))
        toast.success('Tarefa movida com sucesso!')
        return tarefaMovida
      } else {
        throw new Error(response.data.message || 'Erro ao mover tarefa')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao mover tarefa'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const getTarefasAtrasadas = useCallback(async (projetoId: number): Promise<Tarefa[]> => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.get<ApiResponse<Tarefa[]>>(
        `/tarefas/atrasadas?projetoId=${projetoId}`
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Erro ao buscar tarefas atrasadas')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao buscar tarefas atrasadas'
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const getHistoricoTarefa = useCallback(async (id: number): Promise<any[]> => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const response = await api.get<ApiResponse<any[]>>(`/tarefas/${id}/historico`)

      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Erro ao buscar histórico da tarefa')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao buscar histórico da tarefa'
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const refresh = useCallback(async () => {
    if (lastParams) {
      await fetchTarefas(lastParams)
    } else {
      await fetchTarefas()
    }
  }, [fetchTarefas, lastParams])

  // Calcular estatísticas baseadas nas tarefas carregadas
  const estatisticas = useMemo((): EstatisticasTarefas => {
    const stats = {
      total: tarefas.length,
      pendentes: 0,
      em_andamento: 0,
      concluidas: 0,
      canceladas: 0
    }

    tarefas.forEach(tarefa => {
      switch (tarefa.status) {
        case 'PENDENTE':
          stats.pendentes++
          break
        case 'EM_ANDAMENTO':
          stats.em_andamento++
          break
        case 'CONCLUIDA':
          stats.concluidas++
          break
        case 'CANCELADA':
          stats.canceladas++
          break
      }
    })

    return stats
  }, [tarefas])

  // Auto-fetch on mount if initialParams provided
  useEffect(() => {
    if (initialParams && isAuthenticated && user) {
      fetchTarefas(initialParams)
    }
  }, [isAuthenticated, user]) // Only depend on auth state, not fetchTarefas to avoid infinite loop

  return {
    tarefas,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    estatisticas,
    fetchTarefas,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    getTarefa,
    moveTarefa,
    getTarefasAtrasadas,
    getHistoricoTarefa,
    refresh,
    clearError
  }
}

export default useTarefas