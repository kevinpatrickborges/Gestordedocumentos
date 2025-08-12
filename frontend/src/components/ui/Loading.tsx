import React from 'react'
import { cn } from '@/utils/cn'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  className, 
  text = 'Carregando...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

// Componente para loading de página inteira
export const PageLoading: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text="Carregando página..." />
    </div>
  )
}

// Componente para loading de tabela
export const TableLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading text="Carregando dados..." />
    </div>
  )
}

// Componente para loading de botão
export const ButtonLoading: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4',
        className
      )}
    />
  )
}

export default Loading