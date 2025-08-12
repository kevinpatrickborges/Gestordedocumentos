import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Desarquivamento } from '@/types'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { useDeleteDesarquivamento } from '@/hooks/useDesarquivamentos'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface ActionButtonsProps {
  desarquivamento: Desarquivamento
  size?: 'sm' | 'lg' | 'default' | 'icon' | null | undefined
  variant?: 'default' | 'compact'
  className?: string
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  desarquivamento,
  size = 'default',
  variant = 'default',
  className
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { mutateAsync: deleteDesarquivamento, isPending: isDeleting } = useDeleteDesarquivamento()

  const handleDelete = async () => {
    try {
      await deleteDesarquivamento(desarquivamento.id)
      toast.success('Registro excluído com sucesso')
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Erro ao excluir registro')
      console.error('Erro ao excluir:', error)
    }
  }

  const canEdit = () => {
    return ![
      StatusDesarquivamento.CONCLUIDO,
      StatusDesarquivamento.CANCELADO,
    ].includes(desarquivamento.status);
  };

  const canDelete = () => {
    return [
      StatusDesarquivamento.PENDENTE,
      StatusDesarquivamento.EM_ANDAMENTO,
    ].includes(desarquivamento.status);
  };

  if (variant === 'compact') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size={size}
              className={cn('h-8 w-8 p-0', className)}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                to={`/nugecid/${desarquivamento.id}`}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Visualizar</span>
              </Link>
            </DropdownMenuItem>
            
            {canEdit() && (
              <DropdownMenuItem asChild>
                <Link
                  to={`/nugecid/${desarquivamento.id}/editar`}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            {canDelete() && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o registro <strong>{desarquivamento.codigoBarras}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Variant default - botões separados
  return (
    <>
      <div className={cn('flex items-center space-x-1', className)}>
        <Button
          variant="ghost"
          size={size}
          asChild
          className="h-8 w-8 p-0"
        >
          <Link to={`/nugecid/${desarquivamento.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">Visualizar</span>
          </Link>
        </Button>

        {canEdit() && (
          <Button
            variant="ghost"
            size={size}
            asChild
            className="h-8 w-8 p-0"
          >
            <Link to={`/nugecid/${desarquivamento.id}/editar`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Link>
          </Button>
        )}

        {canDelete() && (
          <Button
            variant="ghost"
            size={size}
            onClick={() => setShowDeleteDialog(true)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o registro <strong>{desarquivamento.codigoBarras}</strong>?
              <br />
              <span className="text-sm text-gray-600 mt-2 block">
                Requerente: {desarquivamento.nomeRequerente}
              </span>
              <span className="text-sm text-red-600 mt-1 block font-medium">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ActionButtons