import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstatisticasService } from './estatisticas.service';

@ApiTags('Estatísticas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('estatisticas')
export class EstatisticasController {
  // constructor(private readonly estatisticasService: EstatisticasService) {}

  @Get('cards')
  @ApiOperation({ summary: 'Obtém dados para os cards de estatísticas' })
  @ApiResponse({ status: 200, description: 'Dados dos cards retornados com sucesso.' })
  getCardData() {
    // return this.estatisticasService.getCardData();
  }

  @Get('atendimentos-por-mes')
  @ApiOperation({ summary: 'Obtém o número de atendimentos por mês no último ano' })
  @ApiResponse({ status: 200, description: 'Dados do gráfico de barras retornados com sucesso.' })
  getAtendimentosPorMes() {
    // return this.estatisticasService.getAtendimentosPorMes();
  }

  @Get('status-distribuicao')
  @ApiOperation({ summary: 'Obtém a distribuição de atendimentos por status' })
  @ApiResponse({ status: 200, description: 'Dados do gráfico de pizza retornados com sucesso.' })
  getStatusDistribuicao() {
    // return this.estatisticasService.getStatusDistribuicao();
  }
}