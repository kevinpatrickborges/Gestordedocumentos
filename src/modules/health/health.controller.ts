import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  DatabaseHealthService,
  DatabaseHealthStatus,
} from './database-health.service';
import { IsPublic } from '../../common/decorators/is-public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly databaseHealthService: DatabaseHealthService) {}

  @Get()
  @IsPublic()
  @ApiOperation({ summary: 'Verificação geral de saúde do sistema' })
  @ApiResponse({ status: 200, description: 'Status de saúde do sistema' })
  async getHealth() {
    this.logger.log(`🔍 [HEALTH] Verificação de saúde solicitada`);

    const dbHealth = await this.databaseHealthService.checkHealth();

    const health = {
      status: dbHealth.status === 'healthy' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
      memory: process.memoryUsage(),
      version: process.version,
    };

    this.logger.log(
      `📊 [HEALTH] Status: ${health.status}, DB: ${dbHealth.status}`,
    );

    return health;
  }

  @Get('database')
  @IsPublic()
  @ApiOperation({
    summary: 'Verificação detalhada da conexão com banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Status detalhado do banco de dados',
  })
  async getDatabaseHealth(): Promise<DatabaseHealthStatus> {
    this.logger.log(`🔍 [DB_HEALTH] Verificação detalhada do banco solicitada`);

    const health = await this.databaseHealthService.checkHealth();

    this.logger.log(
      `📊 [DB_HEALTH] Resultado: ${health.status}, Tempo: ${health.responseTime}ms`,
    );

    return health;
  }

  @Get('database/test')
  @IsPublic()
  @ApiOperation({ summary: 'Executa testes de queries no banco de dados' })
  @ApiResponse({ status: 200, description: 'Resultados dos testes de queries' })
  async testDatabaseQueries() {
    this.logger.log(`🧪 [DB_TEST] Testes de queries solicitados`);

    try {
      const testResults = await this.databaseHealthService.testQueries();

      this.logger.log(`🎉 [DB_TEST] Testes concluídos`);

      return {
        status: 'completed',
        timestamp: new Date().toISOString(),
        results: testResults,
      };
    } catch (error: any) {
      this.logger.error(`❌ [DB_TEST] Erro nos testes: ${error.message}`);

      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        results: null,
      };
    }
  }

  @Get('database/info')
  @IsPublic()
  @ApiOperation({ summary: 'Informações detalhadas do banco de dados' })
  @ApiResponse({
    status: 200,
    description: 'Informações do PostgreSQL e tabelas',
  })
  async getDatabaseInfo() {
    this.logger.log(`📊 [DB_INFO] Informações do banco solicitadas`);

    try {
      const dbInfo = await this.databaseHealthService.getDbInfo();

      this.logger.log(`📊 [DB_INFO] Informações coletadas com sucesso`);

      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        data: dbInfo,
      };
    } catch (error: any) {
      this.logger.error(
        `❌ [DB_INFO] Erro ao coletar informações: ${error.message}`,
      );

      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        data: null,
      };
    }
  }

  @Get('ping')
  @IsPublic()
  @ApiOperation({ summary: 'Ping básico do sistema' })
  @ApiResponse({ status: 200, description: 'Pong - sistema ativo' })
  async ping() {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
