import React from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { Desarquivamento, PaginatedResponse, StatusDesarquivamento, TipoSolicitacao } from '../../types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import StatusBadge from './StatusBadge'
import ActionButtons from './ActionButtons'
import Pagination from '@/components/ui/Pagination'
import { formatDate, formatDateTime } from '@/utils/date'
import { cn } from '@/utils/cn'

interface NugecidTableProps {
  desarquivamentos: Desarquivamento[]
  loading?: boolean
  pagination?: PaginatedResponse<Desarquivamento>['meta']
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onSort?: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  className?: string
}

const columns: Column[] = [
  { key: 'numeroRegistro', label: 'Registro', sortable: true, width: 'w-36' },
  { key: 'nomeRequerente', label: 'Requerente', sortable: true, width: 'w-48' },
  { key: 'tipo', label: 'Tipo', sortable: true, width: 'w-32' },
  { key: 'status', label: 'Status', sortable: true, width: 'w-32' },
  { key: 'createdAt', label: 'Criado em', sortable: true, width: 'w-36' },
  { key: 'prazoAtendimento', label: 'Prazo', sortable: true, width: 'w-36' },
  { key: 'actions', label: 'Ações', sortable: false, width: 'w-32' },
];

const NugecidTable: React.FC<NugecidTableProps> = ({
  desarquivamentos,
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSort,
  sortBy,
  sortOrder
}) => {
  const handleSort = (columnKey: string) => {
    if (!onSort) return
    
    const newSortOrder = 
      sortBy === columnKey && sortOrder === 'ASC' ? 'DESC' : 'ASC'
    onSort(columnKey, newSortOrder)
  }

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return null
    return sortOrder === 'ASC' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const isOverdue = (prazoAtendimento?: string, status?: StatusDesarquivamento) => {
    if (!prazoAtendimento || status === StatusDesarquivamento.CONCLUIDO || status === StatusDesarquivamento.CANCELADO) {
      return false
    }
    return new Date(prazoAtendimento) < new Date()
  }

  const getTipoLabel = (tipo: TipoSolicitacao) => {
    const tipos = {
      [TipoSolicitacao.DESARQUIVAMENTO]: 'Desarquivamento',
      [TipoSolicitacao.COPIA]: 'Cópia',
      [TipoSolicitacao.VISTA]: 'Vista',
      [TipoSolicitacao.CERTIDAO]: 'Certidão'
    }
    return tipos[tipo] || tipo
  }

  const getTipoBadgeVariant = (tipo: TipoSolicitacao) => {
    const variants = {
      [TipoSolicitacao.DESARQUIVAMENTO]: 'default',
      [TipoSolicitacao.COPIA]: 'secondary',
      [TipoSolicitacao.VISTA]: 'outline',
      [TipoSolicitacao.CERTIDAO]: 'destructive'
    }
    return variants[tipo] || 'default'
  }

  if (loading && desarquivamentos.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="flex space-x-4">
            {columns.map((column, index) => (
              <div
                key={index}
                className={cn('h-4 bg-gray-200 rounded', column.width)}
              />
            ))}
          </div>
          {/* Rows skeleton */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className={cn('h-4 bg-gray-100 rounded', column.width)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {getSortIcon(column.key) || (
                          <div className="text-gray-300">
                            <ChevronUp className="w-3 h-3 -mb-1" />
                            <ChevronDown className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(desarquivamentos) && desarquivamentos.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  isOverdue(item.prazoAtendimento, item.status) && 'bg-red-50'
                )}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>{item.numeroRegistro}</span>
                    {item.urgente && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" title="Urgente" data-testid="urgent-icon" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.nomeRequerente}
                  </div>
                  {item.nomeVitima && (
                    <div className="text-sm text-gray-500">
                      Vítima: {item.nomeVitima}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getTipoBadgeVariant(item.tipo)}>
                    {getTipoLabel(item.tipo)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.usuario && (
                    <div className="flex items-center space-x-1 mt-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs">{item.usuario.nome}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.prazoAtendimento ? (
                    <div className={cn(
                      'flex items-center space-x-1',
                      isOverdue(item.prazoAtendimento, item.status) && 'text-red-600 font-medium'
                    )}>
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(item.prazoAtendimento)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons desarquivamento={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {Array.isArray(desarquivamentos) && desarquivamentos.map((item) => (
          <div
            key={item.id}
            className={cn(
              'bg-white border border-gray-200 rounded-lg p-4 space-y-3',
              isOverdue(item.prazoAtendimento, item.status) && 'border-red-200 bg-red-50'
            )}
          >

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-gray-600">
                    {item.numeroRegistro}
                  </span>
                  {item.urgente && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mt-1">
                  {item.nomeRequerente}
                </h3>
                {item.nomeVitima && (
                  <p className="text-sm text-gray-500">
                    Vítima: {item.nomeVitima}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <StatusBadge status={item.status} />
                <Badge variant={getTipoBadgeVariant(item.tipo)} size="sm">
                  {getTipoLabel(item.tipo)}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">

              <div>
                <span className="text-gray-500">Criado em:</span>
                <p className="font-medium">{formatDate(item.createdAt)}</p>
              </div>
              {item.prazoAtendimento && (
                <div className="col-span-2">
                  <span className="text-gray-500">Prazo:</span>
                  <p className={cn(
                    'font-medium',
                    isOverdue(item.prazoAtendimento, item.status) && 'text-red-600'
                  )}>
                    {formatDateTime(item.prazoAtendimento)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <ActionButtons desarquivamento={item} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={onPageChange}
            onItemsPerPageChange={onLimitChange}
          />
        </div>
      )}
    </div>
  )
}

export default NugecidTable