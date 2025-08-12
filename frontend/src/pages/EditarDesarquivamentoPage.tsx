import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDesarquivamento, useUpdateDesarquivamento } from '@/hooks/useDesarquivamentos'
import DesarquivamentoForm from '@/components/forms/DesarquivamentoForm'
import { PageLoading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { CreateDesarquivamentoDto } from '@/types'
import { toast } from 'sonner'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const EditarDesarquivamentoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: desarquivamento, isLoading, error } = useDesarquivamento(id!)
  const updateDesarquivamento = useUpdateDesarquivamento()

  const handleSubmit = async (data: CreateDesarquivamentoDto) => {
    try {
      await updateDesarquivamento.mutateAsync({ id: id!, data })
      toast.success('Solicitação atualizada com sucesso!')
      navigate(`/desarquivamentos/${id}`)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar solicitação'
      toast.error(message)
      throw error // Re-throw para que o form mantenha o estado de loading
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  if (error || !desarquivamento) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Solicitação não encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            A solicitação que você está tentando editar não existe ou foi removida.
          </p>
          <Button onClick={() => navigate('/desarquivamentos')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/desarquivamentos/${id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Solicitação #{desarquivamento.codigoBarras}
          </h1>
          <p className="text-gray-600 mt-1">
            Modifique os dados da solicitação de desarquivamento
          </p>
        </div>
      </div>

      {/* Form */}
      <DesarquivamentoForm
        initialData={desarquivamento}
        onSubmit={handleSubmit}
        isLoading={updateDesarquivamento.isPending}
        isEdit={true}
      />
    </div>
  )
}

export default EditarDesarquivamentoPage