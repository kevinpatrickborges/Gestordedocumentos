import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  description = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'warning':
        return {
          icon: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }
      case 'info':
        return {
          icon: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      default:
        return {
          icon: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
    }
  }

  const styles = getVariantStyles()

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className={cn("h-6 w-6", styles.icon)} />
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "w-full sm:w-auto",
                styles.confirmButton
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { ConfirmDialog }
export type { ConfirmDialogProps }