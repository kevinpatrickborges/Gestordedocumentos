import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Archive,
  BarChart,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { cn } from '@/utils/cn'

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    },
    {
      name: 'Desarquivamentos',
      href: '/desarquivamentos',
      icon: FileText,
      current: location.pathname.startsWith('/desarquivamentos')
    },
    {
      name: 'NUGECID',
      href: '/nugecid',
      icon: Archive,
      current: location.pathname.startsWith('/nugecid')
    },
    {
      name: 'Relatórios',
      href: '/relatorios',
      icon: BarChart,
      current: location.pathname.startsWith('/relatorios')
    },
    {
      name: 'Usuários',
      href: '/usuarios',
      icon: Users,
      current: location.pathname.startsWith('/usuarios'),
      adminOnly: true
    },
    {
      name: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
      current: location.pathname.startsWith('/configuracoes'),
      adminOnly: true
    }
  ]

  const filteredNavigation = navigation.filter(item => {
    if (!item.adminOnly) return true
    
    // Para o item de usuários, permitir admin e coordenador
    if (item.name === 'Usuários') {
      return user?.role === 'admin' || user?.role === 'coordenador'
    }
    
    // Para outros itens adminOnly, apenas admin
    return user?.role === 'admin'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <Archive className='h-8 w-auto' />
              <h1 className='text-xl font-bold text-gray-900'>SGC-ITEP</h1>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-3 w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300',
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 relative">
          <div className="flex h-16 items-center px-4 flex-shrink-0 justify-center">
            <Link to="/" className="flex items-center gap-2">
              <Archive className={cn('h-8 w-auto', isCollapsed ? 'h-10 w-10' : 'h-8 w-auto')} />
              <h1 className={cn('text-xl font-bold text-gray-900', isCollapsed && 'hidden')}>SGC-ITEP</h1>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={cn('h-6 w-6 flex-shrink-0', !isCollapsed && 'mr-3')} />
                  <span className={cn(isCollapsed && 'hidden')}>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <div className={cn('flex items-center', isCollapsed && 'justify-center')}>
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={cn('ml-3', isCollapsed && 'hidden')}>
                <p className="text-sm font-medium text-gray-700 truncate">{user?.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn('mt-3 w-full', isCollapsed ? 'justify-center' : 'justify-start')}
            >
              <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
              <span className={cn(isCollapsed && 'hidden')}>Sair</span>
            </Button>
          </div>

          <div className="absolute -right-3 top-16">
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full h-6 w-6 bg-white shadow-md"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn('transition-all duration-300', isCollapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="text-sm text-gray-500">
                Bem-vindo, {user?.nome}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout