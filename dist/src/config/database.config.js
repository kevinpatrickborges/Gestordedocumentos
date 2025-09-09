"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseConfig_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfigFactory = exports.AppDataSource = exports.DatabaseConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
let DatabaseConfig = DatabaseConfig_1 = class DatabaseConfig {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DatabaseConfig_1.name);
    }
    createTypeOrmOptions() {
        const databaseType = process.env.DATABASE_TYPE || 'postgres';
        const environment = process.env.NODE_ENV || 'development';
        const dbHost = process.env.DATABASE_HOST || 'localhost';
        const dbPort = parseInt(process.env.DATABASE_PORT || '5432', 10);
        const dbName = process.env.DATABASE_NAME || 'sgc_itep';
        const dbUser = process.env.DATABASE_USERNAME || 'postgres';
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
        const config = {
            ...baseConfig,
            type: 'postgres',
            host: dbHost,
            port: dbPort,
            username: dbUser,
            password: process.env.DATABASE_PASSWORD || '@Sanfona1',
            database: dbName,
            ssl: process.env.DATABASE_SSL === 'true'
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
        };
        this.logger.log(`Configuração do banco pronta.`);
        return config;
    }
};
exports.DatabaseConfig = DatabaseConfig;
exports.DatabaseConfig = DatabaseConfig = DatabaseConfig_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfig);
exports.AppDataSource = new typeorm_1.DataSource(new DatabaseConfig(new config_1.ConfigService()).createTypeOrmOptions());
exports.default = DatabaseConfig;
const databaseConfigFactory = () => ({
    type: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: false,
});
exports.databaseConfigFactory = databaseConfigFactory;
//# sourceMappingURL=database.config.js.map