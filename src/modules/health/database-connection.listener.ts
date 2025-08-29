import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConnectionListener implements OnModuleInit {
  private readonly logger = new Logger(DatabaseConnectionListener.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log(`🔌 [CONNECTION_LISTENER] Inicializando monitoramento de conexão...`);
    
    // Verifica se já está conectado
    if (this.dataSource.isInitialized) {
      this.logger.log(`✅ [CONNECTION_LISTENER] DataSource já inicializado`);
      await this.logConnectionInfo();
    } else {
      this.logger.warn(`⚠️ [CONNECTION_LISTENER] DataSource não está inicializado`);
    }

    // Configurar listeners de eventos (se disponíveis)
    this.setupEventListeners();
  }

  private setupEventListeners() {
    try {
      // TypeORM não expõe eventos de conexão diretamente,
      // mas podemos monitorar através do driver subjacente
      const driver = this.dataSource.driver as any;
      
      if (driver && driver.master) {
        this.logger.log(`🎧 [CONNECTION_LISTENER] Configurando listeners de eventos...`);
        
        // Para PostgreSQL, podemos acessar eventos do pool de conexões
        const connection = driver.master;
        if (connection && connection.pool) {
          connection.pool.on('connect', (client: any) => {
            this.logger.log(`🔗 [CONNECTION_EVENT] Nova conexão estabelecida`);
          });

          connection.pool.on('error', (err: any, client: any) => {
            this.logger.error(`❌ [CONNECTION_EVENT] Erro na conexão: ${err.message}`);
          });

          connection.pool.on('remove', (client: any) => {
            this.logger.log(`🔌 [CONNECTION_EVENT] Conexão removida do pool`);
          });
        }
      }
    } catch (error: any) {
      this.logger.warn(`⚠️ [CONNECTION_LISTENER] Não foi possível configurar listeners: ${error.message}`);
    }
  }

  private async logConnectionInfo() {
    try {
      const driver = this.dataSource.driver as any;
      const options = this.dataSource.options;
      
      this.logger.log(`📊 [CONNECTION_INFO] Informações da conexão:`);
      this.logger.log(`   - Tipo: ${options.type}`);
      this.logger.log(`   - Host: ${(options as any).host}:${(options as any).port}`);
      this.logger.log(`   - Database: ${(options as any).database}`);
      this.logger.log(`   - SSL: ${(options as any).ssl ? 'Habilitado' : 'Desabilitado'}`);
      
      // Tentar obter informações do pool de conexões
      if (driver && driver.master && driver.master.pool) {
        const pool = driver.master.pool;
        this.logger.log(`🏊 [CONNECTION_POOL] Pool de conexões:`);
        this.logger.log(`   - Total: ${pool.totalCount || 'N/A'}`);
        this.logger.log(`   - Ativas: ${pool.idleCount || 'N/A'}`);
        this.logger.log(`   - Aguardando: ${pool.waitingCount || 'N/A'}`);
      }

      // Teste de conectividade
      const testResult = await this.dataSource.query('SELECT current_timestamp, current_user, version()');
      if (testResult && testResult[0]) {
        this.logger.log(`⏰ [CONNECTION_TEST] Timestamp: ${testResult[0].current_timestamp}`);
        this.logger.log(`👤 [CONNECTION_TEST] User: ${testResult[0].current_user}`);
      }

    } catch (error: any) {
      this.logger.error(`❌ [CONNECTION_INFO] Erro ao obter informações: ${error.message}`);
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) {
        this.logger.warn(`⚠️ [CONNECTION_CHECK] DataSource não inicializado`);
        return false;
      }

      await this.dataSource.query('SELECT 1');
      this.logger.debug(`✅ [CONNECTION_CHECK] Conexão ativa`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ [CONNECTION_CHECK] Falha na conexão: ${error.message}`);
      return false;
    }
  }

  async getConnectionStats(): Promise<any> {
    try {
      const stats = await this.dataSource.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          current_database() as database,
          current_user as user
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      return stats[0] || {};
    } catch (error: any) {
      this.logger.warn(`⚠️ [CONNECTION_STATS] Erro ao obter estatísticas: ${error.message}`);
      return { error: error.message };
    }
  }
}