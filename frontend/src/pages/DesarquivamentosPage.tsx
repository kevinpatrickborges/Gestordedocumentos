import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  useDesarquivamentos,
  useDeleteDesarquivamento,
} from '@/hooks/useDesarquivamentos'
import { useDesarquivamentosImport } from '@/hooks/useDesarquivamentosImport'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select'
import { DateRangePicker, DateRange } from '@/components/ui/DateRangePicker'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
// Modal customizado será implementado inline
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Upload,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Filter,
  X
} from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusDesarquivamento, TipoSolicitacao, TipoDesarquivamento, CreateDesarquivamentoDto, Desarquivamento } from '@/types'
import { formatDate, getStatusLabel, getTipoLabel, getTipoDesarquivamentoLabel } from '@/utils/format'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/Pagination'
import { TableLoading } from '@/components/ui/Loading'
import { ImportModal } from '@/components/desarquivamentos/ImportModal'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui'
import { MoreHorizontal } from 'lucide-react'
import DesarquivamentoDetailModal from '@/components/desarquivamentos/DesarquivamentoDetailModal'
import { AdminConfirmDialog } from '@/components/ui/AdminConfirmDialog'
import '@/styles/desarquivamentos.css'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api'

const DesarquivamentosPage: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tipoFilter, setTipoFilter] = useState<string>('all')
  const [tipoDesarquivamentoFilter, setTipoDesarquivamentoFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [currentPage, setCurrentPage] = useState(1)
  // Exibir todos em uma única página (até 100 itens)
  const [pageSize] = useState(100)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: Desarquivamento | null }>({
    isOpen: false,
    item: null,
  })

  const queryClient = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: StatusDesarquivamento }) => {
      return apiService.updateDesarquivamento(id, { status } as any)
    },
    onSuccess: () => {
      setEditingStatusId(null)
      // Invalida lista para refletir novo status
      queryClient.invalidateQueries({ queryKey: ['desarquivamentos'] })
    },
    onError: () => {
      setEditingStatusId(null)
    }
  })

  // Query parameters
  const queryParams = useMemo(() => {
    const toYMD = (d?: Date | null) => {
      if (!d) return undefined
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }

    return {
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? [statusFilter as StatusDesarquivamento] : undefined,
      tipo: tipoFilter !== 'all' ? (tipoFilter as TipoSolicitacao) : undefined,
      tipoDesarquivamento:
        tipoDesarquivamentoFilter !== 'all'
          ? (tipoDesarquivamentoFilter as TipoDesarquivamento)
          : undefined,
      startDate: toYMD(dateRange.startDate),
      endDate: toYMD(dateRange.endDate),
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, tipoFilter, tipoDesarquivamentoFilter, dateRange])

  const { data, isLoading, error, refetch } = useDesarquivamentos(queryParams)
  const deleteDesarquivamento = useDeleteDesarquivamento()
  const { isLoading: isImporting } = useDesarquivamentosImport(() => {
    refetch()
    setIsImportModalOpen(false)
  })

  const handleDeleteClick = (item: Desarquivamento) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 🎯 FRONTEND - handleDeleteClick chamado`)
    console.log(`[${timestamp}] 📋 Item completo recebido:`, item)
    
    // Verificar se o ID existe e é válido
    if (!item || !item.id) {
      console.error(`[${timestamp}] ❌ ERRO: Item ou ID não encontrado`, { item, id: item?.id });
      toast.error('Erro', {
        description: 'Não foi possível identificar o registro para exclusão.',
        duration: 5000,
      })
      return;
    }
    
    console.log(`[${timestamp}] 📋 Item ID validado: ${item.id} (tipo: ${typeof item.id})`)
    setDeleteConfirm({ isOpen: true, item })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.item) {
      const itemId = deleteConfirm.item.id
      const itemNic = deleteConfirm.item.numeroNicLaudoAuto || 'N/A'
      
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] 🚀 FRONTEND - INICIANDO EXCLUSÃO`)
      console.log(`[${timestamp}] 📋 Dados do item:`, {
        id: itemId,
        idType: typeof itemId,
        idValue: itemId,
        nic: itemNic,
        fullItem: deleteConfirm.item
      })
      
      try {
          // Validar se o ID é válido (pode ser número ou string)
          console.log(`[${timestamp}] 🔍 Validando ID: ${itemId} (tipo: ${typeof itemId})`);
          
          // Verificar se o ID não é nulo, undefined ou zero
          if (itemId === null || itemId === undefined || itemId === 0) {
            console.error(`[${timestamp}] ❌ ID inválido detectado:`, {
              original: itemId,
              type: typeof itemId,
              isNull: itemId === null,
              isUndefined: itemId === undefined,
              isZero: itemId === 0
            });
            toast.error('ID inválido', {
              description: 'O ID do desarquivamento não é válido.',
              duration: 5000,
            })
            setDeleteConfirm({ isOpen: false, item: null })
            return
          }
          
          console.log(`[${timestamp}] ✅ ID válido: ${itemId}`);

          console.log(`[${timestamp}] 📡 FRONTEND - Chamando deleteDesarquivamento.mutateAsync(${itemId})`);
          
          const result = await deleteDesarquivamento.mutateAsync(itemId)
          
          const responseTimestamp = new Date().toISOString()
          console.log(`[${responseTimestamp}] 📥 FRONTEND - Resposta recebida:`, result)
          
          // Verifica se a exclusão foi bem-sucedida
          if (result?.success) {
            console.log(`[${responseTimestamp}] ✅ FRONTEND - Exclusão confirmada como bem-sucedida`)
            toast.success('Desarquivamento excluído com sucesso!', {
              description: `O item foi removido do banco de dados e movido para a lixeira.`,
              duration: 5000,
            })
            
            // A atualização da lista agora é gerenciada pelo onSuccess do hook useDeleteDesarquivamento
            // O refetch() manual foi removido para evitar condições de corrida.
          } else {
            console.error(`[${responseTimestamp}] ❌ FRONTEND - Exclusão NÃO foi confirmada pelo servidor`)
            toast.error('Erro na exclusão', {
              description: 'A exclusão não foi confirmada pelo servidor.',
            })
          }
          
          setDeleteConfirm({ isOpen: false, item: null })
        } catch (error: any) {
          const errorTimestamp = new Date().toISOString()
          console.error(`[${errorTimestamp}] ❌ FRONTEND - ERRO NA EXCLUSÃO:`, error)
          console.error(`[${errorTimestamp}] 📋 Detalhes do erro:`, {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            stack: error?.stack
          })
          
          const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido'
          toast.error('Falha ao excluir desarquivamento', {
            description: `Erro: ${errorMessage}`,
            duration: 7000,
          })
          
          setDeleteConfirm({ isOpen: false, item: null })
        }
    } else {
      console.warn(`[${new Date().toISOString()}] ⚠️ FRONTEND - handleDeleteConfirm chamado sem item selecionado`)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, item: null })
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleTipoFilter = (value: string) => {
    setTipoFilter(value)
    setCurrentPage(1)
  }

  const handleTipoDesarquivamentoFilter = (value: string) => {
    setTipoDesarquivamentoFilter(value)
    setCurrentPage(1)
  }

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange)
    setCurrentPage(1)
  }

  const canEdit = user?.role?.name === 'admin' || user?.role?.name === 'coordenador'
  const canDelete = user?.role?.name === 'admin'

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar as solicitações.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Solicitações de Desarquivamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as solicitações do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {canDelete && (
            <Button asChild variant="outline" size="sm">
              <Link to="/desarquivamentos/lixeira">
                <Trash2 className="h-4 w-4 mr-2" />
                Lixeira
              </Link>
            </Button>
          )}
          {canEdit && (
            <>
              <Button onClick={() => setIsImportModalOpen(true)} 
                variant="outline" 
                size="sm"
                disabled={isImporting}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Planilha
              </Button>
              <Button asChild size="sm" className="hover:scale-100">
                <Link to="/desarquivamentos/novo">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Registro
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar solicitações específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Buscar</label>
              <SearchInput
                id="search"
                name="search"
                placeholder="Buscar por código, requerente..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger id="status" name="status">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value={StatusDesarquivamento.FINALIZADO}>
                    {getStatusLabel(StatusDesarquivamento.FINALIZADO)}
                  </SelectItem>
                  <SelectItem value={StatusDesarquivamento.DESARQUIVADO}>
                    {getStatusLabel(StatusDesarquivamento.DESARQUIVADO)}
                  </SelectItem>
                  <SelectItem value={StatusDesarquivamento.NAO_COLETADO}>
                    {getStatusLabel(StatusDesarquivamento.NAO_COLETADO)}
                  </SelectItem>
                  <SelectItem value={StatusDesarquivamento.SOLICITADO}>
                    {getStatusLabel(StatusDesarquivamento.SOLICITADO)}
                  </SelectItem>
                  <SelectItem value={StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO}>
                    {getStatusLabel(StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO)}
                  </SelectItem>
                  <SelectItem value={StatusDesarquivamento.RETIRADO_PELO_SETOR}>
                    {getStatusLabel(StatusDesarquivamento.RETIRADO_PELO_SETOR)}
                  </SelectItem>
                  <SelectItem value={StatusDesarquivamento.NAO_LOCALIZADO}>
                    {getStatusLabel(StatusDesarquivamento.NAO_LOCALIZADO)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="dateRange" className="text-sm font-medium">Período</label>
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Selecionar período de datas"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tipoDesarquivamento" className="text-sm font-medium">Desarquivamento</label>
              <Select value={tipoDesarquivamentoFilter} onValueChange={handleTipoDesarquivamentoFilter}>
                <SelectTrigger id="tipoDesarquivamento" name="tipoDesarquivamento">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value={TipoDesarquivamento.FISICO}>
                    {getTipoDesarquivamentoLabel(TipoDesarquivamento.FISICO)}
                  </SelectItem>
                  <SelectItem value={TipoDesarquivamento.DIGITAL}>
                    {getTipoDesarquivamentoLabel(TipoDesarquivamento.DIGITAL)}
                  </SelectItem>
                  <SelectItem value={TipoDesarquivamento.NAO_LOCALIZADO}>
                    {getTipoDesarquivamentoLabel(TipoDesarquivamento.NAO_LOCALIZADO)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações</CardTitle>
          <CardDescription>
            {data?.meta?.total ? `${data.meta.total} solicitação(ões) encontrada(s)` : 'Nenhuma solicitação encontrada'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableLoading />
          ) : (
            <div className="space-y-4">
              <div>
                <Table className="compact-desarquivamentos" containerClassName="overflow-y-auto overflow-x-hidden">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Desarquivamento Físico/Digital</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nome completo</TableHead>
                      <TableHead>Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA</TableHead>
                      <TableHead>Nº Processo</TableHead>
                      <TableHead>Tipo de Documento</TableHead>
                      <TableHead>Data de Solicitação</TableHead>
                      <TableHead>Data do Desarquivamento - SAG</TableHead>
                      <TableHead>Data da Devolução Pelo Setor</TableHead>
                      <TableHead>Setor Demandante</TableHead>
                      <TableHead>SERVIDOR DO ITEP RESPONSÁVEL (MATRÍCULA)</TableHead>
                      <TableHead>Finalidade do Desarquivamento</TableHead>
                      <TableHead>Solicitação de Prorrogação de Prazo de Desarquivamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-muted cursor-pointer"
                          onClick={(e) => {
                            const target = e.target as HTMLElement
                            if (target && target.closest('[data-actions="true"]')) return
                            if (item.id) setDetailId(item.id)
                          }}
                        >
                          <TableCell>
                            <Badge variant="outline">
                              {item.tipoDesarquivamento ? getTipoDesarquivamentoLabel(item.tipoDesarquivamento as TipoDesarquivamento) : '-'}
                            </Badge>
                          </TableCell>
                          <TableCell
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            {editingStatusId === item.id ? (
                              <Select
                                value={item.status}
                                onValueChange={(value) => updateStatus.mutate({ id: item.id!, status: value as StatusDesarquivamento })}
                              >
                                <SelectTrigger className="w-[130px] h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={StatusDesarquivamento.SOLICITADO}>{getStatusLabel(StatusDesarquivamento.SOLICITADO)}</SelectItem>
                                  <SelectItem value={StatusDesarquivamento.DESARQUIVADO}>{getStatusLabel(StatusDesarquivamento.DESARQUIVADO)}</SelectItem>
                                  <SelectItem value={StatusDesarquivamento.RETIRADO_PELO_SETOR}>{getStatusLabel(StatusDesarquivamento.RETIRADO_PELO_SETOR)}</SelectItem>
                                  <SelectItem value={StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO}>{getStatusLabel(StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO)}</SelectItem>
                                  <SelectItem value={StatusDesarquivamento.NAO_COLETADO}>{getStatusLabel(StatusDesarquivamento.NAO_COLETADO)}</SelectItem>
                                  <SelectItem value={StatusDesarquivamento.NAO_LOCALIZADO}>{getStatusLabel(StatusDesarquivamento.NAO_LOCALIZADO)}</SelectItem>
                                  <SelectItem value={StatusDesarquivamento.FINALIZADO}>{getStatusLabel(StatusDesarquivamento.FINALIZADO)}</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                onClick={() => setEditingStatusId(item.id!)}
                                variant={
                                  item.status === StatusDesarquivamento.FINALIZADO ? 'default' :
                                  item.status === StatusDesarquivamento.NAO_LOCALIZADO ? 'destructive' :
                                  item.status === StatusDesarquivamento.DESARQUIVADO ? 'secondary' :
                                  'outline'
                                }
                                className="text-xs px-2 py-0.5 whitespace-nowrap leading-tight cursor-pointer"
                              >
                                {getStatusLabel(item.status)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="block max-w-[260px] truncate" title={item.nomeCompleto || ''}>{item.nomeCompleto || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="block max-w-[160px] truncate font-mono" title={item.numeroNicLaudoAuto || ''}>{item.numeroNicLaudoAuto || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="block max-w-[140px] truncate font-mono" title={item.numeroProcesso || ''}>{item.numeroProcesso || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="block max-w-[160px] truncate" title={item.tipoDocumento || ''}>{item.tipoDocumento || '-'}</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(item.dataSolicitacao || item.createdAt)}
                          </TableCell>
                          <TableCell>
                            {item.dataDesarquivamentoSAG ? formatDate(item.dataDesarquivamentoSAG) : '-'}
                          </TableCell>
                          <TableCell>
                            {item.dataDevolucaoSetor ? formatDate(item.dataDevolucaoSetor) : '-'}
                          </TableCell>
                          <TableCell>{item.setorDemandante || '-'}</TableCell>
                          <TableCell>{item.servidorResponsavel || '-'}</TableCell>
                          <TableCell>{item.finalidadeDesarquivamento || '-'}</TableCell>
                          <TableCell>
                            {item.solicitacaoProrrogacao ? 'Sim' : 'Não'}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            data-actions="true"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onSelect={() => { setDetailId(item.id!) }}>
                                  Ver detalhes
                                </DropdownMenuItem>
                                {canEdit && (
                                  <DropdownMenuItem asChild>
                                    <Link to={`/desarquivamentos/${item.id}/editar`} onClick={(e) => e.stopPropagation()}>
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {canDelete && (
                                  <DropdownMenuItem onSelect={() => { setDetailId(null); handleDeleteClick(item) }}>
                                    Excluir
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma solicitação encontrada</p>
                            <p className="text-sm mt-1">
                              {searchTerm || statusFilter !== 'all' || tipoFilter !== 'all' || tipoDesarquivamentoFilter !== 'all'
                                ? 'Tente ajustar os filtros de busca'
                                : 'Comece criando uma nova solicitação'
                              }
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.meta && data.meta.total > pageSize && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, data.meta.total)} de {data.meta.total} resultados
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {currentPage} de {Math.ceil(data.meta.total / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil(data.meta.total / pageSize)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          refetch()
          setIsImportModalOpen(false)
        }}
      />

      {detailId && (
        <DesarquivamentoDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}

      <AdminConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Solicitação"
        description={`Tem certeza que deseja excluir a solicitação ${deleteConfirm.item?.numeroNicLaudoAuto}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}

export default DesarquivamentosPage
