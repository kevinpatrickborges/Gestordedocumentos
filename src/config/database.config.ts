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
    
    // Configuração básica (sem logs detalhados)
    const dbHost = process.env.DATABASE_HOST || 'localhost';
    const dbPort = parseInt(process.env.DATABASE_PORT || '5432', 10);
    const dbName = process.env.DATABASE_NAME || 'sgc_itep';
    const dbUser = process.env.DATABASE_USERNAME || 'postgres';
    const dbPassword = process.env.DATABASE_PASSWORD;

    if (!dbPassword) {
      this.logger.error('DATABASE_PASSWORD não está definido no ambiente (.env).');
      throw new Error('DATABASE_PASSWORD não definido');
    }
    
    // Log essencial
    this.logger.log(`Inicializando configuração do banco (${environment}).`);
    
    const baseConfig = {
      synchronize: false,
      logging: ['error', 'warn'],
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      subscribers: [__dirname + '/../database/subscribers/*{.ts,.js}'],
      migrationsRun: false,
      autoLoadEntities: true,
      logger: 'simple-console',
    };

    // Configuração para PostgreSQL usando variáveis de ambiente
    const config = {
      ...baseConfig,
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPassword,
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
        max: 10,
        min: 2,
      },
      subscribers: [
        ...baseConfig.subscribers,
      ],
    } as TypeOrmModuleOptions;
    
    // Log essencial final
    this.logger.log(`Configuração do banco pronta.`);
    
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
  synchronize: false,
  logging: false,
});
