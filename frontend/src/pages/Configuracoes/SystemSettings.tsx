import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Switch,
  Badge
} from '@/components/ui';
import {
  Database,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Settings,
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [systemConfig, setSystemConfig] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    logLevel: 'info',
    maintenanceMode: false,
    cacheEnabled: true
  });

  return (
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
              <label className="text-sm font-medium">Backup automático</label>
              <p className="text-sm text-muted-foreground">Realizar backups automaticamente</p>
            </div>
            <Switch
              checked={systemConfig.autoBackup}
              onCheckedChange={(checked) => 
                setSystemConfig(prev => ({ ...prev, autoBackup: !!checked }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="backup-frequency" className="block text-sm font-medium">Frequência do backup</label>
            <select
              id="backup-frequency"
              value={systemConfig.backupFrequency}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-ring"
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
            <label htmlFor="log-level" className="block text-sm font-medium">Nível de log</label>
            <select
              id="log-level"
              value={systemConfig.logLevel}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, logLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="error">Apenas erros</option>
              <option value="warn">Avisos e erros</option>
              <option value="info">Informações, avisos e erros</option>
              <option value="debug">Todos os logs (debug)</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Cache habilitado</label>
              <p className="text-sm text-muted-foreground">Melhorar performance com cache</p>
            </div>
            <Switch
              checked={systemConfig.cacheEnabled}
              onCheckedChange={(checked) => 
                setSystemConfig(prev => ({ ...prev, cacheEnabled: !!checked }))
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
              <label className="text-sm font-medium">Modo manutenção</label>
              <p className="text-sm text-gray-500">Bloquear acesso para manutenção</p>
            </div>
            <div className="flex items-center gap-2">
              {systemConfig.maintenanceMode && (
                <Badge variant="destructive">Ativo</Badge>
              )}
              <Switch
                checked={systemConfig.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSystemConfig(prev => ({ ...prev, maintenanceMode: !!checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
