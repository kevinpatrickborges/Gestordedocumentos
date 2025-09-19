import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface DashboardStatsData {
  total: number;
  pendentes: number;
  urgentes: number;
  porTipo: Record<string, number>;
  porStatus: Record<string, number>;
  recentes: any[];
}

interface DashboardStatsProps {
  data: DashboardStatsData
  isLoading?: boolean
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, isLoading = false }) => {
  const statsCards = [
    {
      title: 'Total de Solicitações',
      value: data?.total || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-l-blue-500',
    },
    {
      title: 'Necessitam de Atenção',
      value: data?.pendentes || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-l-yellow-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
              <div className="h-1 bg-gray-200 rounded w-8"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-8"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card 
            key={index} 
            className={cn(
              "hover:shadow-md transition-all duration-200 border-l-4",
              stat.borderColor,
              index === 1 && stat.value > 0 && "ring-2 ring-red-200 shadow-md"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
              <CardTitle className="text-base font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-md", stat.bgColor)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="text-2xl font-bold text-gray-900">
                {(stat.value ?? 0).toLocaleString()}
              </div>
              {index === 1 && stat.value > 0 && (
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