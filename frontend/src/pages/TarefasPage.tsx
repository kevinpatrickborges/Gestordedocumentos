import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Input } from '@/components/ui'
import { 
  CheckSquare, 
  Plus, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  User,
  Calendar,
  Eye
} from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/utils/cn'
import { useTarefas } from '@/hooks/useTarefas'
import { Tarefa, StatusTarefa, PrioridadeTarefa, QueryTarefaDto } from '@/types'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import TarefaFilters from '@/components/tarefas/TarefaFilters'

const TarefasPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    tarefas,
    loading,
    error,
    fetchTarefas,
    deleteTarefa,
    estatisticas
  } = useTarefas()

  const [filtros, setFiltros] = useState<QueryTarefaDto>({
    page: 1,
    limit: 10
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [busca, setBusca] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    const queryParams: QueryTarefaDto = {
      ...filtros,
      search: busca || undefined,
      status: filtroStatus !== 'todos' ? filtroStatus as StatusTarefa : undefined
    }
    fetchTarefas(queryParams)
  }, [filtros, busca, filtroStatus, fetchTarefas])

  const getStatusIcon = (status: StatusTarefa) => {
    switch (status) {
      case StatusTarefa.PENDENTE:
        return <Clock className="h-4 w-4" />
      case StatusTarefa.EM_ANDAMENTO:
        return <AlertCircle className="h-4 w-4" />
      case StatusTarefa.CONCLUIDA:
        return <CheckCircle className="h-4 w-4" />
      case StatusTarefa.CANCELADA:
        return <Trash2 className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: Tarefa['status']) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'em_andamento':
        return 'Em Andamento'
      case 'concluida':
        return 'Concluída'
    }
  }

  const getStatusColor = (status: StatusTarefa) => {
    switch (status) {
      case StatusTarefa.PENDENTE:
        return 'bg-yellow-100 text-yellow-800'
      case StatusTarefa.EM_ANDAMENTO:
        return 'bg-blue-100 text-blue-800'
      case StatusTarefa.CONCLUIDA:
        return 'bg-green-100 text-green-800'
      case StatusTarefa.CANCELADA:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadeColor = (prioridade: PrioridadeTarefa) => {
    switch (prioridade) {
      case PrioridadeTarefa.BAIXA:
        return 'bg-green-100 text-green-800'
      case PrioridadeTarefa.MEDIA:
        return 'bg-yellow-100 text-yellow-800'
      case PrioridadeTarefa.ALTA:
        return 'bg-orange-100 text-orange-800'
      case PrioridadeTarefa.CRITICA:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteTarefa = async (id: number) => {
    try {
      await deleteTarefa(id)
      toast.success('Tarefa excluída com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir tarefa')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar tarefas</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => fetchTarefas(filtros)}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tarefas e acompanhe o progresso</p>
        </div>
        <Button 
          onClick={() => navigate('/tarefas/nova')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.emAndamento}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <TarefaFilters
        filters={filtros}
        onFiltersChange={setFiltros}
        onClearFilters={() => setFiltros({ page: 1, limit: 10 })}
        loading={loading}
        showAdvanced={showAdvancedFilters}
        onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {!tarefas || tarefas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-gray-600 mb-4">
                {busca || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros para encontrar tarefas.' 
                  : 'Comece criando sua primeira tarefa.'}
              </p>
              <Button onClick={() => setMostrarFormulario(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </CardContent>
          </Card>
        ) : (
          tarefas.map((tarefa) => (
            <Card key={tarefa.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tarefa.titulo}</h3>
                      <Badge className={cn(getStatusColor(tarefa.coluna?.nome as StatusTarefa || StatusTarefa.PENDENTE))}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(tarefa.coluna?.nome as StatusTarefa || StatusTarefa.PENDENTE)}
                          <span className="capitalize">{tarefa.coluna?.nome || 'Pendente'}</span>
                        </div>
                      </Badge>
                      <Badge className={cn(getPrioridadeColor(tarefa.prioridade))}>
                        <span className="capitalize">{tarefa.prioridade.toLowerCase()}</span>
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{tarefa.descricao}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Criado em: {new Date(tarefa.createdAt).toLocaleDateString('pt-BR')}</span>
                      {tarefa.prazo && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Vence em: {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {tarefa.responsavel && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {tarefa.responsavel.nome}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/tarefas/${tarefa.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/tarefas/${tarefa.id}/editar`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteTarefa(tarefa.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default TarefasPage