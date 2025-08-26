import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Badge
} from '@/components/ui'
import {
  Settings,
  User,
  Shield,
  Database,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Clock,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Key
} from 'lucide-react'
import { toast } from 'sonner'

type TabType = 'geral' | 'sistema' | 'seguranca' | 'usuario'

const ConfiguracoesPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('geral')
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para configurações gerais
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('pt-BR')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
    sound: true
  })
  
  // Estados para configurações de sistema
  const [systemConfig, setSystemConfig] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    logLevel: 'info',
    maintenanceMode: false,
    cacheEnabled: true
  })
  
  // Estados para configurações de segurança
  const [securityConfig, setSecurityConfig] = useState({
    sessionTimeout: 30,
    twoFactorAuth: false,
    passwordExpiry: 90,
    loginAttempts: 5,
    requireStrongPassword: true
  })
  
  // Estados para configurações de usuário
  const [userConfig, setUserConfig] = useState({
    showEmail: true,
    showPhone: false,
    autoSave: true,
    compactView: false,
    itemsPerPage: 10
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isAdmin = user?.role?.name === 'admin'
  const isCoordenador = user?.role?.name === 'coordenador' || isAdmin

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    setIsLoading(true)
    try {
      // Simular alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Senha alterada com sucesso!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'geral' as TabType, label: 'Geral', icon: Settings, available: true },
    { id: 'sistema' as TabType, label: 'Sistema', icon: Database, available: isAdmin },
    { id: 'seguranca' as TabType, label: 'Segurança', icon: Shield, available: isCoordenador },
    { id: 'usuario' as TabType, label: 'Usuário', icon: User, available: true }
  ].filter(tab => tab.available)

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência da interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Modo escuro
              </Label>
              <p className="text-sm text-gray-500">
                Ativar tema escuro para reduzir o cansaço visual
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Idioma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma
          </CardTitle>
          <CardDescription>
            Selecione o idioma da interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">Idioma do sistema</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-500">Receber notificações por email</p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, email: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-gray-500" />
              <div>
                <Label className="text-sm font-medium">Push</Label>
                <p className="text-sm text-gray-500">Notificações push no navegador</p>
              </div>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, push: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Desktop</Label>
              <p className="text-sm text-gray-500">Notificações na área de trabalho</p>
            </div>
            <Switch
              checked={notifications.desktop}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, desktop: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Som</Label>
              <p className="text-sm text-gray-500">Reproduzir som nas notificações</p>
            </div>
            <Switch
              checked={notifications.sound}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, sound: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      {/* Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup e Recuperação
          </CardTitle>
          <CardDescription>
            Configure backups automáticos e recuperação de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Backup automático</Label>
              <p className="text-sm text-gray-500">Realizar backups automaticamente</p>
            </div>
            <Switch
              checked={systemConfig.autoBackup}
              onCheckedChange={(checked) => 
                setSystemConfig(prev => ({ ...prev, autoBackup: checked }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="backup-frequency">Frequência do backup</Label>
            <select
              id="backup-frequency"
              value={systemConfig.backupFrequency}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hourly">A cada hora</option>
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente</option>
              <option value="monthly">Mensalmente</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Fazer Backup Agora
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Restaurar Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs e Monitoramento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Logs e Monitoramento
          </CardTitle>
          <CardDescription>
            Configure o nível de logs e monitoramento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="log-level">Nível de log</Label>
            <select
              id="log-level"
              value={systemConfig.logLevel}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, logLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="error">Apenas erros</option>
              <option value="warn">Avisos e erros</option>
              <option value="info">Informações, avisos e erros</option>
              <option value="debug">Todos os logs (debug)</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Cache habilitado</Label>
              <p className="text-sm text-gray-500">Melhorar performance com cache</p>
            </div>
            <Switch
              checked={systemConfig.cacheEnabled}
              onCheckedChange={(checked) => 
                setSystemConfig(prev => ({ ...prev, cacheEnabled: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manutenção
          </CardTitle>
          <CardDescription>
            Configurações de manutenção do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Modo manutenção</Label>
              <p className="text-sm text-gray-500">Bloquear acesso para manutenção</p>
            </div>
            <div className="flex items-center gap-2">
              {systemConfig.maintenanceMode && (
                <Badge variant="destructive">Ativo</Badge>
              )}
              <Switch
                checked={systemConfig.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSystemConfig(prev => ({ ...prev, maintenanceMode: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Sessão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sessão
          </CardTitle>
          <CardDescription>
            Configure o tempo limite e comportamento da sessão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Tempo limite da sessão (minutos)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="480"
              value={securityConfig.sessionTimeout}
              onChange={(e) => setSecurityConfig(prev => ({ 
                ...prev, 
                sessionTimeout: parseInt(e.target.value) || 30 
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Autenticação
          </CardTitle>
          <CardDescription>
            Configure políticas de autenticação e segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Autenticação de dois fatores</Label>
              <p className="text-sm text-gray-500">Adicionar camada extra de segurança</p>
            </div>
            <Switch
              checked={securityConfig.twoFactorAuth}
              onCheckedChange={(checked) => 
                setSecurityConfig(prev => ({ ...prev, twoFactorAuth: checked }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password-expiry">Expiração de senha (dias)</Label>
            <Input
              id="password-expiry"
              type="number"
              min="30"
              max="365"
              value={securityConfig.passwordExpiry}
              onChange={(e) => setSecurityConfig(prev => ({ 
                ...prev, 
                passwordExpiry: parseInt(e.target.value) || 90 
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="login-attempts">Tentativas de login</Label>
            <Input
              id="login-attempts"
              type="number"
              min="3"
              max="10"
              value={securityConfig.loginAttempts}
              onChange={(e) => setSecurityConfig(prev => ({ 
                ...prev, 
                loginAttempts: parseInt(e.target.value) || 5 
              }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Senha forte obrigatória</Label>
              <p className="text-sm text-gray-500">Exigir senhas complexas</p>
            </div>
            <Switch
              checked={securityConfig.requireStrongPassword}
              onCheckedChange={(checked) => 
                setSecurityConfig(prev => ({ ...prev, requireStrongPassword: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderUserSettings = () => (
    <div className="space-y-6">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>
            Informações pessoais e configurações do perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nome completo</Label>
              <Input
                id="user-name"
                value={user?.nome || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-username">Usuário</Label>
              <Input
                id="user-username"
                value={user?.usuario || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-role">Perfil</Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={user?.role?.name === 'admin' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {user?.role?.name === 'admin' ? 'Administrador' : 
                 user?.role?.name === 'coordenador' ? 'Coordenador' : 'Usuário'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Altere sua senha para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
            />
          </div>
          
          <Button 
            onClick={handlePasswordChange}
            disabled={!newPassword || !confirmPassword || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferências
          </CardTitle>
          <CardDescription>
            Configure suas preferências de uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Salvamento automático</Label>
              <p className="text-sm text-gray-500">Salvar alterações automaticamente</p>
            </div>
            <Switch
              checked={userConfig.autoSave}
              onCheckedChange={(checked) => 
                setUserConfig(prev => ({ ...prev, autoSave: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Visualização compacta</Label>
              <p className="text-sm text-gray-500">Usar menos espaço nas listas</p>
            </div>
            <Switch
              checked={userConfig.compactView}
              onCheckedChange={(checked) => 
                setUserConfig(prev => ({ ...prev, compactView: checked }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="items-per-page">Itens por página</Label>
            <select
              id="items-per-page"
              value={userConfig.itemsPerPage}
              onChange={(e) => setUserConfig(prev => ({ 
                ...prev, 
                itemsPerPage: parseInt(e.target.value) 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 itens</option>
              <option value={10}>10 itens</option>
              <option value={25}>25 itens</option>
              <option value={50}>50 itens</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">
          Gerencie as configurações do sistema e suas preferências pessoais
        </p>
      </div>

      {/* Navegação por abas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo das abas */}
      <div className="mb-6">
        {activeTab === 'geral' && renderGeneralSettings()}
        {activeTab === 'sistema' && isAdmin && renderSystemSettings()}
        {activeTab === 'seguranca' && isCoordenador && renderSecuritySettings()}
        {activeTab === 'usuario' && renderUserSettings()}
      </div>

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}

export default ConfiguracoesPage
