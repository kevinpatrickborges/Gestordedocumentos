import { Injectable, Logger } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(DatabaseConfig.name);

  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // Carrega .env manualmente para garantir disponibilidade das variáveis
    // .env primeiro, depois .env.local pode sobrescrever
    dotenvConfig({ path: join(process.cwd(), '.env'), override: false });
    dotenvConfig({ path: join(process.cwd(), '.env.local'), override: true });
    const environment = process.env.NODE_ENV || 'development';

    // Helper: lê primeiro do ConfigService, depois de process.env
    const env = (key: string, fallback?: string) =>
      this.configService.get<string>(key) ?? process.env[key] ?? fallback;

    // Configuração básica
    const dbHost = env('DATABASE_HOST', 'localhost');
    const dbPort = parseInt(env('DATABASE_PORT', '5432')!, 10);
    const dbName = env('DATABASE_NAME', 'sgc_itep');
    const dbUser = env('DATABASE_USERNAME', 'postgres');
    let dbPassword = env('DATABASE_PASSWORD');
    if (!dbPassword) {
      // suporte a variáveis usadas no docker-compose
      dbPassword = env('DOCKER_DB_PASSWORD');
    }

    if (!dbPassword) {
      this.logger.error(
        'DATABASE_PASSWORD não está definido no ambiente (.env).',
      );
      throw new Error('DATABASE_PASSWORD não definido');
    }

    this.logger.log(`Inicializando configuração do banco (${environment}).`);
    // Log informativo (não expõe senha)
    const masked = dbPassword
      ? dbPassword.replace(/.(?=.{2})/g, '*')
      : 'undefined';
    this.logger.log(
      `DB config resolvido: host=${dbHost}, port=${dbPort}, db=${dbName}, user=${dbUser}, password_set=${!!dbPassword}`,
    );
    this.logger.debug(`DB password (masked): ${masked}`);

    const baseConfig = {
      synchronize: false,
      logging: ['error', 'warn'],
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: false,
      autoLoadEntities: true,
      logger: 'simple-console',
    };

    const config = {
      ...baseConfig,
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPassword,
      database: dbName,
      ssl:
        env('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      extra: {
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        max: 10,
        min: 2,
      },
    } as TypeOrmModuleOptions;

    this.logger.log(`Configuração do banco pronta.`);

    return config;
  }
}

// DataSource para migrations/CLI (não usado pelo Nest em runtime)
let cliDataSourceOptions: DataSourceOptions;
try {
  cliDataSourceOptions = new DataSource(
    new DatabaseConfig(
      new ConfigService(),
    ).createTypeOrmOptions() as DataSourceOptions,
  ).options as DataSourceOptions;
} catch (e) {
  cliDataSourceOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || process.env.DOCKER_DB_PASSWORD,
    database: process.env.DATABASE_NAME || 'sgc_itep',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
    logging: ['error', 'warn'],
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
  } as DataSourceOptions;
}

export const AppDataSource = new DataSource(cliDataSourceOptions);

export default DatabaseConfig;

// Config para o ConfigModule
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
