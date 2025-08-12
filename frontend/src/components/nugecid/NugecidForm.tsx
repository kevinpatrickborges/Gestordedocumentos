import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  FileText,
  Calendar,
  AlertTriangle,
  Save,
  X,
  Loader2
} from 'lucide-react'
import { CreateDesarquivamentoDto, UpdateDesarquivamentoDto, Desarquivamento } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { cn } from '@/utils/cn'

// Schema de validação
const formSchema = z.object({
  nomeRequerente: z.string().min(1, 'Nome do requerente é obrigatório'),
  nomeVitima: z.string().optional(),
  numeroRegistro: z.string().min(1, 'Número do registro é obrigatório'),
  tipo: z.enum(['DESARQUIVAMENTO', 'COPIA', 'VISTA', 'CERTIDAO'], {
    required_error: 'Tipo de solicitação é obrigatório'
  }),
  tipoDocumento: z.string().min(1, 'Tipo de documento é obrigatório'),
  observacoes: z.string().optional(),
  urgente: z.boolean().default(false),
  prazoAtendimento: z.string().optional(),
  telefoneContato: z.string().optional(),
  emailContato: z.string().email('Email inválido').optional().or(z.literal('')),
  enderecoEntrega: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface NugecidFormProps {
  initialData?: Partial<Desarquivamento>
  onSubmit: (data: CreateDesarquivamentoDto | UpdateDesarquivamentoDto) => Promise<void>
  onCancel: () => void
  loading?: boolean
  mode: 'create' | 'edit'
  className?: string
}

const NugecidForm: React.FC<NugecidFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode,
  className
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeRequerente: initialData?.nomeRequerente || '',
      nomeVitima: initialData?.nomeVitima || '',
      numeroRegistro: initialData?.numeroRegistro || '',
      tipo: initialData?.tipo || 'DESARQUIVAMENTO',
      tipoDocumento: initialData?.tipoDocumento || '',
      observacoes: initialData?.observacoes || '',
      urgente: initialData?.urgente || false,
      prazoAtendimento: initialData?.prazoAtendimento ? 
        new Date(initialData.prazoAtendimento).toISOString().split('T')[0] : '',
      telefoneContato: initialData?.telefoneContato || '',
      emailContato: initialData?.emailContato || '',
      enderecoEntrega: initialData?.enderecoEntrega || ''
    }
  })

  const watchedTipo = watch('tipo')
  const watchedUrgente = watch('urgente')

  useEffect(() => {
    if (initialData) {
      reset({
        nomeRequerente: initialData.nomeRequerente || '',
        nomeVitima: initialData.nomeVitima || '',
        numeroRegistro: initialData.numeroRegistro || '',
        tipo: initialData.tipo || 'DESARQUIVAMENTO',
        tipoDocumento: initialData.tipoDocumento || '',
        observacoes: initialData.observacoes || '',
        urgente: initialData.urgente || false,
        prazoAtendimento: initialData.prazoAtendimento ? 
          new Date(initialData.prazoAtendimento).toISOString().split('T')[0] : '',
        telefoneContato: initialData.telefoneContato || '',
        emailContato: initialData.emailContato || '',
        enderecoEntrega: initialData.enderecoEntrega || ''
      })
    }
  }, [initialData, reset])

  const onFormSubmit = async (data: FormData) => {
    try {
      const submitData = {
        ...data,
        prazoAtendimento: data.prazoAtendimento ? new Date(data.prazoAtendimento).toISOString() : undefined,
        emailContato: data.emailContato || undefined
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
    }
  }

  const tipoOptions = [
    { value: 'DESARQUIVAMENTO', label: 'Desarquivamento' },
    { value: 'COPIA', label: 'Cópia' },
    { value: 'VISTA', label: 'Vista' },
    { value: 'CERTIDAO', label: 'Certidão' }
  ]

  const tipoDocumentoOptions = [
    'Inquérito Policial',
    'Processo Criminal',
    'Termo Circunstanciado',
    'Auto de Prisão em Flagrante',
    'Boletim de Ocorrência',
    'Laudo Pericial',
    'Outros'
  ]

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn('space-y-6', className)}>
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeRequerente">
                Nome do Requerente *
              </Label>
              <Input
                id="nomeRequerente"
                {...register('nomeRequerente')}
                placeholder="Digite o nome completo"
                className={errors.nomeRequerente ? 'border-red-500' : ''}
              />
              {errors.nomeRequerente && (
                <p className="text-sm text-red-600">{errors.nomeRequerente.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeVitima">
                Nome da Vítima
              </Label>
              <Input
                id="nomeVitima"
                {...register('nomeVitima')}
                placeholder="Digite o nome da vítima (se aplicável)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroRegistro">
                Número do Registro *
              </Label>
              <Input
                id="numeroRegistro"
                {...register('numeroRegistro')}
                placeholder="Ex: 001/2024"
                className={errors.numeroRegistro ? 'border-red-500' : ''}
              />
              {errors.numeroRegistro && (
                <p className="text-sm text-red-600">{errors.numeroRegistro.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de Solicitação *
              </Label>
              <Select
                value={watchedTipo}
                onValueChange={(value) => setValue('tipo', value as any)}
              >
                <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoDocumento">
              Tipo de Documento *
            </Label>
            <Select
              value={watch('tipoDocumento')}
              onValueChange={(value) => setValue('tipoDocumento', value)}
            >
              <SelectTrigger className={errors.tipoDocumento ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {tipoDocumentoOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoDocumento && (
              <p className="text-sm text-red-600">{errors.tipoDocumento.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Configurações</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="urgente"
              checked={watchedUrgente}
              onCheckedChange={(checked) => setValue('urgente', !!checked)}
            />
            <Label htmlFor="urgente" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span>Solicitação urgente</span>
            </Label>
          </div>

          {watchedUrgente && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Solicitações urgentes têm prioridade no processamento e prazo reduzido de atendimento.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="prazoAtendimento">
              <Calendar className="w-4 h-4 inline mr-1" />
              Prazo de Atendimento
            </Label>
            <Input
              id="prazoAtendimento"
              type="date"
              {...register('prazoAtendimento')}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre a solicitação..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Informações de Contato</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefoneContato">
                Telefone de Contato
              </Label>
              <Input
                id="telefoneContato"
                {...register('telefoneContato')}
                placeholder="(85) 99999-9999"
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailContato">
                Email de Contato
              </Label>
              <Input
                id="emailContato"
                {...register('emailContato')}
                placeholder="email@exemplo.com"
                type="email"
                className={errors.emailContato ? 'border-red-500' : ''}
              />
              {errors.emailContato && (
                <p className="text-sm text-red-600">{errors.emailContato.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enderecoEntrega">
              Endereço de Entrega
            </Label>
            <Textarea
              id="enderecoEntrega"
              {...register('enderecoEntrega')}
              placeholder="Endereço completo para entrega dos documentos..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || loading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || loading}
          className="min-w-[120px]"
        >
          {(isSubmitting || loading) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Criando...' : 'Salvando...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Criar Registro' : 'Salvar Alterações'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default NugecidForm