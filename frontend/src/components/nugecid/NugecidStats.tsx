import React from 'react'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Archive,
  TrendingUp,
  Users
} from 'lucide-react'
import { DashboardStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface NugecidStatsProps {
  stats?: DashboardStats
  loading?: boolean
  className?: string
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  bgColor: string
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  bgColor,
  description,
  trend
}) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', bgColor)}>
          <div className={cn('w-4 h-4', color)}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={cn(
              'w-3 h-3 mr-1',
              trend.isPositive ? 'text-green-500' : 'text-red-500',
              !trend.isPositive && 'rotate-180'
            )} />
            <span className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-1">
              vs. mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const NugecidStats: React.FC<NugecidStatsProps> = ({
  stats,
  loading = false,
  className
}) => {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-500">Não foi possível carregar as estatísticas</p>
      </div>
    )
  }

  const statCards: StatCardProps[] = [
    {
      title: 'Total de Registros',
      value: stats.totalDesarquivamentos,
      icon: <FileText className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Todos os registros'
    },
    {
      title: 'Pendentes',
      value: stats.pendentes,
      icon: <Clock className="w-4 h-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Aguardando processamento'
    },
    {
      title: 'Em Andamento',
      value: stats.emAndamento,
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Sendo processados'
    },
    {
      title: 'Concluídos',
      value: stats.concluidos,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Finalizados com sucesso'
    },
    {
      title: 'Cancelados',
      value: stats.cancelados,
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Cancelados pelo usuário'
    },
    {
      title: 'Vencidos',
      value: stats.vencidos || 0,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Prazo de atendimento expirado'
    }
  ]

  return (
    <div className={cn('space-y-4', className)}>
      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Status Detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(4).map((stat, index) => (
          <StatCard key={index + 4} {...stat} />
        ))}
      </div>

      
    </div>
  )
}

export default NugecidStats