import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { X, Save, Loader2 } from 'lucide-react'
import { CreateTarefaDto, UpdateTarefaDto, Tarefa, StatusTarefa, PrioridadeTarefa, User } from '@/types'
import { toast } from 'sonner'

interface TarefaFormProps {
  tarefa?: Tarefa | null
  usuarios?: User[]
  projetos?: any[]
  colunas?: any[]
  onSubmit: (data: CreateTarefaDto | UpdateTarefaDto) => Promise<void>
  onCancel: () => void
  loading?: boolean
  title?: string
}

const TarefaForm: React.FC<TarefaFormProps> = ({
  tarefa,
  usuarios = [],
  projetos = [],
  colunas = [],
  onSubmit,
  onCancel,
  loading = false,
  title
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: StatusTarefa.PENDENTE,
    prioridade: PrioridadeTarefa.MEDIA,
    responsavelId: '',
    projetoId: '',
    colunaId: '',
    prazo: '',
    estimativaHoras: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher formulário quando editando
  useEffect(() => {
    if (tarefa) {
      setFormData({
        titulo: tarefa.titulo || '',
        descricao: tarefa.descricao || '',
        status: tarefa.status || StatusTarefa.PENDENTE,
        prioridade: tarefa.prioridade || PrioridadeTarefa.MEDIA,
        responsavelId: tarefa.responsavelId?.toString() || '',
        projetoId: tarefa.projetoId?.toString() || '',
        colunaId: tarefa.colunaId?.toString() || '',
        prazo: tarefa.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : '',
        estimativaHoras: tarefa.estimativaHoras?.toString() || ''
      })
    }
  }, [tarefa])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório'
    }

    if (!formData.responsavelId) {
      newErrors.responsavelId = 'Responsável é obrigatório'
    }

    if (formData.estimativaHoras && isNaN(Number(formData.estimativaHoras))) {
      newErrors.estimativaHoras = 'Estimativa deve ser um número válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      const submitData: CreateTarefaDto | UpdateTarefaDto = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || undefined,
        status: formData.status,
        prioridade: formData.prioridade,
        responsavelId: parseInt(formData.responsavelId),
        projetoId: formData.projetoId ? parseInt(formData.projetoId) : undefined,
        colunaId: formData.colunaId ? parseInt(formData.colunaId) : undefined,
        prazo: formData.prazo ? new Date(formData.prazo).toISOString() : undefined,
        estimativaHoras: formData.estimativaHoras ? parseFloat(formData.estimativaHoras) : undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
    }
  }

  const getStatusLabel = (status: StatusTarefa) => {
    switch (status) {
      case StatusTarefa.PENDENTE:
        return 'Pendente'
      case StatusTarefa.EM_ANDAMENTO:
        return 'Em Andamento'
      case StatusTarefa.CONCLUIDA:
        return 'Concluída'
      case StatusTarefa.CANCELADA:
        return 'Cancelada'
      default:
        return 'Não definido'
    }
  }

  const getPrioridadeLabel = (prioridade: PrioridadeTarefa) => {
    switch (prioridade) {
      case PrioridadeTarefa.BAIXA:
        return 'Baixa'
      case PrioridadeTarefa.MEDIA:
        return 'Média'
      case PrioridadeTarefa.ALTA:
        return 'Alta'
      case PrioridadeTarefa.CRITICA:
        return 'Crítica'
      default:
        return 'Não definida'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {title || (tarefa ? 'Editar Tarefa' : 'Nova Tarefa')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Digite o título da tarefa"
              className={errors.titulo ? 'border-red-500' : ''}
            />
            {errors.titulo && (
              <p className="text-sm text-red-600">{errors.titulo}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva os detalhes da tarefa"
              rows={3}
            />
          </div>

          {/* Linha 1: Status e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StatusTarefa).map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => handleInputChange('prioridade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PrioridadeTarefa).map((prioridade) => (
                    <SelectItem key={prioridade} value={prioridade}>
                      {getPrioridadeLabel(prioridade)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 2: Responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsavelId">Responsável *</Label>
            <Select
              value={formData.responsavelId}
              onValueChange={(value) => handleInputChange('responsavelId', value)}
            >
              <SelectTrigger className={errors.responsavelId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id.toString()}>
                    {usuario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.responsavelId && (
              <p className="text-sm text-red-600">{errors.responsavelId}</p>
            )}
          </div>

          {/* Linha 3: Projeto e Coluna */}
          {(projetos.length > 0 || colunas.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projetos.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="projetoId">Projeto</Label>
                  <Select
                    value={formData.projetoId || 'none'}
                    onValueChange={(value) => handleInputChange('projetoId', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum projeto</SelectItem>
                      {projetos.map((projeto) => (
                        <SelectItem key={projeto.id} value={projeto.id.toString()}>
                          {projeto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {colunas.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="colunaId">Coluna</Label>
                  <Select
                    value={formData.colunaId || 'none'}
                    onValueChange={(value) => handleInputChange('colunaId', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma coluna</SelectItem>
                      {colunas.map((coluna) => (
                        <SelectItem key={coluna.id} value={coluna.id.toString()}>
                          {coluna.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Linha 4: Prazo e Estimativa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo</Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => handleInputChange('prazo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimativaHoras">Estimativa (horas)</Label>
              <Input
                id="estimativaHoras"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimativaHoras}
                onChange={(e) => handleInputChange('estimativaHoras', e.target.value)}
                placeholder="Ex: 2.5"
                className={errors.estimativaHoras ? 'border-red-500' : ''}
              />
              {errors.estimativaHoras && (
                <p className="text-sm text-red-600">{errors.estimativaHoras}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {tarefa ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default TarefaForm