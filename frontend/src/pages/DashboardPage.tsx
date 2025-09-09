import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import { PageLoading } from '@/components/ui/Loading'
import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickActions from '@/components/dashboard/QuickActions'
import SystemInfo from '@/components/dashboard/SystemInfo'
import { Sun, Moon, AlertTriangle, Users, User } from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { data: stats, isLoading, error } = useDashboardStats()
  const { data: onlineUsers, isLoading: loadingOnline, error: errorOnline } = useOnlineUsers()

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-gray-600">
            Não foi possível carregar as estatísticas do dashboard.
          </p>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Bom dia', icon: Sun }
    if (hour < 18) return { text: 'Boa tarde', icon: Sun }
    return { text: 'Boa noite', icon: Moon }
  }

  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GreetingIcon className="h-6 w-6 text-blue-600" />
            {greeting.text}, {user?.nome}!
          </h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo ao Sistema de Gerenciamento de Desarquivamentos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats 
        data={{
          total: stats?.data?.totalRequests || 0,
          pendentes: stats?.data.pendentes || 0,
          emAndamento: stats?.data.emAndamento || 0,
          concluidos: stats?.data.concluidos || 0,
          cancelados: stats?.data.cancelados || 0,
          urgentes: stats?.data.urgentes || 0,
          vencidos: stats?.data.vencidos || 0,
          porTipo: stats?.data.porTipo || {},
          porStatus: stats?.data.porStatus || {},
          recentes: stats?.data.recentes || []
        }}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity
            activities={stats?.data.recentes || []}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions and Online Users - Takes 1 column */}
        <div className="space-y-6">
          <QuickActions />

          {/* Online Users */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Usuários Online</h3>
            </div>

            {loadingOnline ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Carregando...
              </div>
            ) : errorOnline ? (
              <p className="text-sm text-red-600">Erro ao carregar usuários online</p>
            ) : onlineUsers && onlineUsers.length > 0 ? (
              <div className="space-y-3">
                {onlineUsers.slice(0, 5).map((onlineUser) => (
                  <div key={onlineUser.id} className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {onlineUser.nome}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {onlineUser.usuario}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {onlineUser.role}
                    </span>
                  </div>
                ))}
                {onlineUsers.length > 5 && (
                  <p className="text-sm text-gray-600">
                    +{onlineUsers.length - 5} outros
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Nenhum usuário online</p>
            )}
          </div>
        </div>
      </div>

      {/* System Info - Full width, only for admins */}
      <SystemInfo isLoading={isLoading} />
    </div>
  )
}

export default DashboardPage
