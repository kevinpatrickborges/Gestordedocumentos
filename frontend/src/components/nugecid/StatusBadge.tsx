import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { StatusDesarquivamento } from '@/types'
import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  status: StatusDesarquivamento
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const getStatusConfig = (status: StatusDesarquivamento) => {
    const configs = {
      PENDENTE: {
        label: 'Pendente',
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      EM_ANDAMENTO: {
        label: 'Em Andamento',
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      AGUARDANDO_DOCUMENTOS: {
        label: 'Aguardando Docs',
        variant: 'outline' as const,
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      CONCLUIDO: {
        label: 'Concluído',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      CANCELADO: {
        label: 'Cancelado',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      ARQUIVADO: {
        label: 'Arquivado',
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }

    return configs[status] || {
      label: status,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        'font-medium',
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

export default StatusBadge