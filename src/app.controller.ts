import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from './modules/auth/guards/session-auth.guard';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SGC-ITEP v2.0</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 1rem;
            }
            .subtitle {
                text-align: center;
                color: #7f8c8d;
                margin-bottom: 2rem;
            }
            .status {
                display: inline-block;
                background: #27ae60;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                margin-bottom: 2rem;
            }
            .endpoints {
                display: grid;
                gap: 1rem;
                margin-top: 2rem;
            }
            .endpoint {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #3498db;
            }
            .endpoint a {
                color: #3498db;
                text-decoration: none;
                font-weight: 500;
            }
            .endpoint a:hover {
                text-decoration: underline;
            }
            .timestamp {
                text-align: center;
                color: #95a5a6;
                font-size: 0.9rem;
                margin-top: 2rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 SGC-ITEP v2.0</h1>
            <p class="subtitle">Sistema de Gestão de Conteúdo - ITEP/RN</p>
            
            <div style="text-align: center;">
                <span class="status">✅ Sistema Online</span>
            </div>
            
            <div class="endpoints">
                <div class="endpoint">
                    <span>📊 Dashboard</span>
                    <a href="/dashboard">Acessar Dashboard</a>
                </div>
                <div class="endpoint">
                    <span>📚 Documentação da API</span>
                    <a href="/api/docs">Swagger UI</a>
                </div>
                <div class="endpoint">
                    <span>🏥 Health Check</span>
                    <a href="/health">Status do Sistema</a>
                </div>
                <div class="endpoint">
                    <span>ℹ️ Sobre o Sistema</span>
                    <a href="/sobre">Informações</a>
                </div>
            </div>
            
            <div class="timestamp">
                Última atualização: ${new Date().toLocaleString('pt-BR')}
            </div>
        </div>
    </body>
    </html>
    `;
    
    return res.send(html);
  }

  @Get('dashboard')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Dados do dashboard' })
  @ApiResponse({ status: 200, description: 'Dados do dashboard retornados com sucesso' })
  async getDashboard(@Req() req: Request) {
    const user = req.user;
    const dashboardData = await this.appService.getDashboardData(user);
    
    return {
      title: 'Dashboard - SGC-ITEP',
      user,
      ...dashboardData,
    };
  }

  @Get('sobre')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Informações sobre o sistema' })
  @ApiResponse({ status: 200, description: 'Informações sobre o sistema retornadas com sucesso' })
  getSobre(@Req() req: Request) {
    return {
      title: 'Sobre - SGC-ITEP',
      version: '2.0',
      description: 'Sistema de Gestão de Conteúdo do ITEP',
      user: req.user,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação funcionando corretamente' })
  getHealth() {
    return this.appService.getHealth();
  }
}
