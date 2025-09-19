import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { ArrowLeft, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import TarefaForm from '@/components/tarefas/TarefaForm'
import { useTarefas } from '@/hooks/useTarefas'
import { CreateTarefaDto } from '@/types'

const NovaTarefaPage: React.FC = () => {
  const navigate = useNavigate()
  const { createTarefa, loading } = useTarefas()
  const [formData, setFormData] = useState<Partial<CreateTarefaDto>>({})

  const handleSubmit = async (data: CreateTarefaDto) => {
    try {
      const novaTarefa = await createTarefa(data)
      toast.success('Tarefa criada com sucesso!')
      if (novaTarefa) {
        navigate(`/tarefas/${novaTarefa.id}`)
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      toast.error('Erro ao criar tarefa. Tente novamente.')
    }
  }

  const handleCancel = () => {
    if (Object.keys(formData).length > 0) {
      if (window.confirm('Deseja realmente cancelar? As alterações não salvas serão perdidas.')) {
        navigate('/tarefas')
      }
    } else {
      navigate('/tarefas')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tarefas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Tarefa</h1>
            <p className="text-gray-600">Crie uma nova tarefa para você ou sua equipe</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Informações da Tarefa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TarefaForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitLabel="Criar Tarefa"
            cancelLabel="Cancelar"
            onChange={setFormData}
          />
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para criar uma boa tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Título claro</h4>
              <p>Use um título descritivo que explique o que precisa ser feito.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Descrição detalhada</h4>
              <p>Inclua todos os detalhes necessários para completar a tarefa.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Prazo realista</h4>
              <p>Defina um prazo que seja desafiador mas alcançável.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Responsável correto</h4>
              <p>Atribua a tarefa para a pessoa mais adequada para executá-la.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NovaTarefaPage