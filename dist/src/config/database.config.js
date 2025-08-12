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
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfigFactory = exports.AppDataSource = exports.DatabaseConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const path_1 = require("path");
let DatabaseConfig = class DatabaseConfig {
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        const databaseType = this.configService.get('DATABASE_TYPE', 'postgres');
        const baseConfig = {
            synchronize: false,
            logging: this.configService.get('NODE_ENV') === 'development',
            entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity{.ts,.js}')],
            migrations: [(0, path_1.join)(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
            subscribers: [(0, path_1.join)(__dirname, '..', 'database', 'subscribers', '*{.ts,.js}')],
            migrationsRun: false,
            autoLoadEntities: true,
        };
        return {
            ...baseConfig,
            type: 'postgres',
            host: this.configService.get('DATABASE_HOST'),
            port: this.configService.get('DATABASE_PORT'),
            username: this.configService.get('DATABASE_USERNAME'),
            password: this.configService.get('DATABASE_PASSWORD'),
            database: this.configService.get('DATABASE_NAME'),
            ssl: this.configService.get('DATABASE_SSL') === 'true'
                ? { rejectUnauthorized: false }
                : false,
            extra: {
                connectionLimit: 10,
                acquireTimeout: 60000,
                timeout: 60000,
            },
        };
    }
};
exports.DatabaseConfig = DatabaseConfig;
exports.DatabaseConfig = DatabaseConfig = __decorate([
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
    logging: process.env.NODE_ENV === 'development',
});
exports.databaseConfigFactory = databaseConfigFactory;
//# sourceMappingURL=database.config.js.map