import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useCreateUser, useUserPermissions } from '@/hooks/useUsers'
import { CreateUserDto } from '@/types'
import UsuarioForm from '@/components/usuarios/UsuarioForm'

const NovoUsuarioPage: React.FC = () => {
  const navigate = useNavigate()
  const { canManageUsers } = useUserPermissions()
  const createUserMutation = useCreateUser()

  // Redirecionar se não tiver permissão
  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para criar usuários.
          </p>
          <Link
            to="/usuarios"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Usuários
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CreateUserDto) => {
    try {
      await createUserMutation.mutateAsync(data)
      navigate('/usuarios')
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao criar usuário:', error)
    }
  }

  const handleCancel = () => {
    navigate('/usuarios')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/usuarios"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-8 w-8" />
            Novo Usuário
          </h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados para criar um novo usuário
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-600">
        <Link to="/usuarios" className="hover:text-gray-900">
          Usuários
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Novo Usuário</span>
      </nav>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <UsuarioForm
          onSubmit={(data) => handleSubmit(data as CreateUserDto)}
          onCancel={handleCancel}
          isLoading={createUserMutation.isPending}
          mode="create"
        />
      </div>
    </div>
  )
}

export default NovoUsuarioPage