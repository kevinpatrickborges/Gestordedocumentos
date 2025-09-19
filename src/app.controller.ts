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
  @ApiOperation({ summary: 'Rota raiz da API' })
  @ApiResponse({
    status: 200,
    description: 'Informações da API retornadas com sucesso',
  })
  getRoot(@Res() res: Response) {
    // Redireciona para o frontend
    return res.redirect('http://localhost:3001');
  }

  @Get('dashboard')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Dados do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dados do dashboard retornados com sucesso',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Informações sobre o sistema retornadas com sucesso',
  })
  getSobre(@Req() req: Request) {
    return {
      title: 'Sobre - SGC-ITEP',
      version: '1.0',
      description: 'Sistema de Gestão de Conteúdo do ITEP',
      user: req.user,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação funcionando corretamente',
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
