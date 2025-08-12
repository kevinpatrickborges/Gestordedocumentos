import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useUsers, useUserPermissions } from '@/hooks/useUsers'
import { UsersQueryParams } from '@/types'
import UsuarioFilters from '@/components/usuarios/UsuarioFilters'
import UsuariosTable from '@/components/usuarios/UsuariosTable'
import DeleteUserModal from '@/components/usuarios/DeleteUserModal'

const UsuariosPage: React.FC = () => {
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 1,
    limit: 10,
    active: true
  })
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  
  const { canManageUsers, canViewUsers } = useUserPermissions()
  const { data: usersResponse, isLoading, error } = useUsers(queryParams)

  // Redirecionar se não tiver permissão
  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  const handleFilterChange = (newParams: Partial<UsersQueryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...newParams,
      page: 1 // Reset para primeira página ao filtrar
    }))
  }

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }))
  }

  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId)
  }

  const handleCloseDeleteModal = () => {
    setUserToDelete(null)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar usuários
          </h2>
          <p className="text-gray-600 mb-4">
            Ocorreu um erro ao carregar a lista de usuários.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os usuários do sistema SGC-ITEP
          </p>
        </div>
        
        {canManageUsers && (
          <Link
            to="/usuarios/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <UsuarioFilters
          params={queryParams}
          onParamsChange={handleFilterChange}
          canManageUsers={canManageUsers}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <UsuariosTable
          users={usersResponse?.data || []}
          meta={usersResponse?.meta}
          isLoading={isLoading}
          canManageUsers={canManageUsers}
          onPageChange={handlePageChange}
          onDeleteUser={handleDeleteUser}
        />
      </div>

      {/* Modal de confirmação de exclusão */}
      {userToDelete && (
        <DeleteUserModal
          userId={userToDelete}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  )
}

export default UsuariosPage