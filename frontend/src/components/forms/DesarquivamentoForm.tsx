import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ButtonLoading } from '@/components/ui/Loading'
import { AlertCircle, Calendar, FileText, User, Upload } from 'lucide-react'
import { TipoSolicitacao, StatusDesarquivamento, Desarquivamento, CreateDesarquivamentoDto } from '@/types'
import { formatTipo, formatStatus } from '@/utils/format'
import { useAuth } from '@/contexts/AuthContext'
import { useDesarquivamentosImport } from '@/hooks/useDesarquivamentosImport'
import { ImportModal } from '@/components/ImportModal'
import { toast } from 'sonner'

const desarquivamentoSchema = z.object({
  codigoBarras: z
    .string()
    .min(1, 'Código de barras é obrigatório')
    .regex(/^[0-9]{13}$/, 'Código de barras deve ter 13 dígitos'),
  tipo: z.nativeEnum(TipoSolicitacao, {
    errorMap: () => ({ message: 'Tipo de solicitação é obrigatório' }),
  }),
  requerente: z
    .string()
    .min(1, 'Nome do requerente é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpfRequerente: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
  telefoneRequerente: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000'),
  emailRequerente: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  justificativa: z
    .string()
    .min(1, 'Justificativa é obrigatória')
    .min(10, 'Justificativa deve ter pelo menos 10 caracteres'),
  prazoVencimento: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Data de vencimento deve ser hoje ou no futuro'),
  status: z.nativeEnum(StatusDesarquivamento).optional(),
  observacoes: z.string().optional(),
})

type DesarquivamentoFormData = z.infer<typeof desarquivamentoSchema>

interface DesarquivamentoFormProps {
  initialData?: Desarquivamento
  onSubmit: (data: CreateDesarquivamentoDto) => Promise<void>
  isLoading?: boolean
  isEdit?: boolean
}

const DesarquivamentoForm: React.FC<DesarquivamentoFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const { user } = useAuth()
  const [cpfValue, setCpfValue] = useState('')
  const [telefoneValue, setTelefoneValue] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const importDesarquivamentos = useDesarquivamentosImport()

  const canEditStatus = user?.role === 'admin' || user?.role === 'coordenador'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DesarquivamentoFormData>({
    resolver: zodResolver(desarquivamentoSchema),
    defaultValues: initialData ? {
      codigoBarras: initialData.codigoBarras,
      tipo: initialData.tipo,
      requerente: initialData.requerente,
      cpfRequerente: initialData.cpfRequerente,
      telefoneRequerente: initialData.telefoneRequerente,
      emailRequerente: initialData.emailRequerente,
      justificativa: initialData.justificativa,
      prazoVencimento: initialData.prazoVencimento 
        ? new Date(initialData.prazoVencimento).toISOString().split('T')[0]
        : undefined,
      status: initialData.status,
      observacoes: initialData.observacoes || '',
    } : {
      status: StatusDesarquivamento.PENDENTE,
    },
  })

  // Formatação de CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2')
    }
    return value
  }

  // Formatação de telefone
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers
          .replace(/^(\d{2})(\d)/, '($1) $2')
          .replace(/^(\([0-9]{2}\)\s\d{4})(\d)/, '$1-$2')
      } else {
        return numbers
          .replace(/^(\d{2})(\d)/, '($1) $2')
          .replace(/^(\([0-9]{2}\)\s\d{5})(\d)/, '$1-$2')
      }
    }
    return value
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpfValue(formatted)
    setValue('cpfRequerente', formatted)
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value)
    setTelefoneValue(formatted)
    setValue('telefoneRequerente', formatted)
  }

  useEffect(() => {
    if (initialData) {
      setCpfValue(initialData.cpfRequerente)
      setTelefoneValue(initialData.telefoneRequerente)
    }
  }, [initialData])

  const onFormSubmit = async (data: DesarquivamentoFormData) => {
    const submitData: CreateDesarquivamentoDto = {
      codigoBarras: data.codigoBarras,
      tipo: data.tipo,
      requerente: data.requerente,
      cpfRequerente: data.cpfRequerente,
      telefoneRequerente: data.telefoneRequerente,
      emailRequerente: data.emailRequerente,
      justificativa: data.justificativa,
      prazoVencimento: data.prazoVencimento ? new Date(data.prazoVencimento) : undefined,
      observacoes: data.observacoes,
    }

    // Apenas admins e coordenadores podem alterar status
    if (canEditStatus && data.status) {
      (submitData as any).status = data.status
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Informações da Solicitação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações da Solicitação
          </CardTitle>
          <CardDescription>
            Dados básicos da solicitação de desarquivamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigoBarras">Código de Barras *</Label>
              <Input
                id="codigoBarras"
                placeholder="1234567890123"
                {...register('codigoBarras')}
                className={errors.codigoBarras ? 'border-red-500' : ''}
                maxLength={13}
              />
              {errors.codigoBarras && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.codigoBarras.message}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Solicitação *</Label>
              <Select
                value={watch('tipo')}
                onValueChange={(value) => setValue('tipo', value as TipoSolicitacao)}
              >
                <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoSolicitacao.PROCESSO}>
                    {formatTipo(TipoSolicitacao.PROCESSO)}
                  </SelectItem>
                  <SelectItem value={TipoSolicitacao.INQUERITO}>
                    {formatTipo(TipoSolicitacao.INQUERITO)}
                  </SelectItem>
                  <SelectItem value={TipoSolicitacao.PROCEDIMENTO}>
                    {formatTipo(TipoSolicitacao.PROCEDIMENTO)}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.tipo.message}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazoVencimento">Prazo de Vencimento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="prazoVencimento"
                  type="date"
                  {...register('prazoVencimento')}
                  className={`pl-10 ${errors.prazoVencimento ? 'border-red-500' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.prazoVencimento && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.prazoVencimento.message}
                </div>
              )}
            </div>

            {isEdit && canEditStatus && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as StatusDesarquivamento)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusDesarquivamento.PENDENTE}>
                      {formatStatus(StatusDesarquivamento.PENDENTE)}
                    </SelectItem>
                    <SelectItem value={StatusDesarquivamento.EM_ANALISE}>
                      {formatStatus(StatusDesarquivamento.EM_ANALISE)}
                    </SelectItem>
                    <SelectItem value={StatusDesarquivamento.APROVADO}>
                      {formatStatus(StatusDesarquivamento.APROVADO)}
                    </SelectItem>
                    <SelectItem value={StatusDesarquivamento.REJEITADO}>
                      {formatStatus(StatusDesarquivamento.REJEITADO)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Requerente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Requerente
          </CardTitle>
          <CardDescription>
            Dados pessoais do solicitante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requerente">Nome Completo *</Label>
            <Input
              id="requerente"
              placeholder="Nome completo do requerente"
              {...register('requerente')}
              className={errors.requerente ? 'border-red-500' : ''}
            />
            {errors.requerente && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.requerente.message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpfRequerente">CPF *</Label>
              <Input
                id="cpfRequerente"
                placeholder="000.000.000-00"
                value={cpfValue}
                onChange={handleCpfChange}
                className={errors.cpfRequerente ? 'border-red-500' : ''}
                maxLength={14}
              />
              {errors.cpfRequerente && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.cpfRequerente.message}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefoneRequerente">Telefone *</Label>
              <Input
                id="telefoneRequerente"
                placeholder="(00) 00000-0000"
                value={telefoneValue}
                onChange={handleTelefoneChange}
                className={errors.telefoneRequerente ? 'border-red-500' : ''}
                maxLength={15}
              />
              {errors.telefoneRequerente && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.telefoneRequerente.message}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailRequerente">Email *</Label>
            <Input
              id="emailRequerente"
              type="email"
              placeholder="email@exemplo.com"
              {...register('emailRequerente')}
              className={errors.emailRequerente ? 'border-red-500' : ''}
            />
            {errors.emailRequerente && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.emailRequerente.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Justificativa e Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Justificativa e Observações</CardTitle>
          <CardDescription>
            Detalhes sobre a solicitação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa *</Label>
            <textarea
              id="justificativa"
              placeholder="Descreva o motivo da solicitação de desarquivamento..."
              {...register('justificativa')}
              className={`min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${errors.justificativa ? 'border-red-500' : ''}`}
              rows={4}
            />
            {errors.justificativa && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.justificativa.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              placeholder="Observações adicionais (opcional)..."
              {...register('observacoes')}
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between">
        <div>
          {isEdit && (user?.role === 'admin' || user?.role === 'coordenador') && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              disabled={importDesarquivamentos.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importDesarquivamentos.isPending ? 'Importando...' : 'Importar Planilha'}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <ButtonLoading className="mr-2" />
                {isEdit ? 'Atualizando...' : 'Criando...'}
              </>
            ) : (
              isEdit ? 'Atualizar Solicitação' : 'Criar Solicitação'
            )}
          </Button>
        </div>
      </div>
      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          setIsImportModalOpen(false)
          toast.success('Planilha importada com sucesso!')
          // Recarregar a página ou atualizar os dados se necessário
          window.location.reload()
        }}
      />
    </form>
  )
}

export default DesarquivamentoForm