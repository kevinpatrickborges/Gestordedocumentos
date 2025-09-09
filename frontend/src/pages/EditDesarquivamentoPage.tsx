import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDesarquivamento, useUpdateDesarquivamento } from '@/hooks/useDesarquivamentos'
import DesarquivamentoForm from '@/components/forms/DesarquivamentoForm'
import { PageLoading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { CreateDesarquivamentoDto } from '@/types'
import { toast } from 'sonner'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const EditDesarquivamentoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: response, isLoading, error } = useDesarquivamento(id!)
  const updateDesarquivamento = useUpdateDesarquivamento()

  const desarquivamento = response?.data

  const toDateInput = (value?: string | Date) => {
    if (!value) return undefined
    try {
      if (typeof value === 'string') {
        // Se vier como ISO/string, use a parte YYYY-MM-DD diretamente (evita timezone)
        const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
        if (m) return m[1]
      }
      const d = new Date(value)
      if (isNaN(d.getTime())) return undefined
      // Usa componentes UTC para evitar "voltar um dia" em timezones negativos
      const yyyy = d.getUTCFullYear()
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(d.getUTCDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    } catch {
      return undefined
    }
  }

  const initialFormData = useMemo(() => {
    if (!desarquivamento) return undefined
    return {
      tipoDesarquivamento: desarquivamento.tipoDesarquivamento,
      nomeCompleto: desarquivamento.nomeCompleto,
      numeroNicLaudoAuto: desarquivamento.numeroNicLaudoAuto || '',
      numeroProcesso: desarquivamento.numeroProcesso,
      tipoDocumento: desarquivamento.tipoDocumento,
      dataSolicitacao: toDateInput(desarquivamento.dataSolicitacao)!,
      dataDesarquivamentoSAG: toDateInput(desarquivamento.dataDesarquivamentoSAG),
      dataDevolucaoSetor: toDateInput(desarquivamento.dataDevolucaoSetor),
      setorDemandante: desarquivamento.setorDemandante,
      servidorResponsavel: desarquivamento.servidorResponsavel,
      finalidadeDesarquivamento: desarquivamento.finalidadeDesarquivamento,
      solicitacaoProrrogacao: !!desarquivamento.solicitacaoProrrogacao,
    } as CreateDesarquivamentoDto
  }, [desarquivamento])

  const handleSubmit = async (data: CreateDesarquivamentoDto) => {
    try {
      await updateDesarquivamento.mutateAsync({ id: id!, data })
      toast.success('Solicitação atualizada com sucesso!')
      navigate(`/desarquivamentos/${id}`)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Erro ao atualizar solicitação'
      toast.error(message)
      throw error
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Solicitação não encontrada</h3>
          <p className="text-gray-600 mb-4">A solicitação que você está tentando editar não existe ou foi removida.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Editar Solicitação #{desarquivamento?.codigoBarras}</h1>
          <p className="text-gray-600 mt-1">Modifique os dados da solicitação de desarquivamento</p>
        </div>
      </div>

      <DesarquivamentoForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        isLoading={updateDesarquivamento.isPending}
        isEdit
      />
    </div>
  )
}

export default EditDesarquivamentoPage
