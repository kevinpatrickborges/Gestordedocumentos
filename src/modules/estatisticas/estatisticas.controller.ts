import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '../users/enums/role-type.enum';
import { EstatisticasService } from './estatisticas.service';

@ApiTags('Estatísticas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.USUARIO)
@Controller('estatisticas')
export class EstatisticasController {
  constructor(private readonly estatisticasService: EstatisticasService) {}

  @Get('cards')
  @ApiOperation({ summary: 'Obtém dados para os cards de estatísticas' })
  @ApiResponse({
    status: 200,
    description: 'Dados dos cards retornados com sucesso.',
  })
  async getCardData() {
    const data = await this.estatisticasService.getCardData();
    return { success: true, data };
  }

  @Get('atendimentos-por-mes')
  @ApiOperation({
    summary: 'Obtém o número de atendimentos por mês no último ano',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do gráfico de barras retornados com sucesso.',
  })
  async getAtendimentosPorMes() {
    const data = await this.estatisticasService.getAtendimentosPorMes();
    return { success: true, data };
  }

  @Get('status-distribuicao')
  @ApiOperation({ summary: 'Obtém a distribuição de atendimentos por status' })
  @ApiResponse({
    status: 200,
    description: 'Dados do gráfico de pizza retornados com sucesso.',
  })
  async getStatusDistribuicao() {
    const data = await this.estatisticasService.getStatusDistribuicao();
    return { success: true, data };
  }
}
