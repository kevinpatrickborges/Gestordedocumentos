import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
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
    }
  ]

  const filteredNavigation = navigation.filter(item => {
    if (!item.adminOnly) return true
    
    // Para o item de usuários, permitir apenas admin
    if (item.name === 'Usuários') {
      return user?.role?.name === 'admin'
    }
    
    // Para outros itens adminOnly, apenas admin
    return user?.role?.name === 'admin'
  })

  // Verificar se deve mostrar configurações (apenas admin)
  const showSettings = user?.role?.name === 'admin'

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card border-r border-border">
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <Archive className='h-8 w-auto' />
              <h1 className='text-xl font-bold text-foreground'>NUGECID</h1>
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
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-border p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground truncate">{user?.nome}</p>
              </div>
            </div>
            {showSettings && (
              <Link
                to="/configuracoes"
                className="mt-2 w-full flex items-center px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-2 w-full justify-start py-1.5 h-auto text-sm">
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
        <div className="flex flex-col flex-grow bg-card border-r border-border relative">
          <div className="flex h-16 items-center px-4 flex-shrink-0 justify-center">
            <Link to="/" className="flex items-center gap-2">
              <Archive className={cn('h-8 w-auto', isCollapsed ? 'h-10 w-10' : 'h-8 w-auto')} />
              <h1 className={cn('text-xl font-bold text-foreground', isCollapsed && 'hidden')}>NUGECID</h1>
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
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
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

          <div className="border-t border-border p-3">
            <div className={cn('flex items-center', isCollapsed && 'justify-center')}>
              <div className="flex-shrink-0">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={cn('ml-3', isCollapsed && 'hidden')}>
                <p className="text-xs font-medium text-foreground truncate">{user?.nome}</p>
              </div>
            </div>
            {showSettings && (
              <Link
                to="/configuracoes"
                className={cn(
                  'mt-2 w-full flex items-center px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors',
                  isCollapsed ? 'justify-center' : 'justify-start'
                )}
                title={isCollapsed ? 'Configurações' : undefined}
              >
                <Settings className={cn('h-3.5 w-3.5', !isCollapsed && 'mr-2')} />
                <span className={cn(isCollapsed && 'hidden')}>Configurações</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn('mt-2 w-full py-1.5 h-auto text-xs', isCollapsed ? 'justify-center' : 'justify-start')}
            >
              <LogOut className={cn('h-3.5 w-3.5', !isCollapsed && 'mr-2')} />
              <span className={cn(isCollapsed && 'hidden')}>Sair</span>
            </Button>
          </div>

          <div className="absolute -right-3 top-16">
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full h-6 w-6 bg-card shadow-md border-border"
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
        <div className="sticky top-0 z-40 flex shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8" style={{height: '60px'}}>
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
              <ThemeToggle size="sm" />
              <span className="text-sm text-muted-foreground">
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