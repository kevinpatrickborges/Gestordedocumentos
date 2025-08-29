import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateDesarquivamento } from '@/hooks/useDesarquivamentos'
import DesarquivamentoForm from '@/components/forms/DesarquivamentoForm'
import { CreateDesarquivamentoDto } from '@/types'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const NovoDesarquivamentoPage: React.FC = () => {
  const navigate = useNavigate()
  const createDesarquivamento = useCreateDesarquivamento()

  const handleSubmit = async (data: CreateDesarquivamentoDto) => {
    try {
      const result = await createDesarquivamento.mutateAsync(data)
      toast.success('Solicitação criada com sucesso!')
      navigate(`/desarquivamentos/${result?.data?.id}`)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao criar solicitação'
      toast.error(message)
      throw error // Re-throw para que o form mantenha o estado de loading
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/desarquivamentos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Novo Desarquivamento
          </h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados abaixo para criar uma nova solicitação
          </p>
        </div>
      </div>

      {/* Form */}
      <DesarquivamentoForm
        onSubmit={handleSubmit}
        isLoading={createDesarquivamento.isPending}
      />
    </div>
  )
}

export default NovoDesarquivamentoPage