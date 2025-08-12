import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseType = this.configService.get('DATABASE_TYPE', 'postgres');
    
    const baseConfig = {
      synchronize: false, // Desabilitado para usar migrações manuais
      logging: this.configService.get('NODE_ENV') === 'development',
      entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
      migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
      subscribers: [join(__dirname, '..', 'database', 'subscribers', '*{.ts,.js}')],
      migrationsRun: false, // Desabilitado para controle manual
      autoLoadEntities: true,
    };

    // Configuração para PostgreSQL usando variáveis de ambiente
    return {
      ...baseConfig,
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST'),
      port: this.configService.get<number>('DATABASE_PORT'),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      ssl: this.configService.get<string>('DATABASE_SSL') === 'true' 
        ? { rejectUnauthorized: false } 
        : false,
      extra: {
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
      },
    } as TypeOrmModuleOptions;
  }
}

// DataSource para migrations e CLI
export const AppDataSource = new DataSource(new DatabaseConfig(new ConfigService()).createTypeOrmOptions() as DataSourceOptions);

export default DatabaseConfig;

// Configuração para o ConfigModule
export const databaseConfigFactory = () => ({
  type: process.env.DATABASE_TYPE || 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false, // Desabilitado para usar migrações manuais
  logging: process.env.NODE_ENV === 'development',
});
