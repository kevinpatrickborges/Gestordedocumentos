import React, { useState } from 'react'
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { QueryDesarquivamentoDto, TipoSolicitacao, StatusDesarquivamento } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

interface NugecidFiltersProps {
  filters: QueryDesarquivamentoDto
  onFiltersChange: (filters: QueryDesarquivamentoDto) => void
  onClearFilters: () => void
  className?: string
}

const NugecidFilters: React.FC<NugecidFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<QueryDesarquivamentoDto>(filters)

  const tipoOptions = Object.values(TipoSolicitacao).map(value => ({ value, label: value }))

  const statusOptions = Object.values(StatusDesarquivamento).map(value => ({ value, label: value }))

  const handleFilterChange = (key: keyof QueryDesarquivamentoDto, value: any) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: QueryDesarquivamentoDto = {
      page: 1,
      limit: 10
    }
    setLocalFilters(clearedFilters)
    onClearFilters()
  }



  const activeFiltersCount = Object.keys(localFilters).filter(
    (key) =>
      key !== 'page' &&
      key !== 'limit' &&
      localFilters[key as keyof QueryDesarquivamentoDto] !== undefined &&
      localFilters[key as keyof QueryDesarquivamentoDto] !== ''
  ).length;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <CardTitle className="text-base">Filtros</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca Global - Sempre visível */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por código, requerente, vítima ou registro..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros Avançados - Colapsáveis */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* Primeira linha - Tipo e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Solicitação</Label>
                <Select
                  value={(localFilters.tipo as string) || ''}
                  onValueChange={(value) => handleFilterChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {tipoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={(localFilters.status as string) || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            

            {/* Terceira linha - Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data Início
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={localFilters.dataInicio || ''}
                  onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data Fim
                </Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={localFilters.dataFim || ''}
                  onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                />
              </div>
            </div>

            {/* Quarta linha - Filtros especiais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgente">Urgência</Label>
                <Select
                  value={localFilters.urgente?.toString() || ''}
                  onValueChange={(value) => {
                    if (value === '') {
                      handleFilterChange('urgente', undefined)
                    } else {
                      handleFilterChange('urgente', value === 'true')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="true">Apenas urgentes</SelectItem>
                    <SelectItem value="false">Não urgentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy">Ordenar por</Label>
                <Select
                  value={localFilters.sortBy || 'createdAt'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Data de Criação</SelectItem>
                    <SelectItem value="updatedAt">Última Atualização</SelectItem>
                    <SelectItem value="nomeRequerente">Nome do Requerente</SelectItem>
                    <SelectItem value="numeroRegistro">Número do Registro</SelectItem>
                    <SelectItem value="prazoAtendimento">Prazo de Atendimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Ordem</Label>
                <Select
                  value={localFilters.sortOrder || 'DESC'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASC">Crescente</SelectItem>
                    <SelectItem value="DESC">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Filtros Ativos */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 mr-2">Filtros ativos:</span>
            {localFilters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Busca: {localFilters.search}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('search', undefined)}
                />
              </Badge>
            )}
            {localFilters.tipo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tipo: {tipoOptions.find(t => t.value === localFilters.tipo)?.label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('tipo', undefined)}
                />
              </Badge>
            )}
            {localFilters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusOptions.find(s => s.value === localFilters.status)?.label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', undefined)}
                />
              </Badge>
            )}
            {localFilters.urgente !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {localFilters.urgente ? 'Urgentes' : 'Não urgentes'}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('urgente', undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NugecidFilters