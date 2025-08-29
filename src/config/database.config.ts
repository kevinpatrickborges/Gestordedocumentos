import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(DatabaseConfig.name);

  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseType = process.env.DATABASE_TYPE || 'postgres';
    const environment = process.env.NODE_ENV || 'development';
    
    // Log das configurações do banco (sem senha)
    const dbHost = process.env.DATABASE_HOST || 'localhost';
    const dbPort = parseInt(process.env.DATABASE_PORT || '5432', 10);
    const dbName = process.env.DATABASE_NAME || 'sgc_itep';
    const dbUser = process.env.DATABASE_USERNAME || 'postgres';
    
    this.logger.log(`🔧 Configurando banco de dados...`);
    this.logger.log(`📍 Host: ${dbHost}:${dbPort}`);
    this.logger.log(`🗄️  Database: ${dbName}`);
    this.logger.log(`👤 Username: ${dbUser}`);
    this.logger.log(`🌐 Environment: ${environment}`);
    
    const baseConfig = {
      synchronize: false, // Desabilitado para usar migrações manuais
      logging: environment === 'development' ? ['query', 'error', 'warn', 'info', 'log'] : ['error', 'warn'],
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      subscribers: [__dirname + '/../database/subscribers/*{.ts,.js}'],
      migrationsRun: false, // Desabilitado para controle manual
      autoLoadEntities: true,
      // Configurações adicionais para monitoramento
      maxQueryExecutionTime: 5000, // Log queries que demoram mais de 5s
      logger: environment === 'development' ? 'advanced-console' : 'simple-console',
    };

    // Configuração para PostgreSQL usando variáveis de ambiente
    const config = {
      ...baseConfig,
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: process.env.DATABASE_PASSWORD || '@Sanfona1',
      database: dbName,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
      extra: {
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        // Configurações de retry
        max: 10, // pool size
        min: 2,
      },
      // Event listeners para monitoramento
      subscribers: [
        ...baseConfig.subscribers,
        // Adicionar subscriber customizado se necessário
      ],
    } as TypeOrmModuleOptions;
    
    // Log final da configuração
    this.logger.log(`✅ Configuração do banco criada`);
    this.logger.log(`🔗 Tentando conectar em: postgres://${dbUser}@${dbHost}:${dbPort}/${dbName}`);
    
    return config;
  }
}

// DataSource para migrations e CLI
export const AppDataSource = new DataSource(
  new DatabaseConfig(
    new ConfigService(),
  ).createTypeOrmOptions() as DataSourceOptions,
);

export default DatabaseConfig;

// Configuração para o ConfigModule
export const databaseConfigFactory = () => ({
  type: process.env.DATABASE_TYPE || 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false, // Desabilitado para usar migrações manuais
  logging: process.env.NODE_ENV === 'development',
});
