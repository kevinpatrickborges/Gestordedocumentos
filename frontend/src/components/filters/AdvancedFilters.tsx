import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { 
  Filter, 
  X, 
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/utils/cn'
import { StatusDesarquivamento, TipoSolicitacao } from '@/types'
import { getStatusLabel, getTipoLabel } from '@/utils/format'

interface FilterState {
  search: string
  status: StatusDesarquivamento | ''
  tipo: TipoSolicitacao | ''
  dataInicio: string
  dataFim: string
  requerente: string
  vencidas: boolean
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onReset: () => void
  isLoading?: boolean
  totalResults?: number
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false,
  totalResults = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusOptions: { value: StatusDesarquivamento; label: string }[] = [
    { value: StatusDesarquivamento.PENDENTE, label: 'Pendente' },
    { value: StatusDesarquivamento.EM_ANDAMENTO, label: 'Em Andamento' },
    { value: StatusDesarquivamento.CONCLUIDO, label: 'Concluído' },
    { value: StatusDesarquivamento.CANCELADO, label: 'Cancelado' },
  ]

  const tipoOptions: { value: TipoSolicitacao; label: string }[] = [
    { value: TipoSolicitacao.DESARQUIVAMENTO, label: 'Desarquivamento' },
    { value: TipoSolicitacao.COPIA, label: 'Cópia' },
    { value: TipoSolicitacao.VISTA, label: 'Vista' },
    { value: TipoSolicitacao.CERTIDAO, label: 'Certidão' },
  ]

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status) count++
    if (filters.tipo) count++
    if (filters.dataInicio) count++
    if (filters.dataFim) count++
    if (filters.requerente) count++
    if (filters.vencidas) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {totalResults > 0 && (
                <span>{totalResults.toLocaleString()} resultado(s) encontrado(s)</span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isLoading || activeFiltersCount === 0}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Limpar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {isExpanded ? 'Menos' : 'Mais'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros Básicos - Sempre Visíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <SearchInput
              id="search"
              placeholder="Código, requerente..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <select
              id="tipo"
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              {tipoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.vencidas}
                onChange={(e) => handleFilterChange('vencidas', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Apenas vencidas
            </Label>
          </div>
        </div>

        {/* Filtros Avançados - Expansíveis */}
        {isExpanded && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requerente">Requerente</Label>
                <Input
                  id="requerente"
                  placeholder="Nome do requerente"
                  value={filters.requerente}
                  onChange={(e) => handleFilterChange('requerente', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dataFim"
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros Ativos */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2">Filtros ativos:</span>
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('search', '')}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {getStatusLabel(filters.status)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('status', '')}
                  />
                </Badge>
              )}
              {filters.tipo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tipo: {getTipoLabel(filters.tipo)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('tipo', '')}
                  />
                </Badge>
              )}
              {filters.requerente && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Requerente: {filters.requerente}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('requerente', '')}
                  />
                </Badge>
              )}
              {filters.vencidas && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Apenas vencidas
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('vencidas', false)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdvancedFilters