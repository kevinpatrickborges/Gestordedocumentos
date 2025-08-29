import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
export declare class DatabaseConfig implements TypeOrmOptionsFactory {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    createTypeOrmOptions(): TypeOrmModuleOptions;
}
export declare const AppDataSource: DataSource;
export default DatabaseConfig;
export declare const databaseConfigFactory: () => {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    synchronize: boolean;
    logging: boolean;
};
