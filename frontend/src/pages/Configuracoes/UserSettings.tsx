import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
} from '@/components/ui';
import {
  User,
  Lock,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userConfig, setUserConfig] = useState({
    showEmail: true,
    showPhone: false,
    autoSave: true,
    compactView: false,
    itemsPerPage: 10
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simular alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                setUserConfig(prev => ({ ...prev, autoSave: !!checked }))
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
                setUserConfig(prev => ({ ...prev, compactView: !!checked }))
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
  );
};
