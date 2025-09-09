import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Badge
} from '@/components/ui';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
} from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [language, setLanguage] = useState('pt-BR');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
    sound: true
  });

  return (
    <div className="space-y-6">
      {/* Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência da interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tema atual:</span>
              <Badge variant={isDark ? 'default' : 'secondary'}>
                {isDark ? 'Escuro' : 'Claro'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              O tema é salvo automaticamente e aplicado em todas as páginas
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Modo escuro
              </Label>
              <p className="text-sm text-muted-foreground">
                Ativar tema escuro para reduzir o cansaço visual
              </p>
            </div>
            <ThemeToggle variant="switch" />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label className="text-sm font-medium">
                Alternar tema rapidamente
              </Label>
              <p className="text-sm text-muted-foreground">
                Botão para alternar entre temas claro e escuro
              </p>
            </div>
            <ThemeToggle size="md" />
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
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">Receber notificações por email</p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, email: !!checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Push</Label>
                <p className="text-sm text-muted-foreground">Notificações push no navegador</p>
              </div>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, push: !!checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Desktop</Label>
              <p className="text-sm text-muted-foreground">Notificações na área de trabalho</p>
            </div>
            <Switch
              checked={notifications.desktop}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, desktop: !!checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Som</Label>
              <p className="text-sm text-muted-foreground">Reproduzir som nas notificações</p>
            </div>
            <Switch
              checked={notifications.sound}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, sound: !!checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
