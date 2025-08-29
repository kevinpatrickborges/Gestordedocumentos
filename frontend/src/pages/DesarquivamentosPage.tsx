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
  Search, 
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
import { StatusDesarquivamento, TipoSolicitacao, TipoDesarquivamento, CreateDesarquivamentoDto } from '@/types'
import { formatDate, getStatusLabel, getTipoLabel, getTipoDesarquivamentoLabel } from '@/utils/format'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/Pagination'
import { TableLoading } from '@/components/ui/Loading'
import { ImportModal } from '@/components/desarquivamentos/ImportModal'
import { AdminConfirmDialog } from '@/components/ui/AdminConfirmDialog'

const DesarquivamentosPage: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tipoFilter, setTipoFilter] = useState<string>('all')
  const [tipoDesarquivamentoFilter, setTipoDesarquivamentoFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: CreateDesarquivamentoDto | null }>({
    isOpen: false,
    item: null,
  })

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter as StatusDesarquivamento : undefined,
    tipo: tipoFilter !== 'all' ? tipoFilter as TipoSolicitacao : undefined,
    startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
    endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined,
  }), [currentPage, pageSize, searchTerm, statusFilter, tipoFilter, dateRange])

  const { data, isLoading, error, refetch } = useDesarquivamentos(queryParams)
  const deleteDesarquivamento = useDeleteDesarquivamento()
  const { isLoading: isImporting } = useDesarquivamentosImport(() => {
    refetch()
    setIsImportModalOpen(false)
  })

  const handleDeleteClick = (item: CreateDesarquivamentoDto) => {
    setDeleteConfirm({ isOpen: true, item })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.item) {
      try {
        await deleteDesarquivamento.mutateAsync(Number(deleteConfirm.item.id))
        setDeleteConfirm({ isOpen: false, item: null })
      } catch (error) {
        console.error('Delete error:', error)
        setDeleteConfirm({ isOpen: false, item: null })
      }
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-gray-600 mb-4">
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
          <h1 className="text-2xl font-bold text-gray-900">
            Solicitações de Desarquivamento
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie todas as solicitações do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
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
              <Button asChild>
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
      <Card>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  name="search"
                  placeholder="Buscar por código, requerente..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <div className="overflow-x-auto">
                <Table>
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
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {item.tipoDesarquivamento ? getTipoDesarquivamentoLabel(item.tipoDesarquivamento) : '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                item.status === StatusDesarquivamento.FINALIZADO ? 'default' :
                                item.status === StatusDesarquivamento.NAO_LOCALIZADO ? 'destructive' :
                                item.status === StatusDesarquivamento.DESARQUIVADO ? 'secondary' :
                                'outline'
                              }
                            >
                              {getStatusLabel(item.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.nomeCompleto || item.nomeRequerente || '-'}</TableCell>
                          <TableCell>{item.numeroNicLaudoAuto || '-'}</TableCell>
                          <TableCell>{item.numeroProcesso || item.numeroRegistro || '-'}</TableCell>
                          <TableCell>{item.tipoDocumento || '-'}</TableCell>
                          <TableCell>
                            {formatDate(item.dataSolicitacao || item.createdAt)}
                          </TableCell>
                          <TableCell>
                            {item.dataDesarquivamentoSag ? formatDate(item.dataDesarquivamentoSag) : '-'}
                          </TableCell>
                          <TableCell>
                            {item.dataDevolucaoSetor ? formatDate(item.dataDevolucaoSetor) : '-'}
                          </TableCell>
                          <TableCell>{item.setorDemandante || '-'}</TableCell>
                          <TableCell>{item.servidorResponsavel || '-'}</TableCell>
                          <TableCell>{item.finalidadeDesarquivamento || item.finalidade || '-'}</TableCell>
                          <TableCell>
                            {item.solicitacaoProrrogacao ? 'Sim' : 'Não'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                              >
                                <Link to={`/desarquivamentos/${item.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {canEdit && (
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Link to={`/desarquivamentos/${item.id}/editar`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  disabled={deleteDesarquivamento.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-8">
                          <div className="text-gray-500">
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
                  <div className="text-sm text-gray-600">
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
                    <span className="text-sm text-gray-600">
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

      <AdminConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Solicitação"
        description={`Tem certeza que deseja excluir a solicitação ${deleteConfirm.item?.numeroNicLaudoAuto}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteDesarquivamento.isPending}
      />
    </div>
  )
}

export default DesarquivamentosPage