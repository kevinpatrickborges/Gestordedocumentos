"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const helmet_1 = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const express_rate_limit_1 = require("express-rate-limit");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const database_error_interceptor_1 = require("./common/interceptors/database-error.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port', 3000);
    const environment = configService.get('app.environment', 'development');
    const appName = configService.get('app.name', 'SGC-ITEP v2.0');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: environment === 'production'
            ? {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
                    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
                    connectSrc: ["'self'"],
                },
            }
            : false,
        crossOriginEmbedderPolicy: false,
    }));
    const rateLimitConfig = configService.get('app.security.rateLimit');
    app.use((0, express_rate_limit_1.default)({
        windowMs: rateLimitConfig.windowMs,
        max: rateLimitConfig.max,
        message: {
            error: 'Too Many Requests',
            message: 'Muitas requisições deste IP, tente novamente mais tarde.',
            statusCode: 429,
        },
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.use(compression());
    app.use(cookieParser());
    const sessionConfig = configService.get('auth.session');
    app.use(session({
        secret: sessionConfig.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: sessionConfig.secure,
            httpOnly: sessionConfig.httpOnly,
            maxAge: sessionConfig.maxAge,
            sameSite: sessionConfig.sameSite,
        },
    }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'), { prefix: '/public/' });
    const uploadPath = configService.get('app.uploadPath');
    app.useStaticAssets(uploadPath, { prefix: '/uploads/' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        disableErrorMessages: environment === 'production',
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor(), new database_error_interceptor_1.DatabaseErrorInterceptor());
    if (environment !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle(appName)
            .setDescription('Sistema de Gestão de Conteúdo - ITEP/RN')
            .setVersion(configService.get('app.version', '2.0.0'))
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', description: 'Enter JWT token', in: 'header' }, 'JWT-auth')
            .addCookieAuth('connect.sid', { type: 'apiKey', in: 'cookie', name: 'connect.sid', description: 'Session cookie' })
            .addTag('auth', 'Autenticação e Autorização')
            .addTag('users', 'Gestão de Usuários')
            .addTag('nugecid', 'NUGECID - Desarquivamentos')
            .addTag('auditoria', 'Auditoria e Logs')
            .addServer(configService.get('app.baseUrl', `http://localhost:${port}`))
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config, {
            operationIdFactory: (controllerKey, methodKey) => methodKey,
        });
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            customSiteTitle: `${appName} - API Documentation`,
            customfavIcon: '/public/favicon.ico',
            customCss: '.swagger-ui .topbar { display: none }',
            swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
        });
    }
    const corsConfig = configService.get('app.cors');
    app.enableCors({
        origin: corsConfig.origin,
        credentials: corsConfig.credentials,
        methods: corsConfig.methods,
        allowedHeaders: corsConfig.allowedHeaders,
    });
    app.set('etag', false);
    process.on('SIGTERM', async () => {
        logger.log('Encerrando (SIGTERM)...');
        await app.close();
        process.exit(0);
    });
    process.on('SIGINT', async () => {
        logger.log('Encerrando (SIGINT)...');
        await app.close();
        process.exit(0);
    });
    await app.listen(port, '0.0.0.0');
    logger.log(`Servidor iniciado: http://localhost:${port}`);
    if (environment !== 'production') {
        logger.log(`Docs: http://localhost:${port}/api/docs`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map