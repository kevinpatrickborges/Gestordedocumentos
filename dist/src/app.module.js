"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const serve_static_1 = require("@nestjs/serve-static");
const platform_express_1 = require("@nestjs/platform-express");
const path_1 = require("path");
const redisStore = require("cache-manager-redis-store");
const database_config_1 = require("./config/database.config");
const auth_config_1 = require("./config/auth.config");
const app_config_1 = require("./config/app.config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const nugecid_module_1 = require("./modules/nugecid/nugecid.module");
const auditoria_module_1 = require("./modules/audit/auditoria.module");
const seeding_module_1 = require("./modules/seeding/seeding.module");
const registros_module_1 = require("./modules/registros/registros.module");
const estatisticas_module_1 = require("./modules/estatisticas/estatisticas.module");
const health_module_1 = require("./modules/health/health.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.databaseConfigFactory, auth_config_1.default, app_config_1.default],
                envFilePath: ['.env.local', '.env'],
                cache: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: database_config_1.DatabaseConfig,
                inject: [config_1.ConfigService],
            }),
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const redisUrl = configService.get('REDIS_URL');
                    if (redisUrl) {
                        return {
                            store: redisStore,
                            url: redisUrl,
                            ttl: 300,
                            max: 100,
                            isGlobal: true,
                        };
                    }
                    return {
                        ttl: 300,
                        max: 100,
                        isGlobal: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => [
                    {
                        ttl: configService.get('THROTTLE_TTL', 60),
                        limit: configService.get('THROTTLE_LIMIT', 10),
                    },
                ],
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: false,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 10,
                verboseMemoryLeak: false,
                ignoreErrors: false,
            }),
            serve_static_1.ServeStaticModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => [
                    {
                        rootPath: (0, path_1.join)(__dirname, '..', 'public'),
                        serveRoot: '/public',
                    },
                    {
                        rootPath: configService.get('UPLOAD_PATH', './uploads'),
                        serveRoot: '/uploads',
                    },
                ],
                inject: [config_1.ConfigService],
            }),
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    dest: configService.get('UPLOAD_PATH', './uploads'),
                    limits: {
                        fileSize: configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024),
                        files: 5,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            nugecid_module_1.NugecidModule,
            auditoria_module_1.AuditoriaModule,
            seeding_module_1.SeedingModule,
            registros_module_1.RegistrosModule,
            estatisticas_module_1.EstatisticasModule,
            health_module_1.HealthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map