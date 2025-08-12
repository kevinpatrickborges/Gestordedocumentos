import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface DashboardStatsData {
  totalSolicitacoes: number
  pendentes: number
  aprovadas: number
  rejeitadas: number
  emAnalise: number
  vencidas: number
  crescimentoMensal?: number
}

interface DashboardStatsProps {
  data: DashboardStatsData
  isLoading?: boolean
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, isLoading = false }) => {
  const statsCards = [
    {
      title: 'Total de Solicitações',
      value: data.totalSolicitacoes,
      description: 'Todas as solicitações registradas',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: data.crescimentoMensal,
    },
    {
      title: 'Pendentes',
      value: data.pendentes,
      description: 'Aguardando processamento',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'Em Análise',
      value: data.emAnalise,
      description: 'Sendo processadas',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Aprovadas',
      value: data.aprovadas,
      description: 'Solicitações aprovadas',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Rejeitadas',
      value: data.rejeitadas,
      description: 'Solicitações rejeitadas',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Vencidas',
      value: data.vencidas,
      description: 'Prazo expirado',
      icon: AlertTriangle,
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      urgent: true,
    },
  ]

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const getTrendColor = (trend?: number) => {
    if (!trend) return 'text-gray-500'
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card 
            key={index} 
            className={cn(
              "hover:shadow-md transition-all duration-200 border-l-4",
              stat.borderColor,
              stat.urgent && "ring-2 ring-red-200 shadow-md"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-md", stat.bgColor)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {(stat.value ?? 0).toLocaleString()}
                </div>
                {stat.trend !== undefined && (
                  <div className={cn("flex items-center gap-1 text-xs", getTrendColor(stat.trend))}>
                    {getTrendIcon(stat.trend)}
                    <span>{Math.abs(stat.trend)}%</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stat.description}
              </p>
              {stat.urgent && stat.value > 0 && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Atenção necessária
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default DashboardStats