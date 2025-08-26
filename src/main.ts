import 'module-alias/register';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const environment = configService.get<string>(
    'app.environment',
    'development',
  );
  const appName = configService.get<string>('app.name', 'SGC-ITEP v2.0');

  // Configuração de segurança
  app.use(
    helmet({
      contentSecurityPolicy:
        environment === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: [
                  "'self'",
                  "'unsafe-inline'",
                  'https://cdn.jsdelivr.net',
                  'https://cdnjs.cloudflare.com',
                ],
                scriptSrc: [
                  "'self'",
                  "'unsafe-inline'",
                  'https://cdn.jsdelivr.net',
                  'https://cdnjs.cloudflare.com',
                ],
                imgSrc: ["'self'", 'data:', 'https:'],
                fontSrc: [
                  "'self'",
                  'https://cdn.jsdelivr.net',
                  'https://cdnjs.cloudflare.com',
                ],
                connectSrc: ["'self'"],
              },
            }
          : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Rate limiting
  const rateLimitConfig = configService.get('app.security.rateLimit');
  app.use(
    rateLimit({
      windowMs: rateLimitConfig.windowMs,
      max: rateLimitConfig.max,
      message: {
        error: 'Too Many Requests',
        message: 'Muitas requisições deste IP, tente novamente mais tarde.',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Compressão
  app.use(compression());

  // Cookie parser
  app.use(cookieParser());

  // Configuração de sessão
  const sessionConfig = configService.get('auth.session');
  app.use(
    session({
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: sessionConfig.secure,
        httpOnly: sessionConfig.httpOnly,
        maxAge: sessionConfig.maxAge,
        sameSite: sessionConfig.sameSite,
      },
    }),
  );

  // Configuração removida: views (Handlebars) - API não precisa de templates

  // Arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Diretório de uploads
  const uploadPath = configService.get<string>('app.uploadPath');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  // Pipes globais
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: environment === 'production',
    }),
  );

  // Filtros globais
  app.useGlobalFilters(new HttpExceptionFilter());

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Interceptors globais
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Configuração do Swagger
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(appName)
      .setDescription('Sistema de Gestão de Conteúdo - ITEP/RN')
      .setVersion(configService.get<string>('app.version', '2.0.0'))
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addCookieAuth('connect.sid', {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
        description: 'Session cookie',
      })
      .addTag('auth', 'Autenticação e Autorização')
      .addTag('users', 'Gestão de Usuários')
      .addTag('nugecid', 'NUGECID - Desarquivamentos')
      .addTag('auditoria', 'Auditoria e Logs')
      .addServer(
        configService.get<string>('app.baseUrl', 'http://localhost:3000'),
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    });

    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: `${appName} - API Documentation`,
      customfavIcon: '/public/favicon.ico',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });

    logger.log(
      `📚 Swagger documentation available at: http://localhost:${port}/api/docs`,
    );
  }

  // CORS
  const corsConfig = configService.get('app.cors');
  app.enableCors({
    origin: corsConfig.origin,
    credentials: corsConfig.credentials,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
  });

  // Disable ETag to avoid 304 Not Modified responses interfering with API clients
  // This ensures the API always returns fresh JSON during development and when
  // clients don't send proper cache validators.
  app.set('etag', false);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 ${appName} está rodando em: http://localhost:${port}`);
  logger.log(`🌍 Ambiente: ${environment}`);
  logger.log(`📊 Health check: http://localhost:${port}/health`);

  if (environment !== 'production') {
    logger.log(`📚 Documentação da API: http://localhost:${port}/api/docs`);
  }

  // Verificação do banco e última alteração (tabelas auditadas)
  const dbHost =
    process.env.DATABASE_HOST ||
    configService.get('DATABASE_HOST') ||
    configService.get('database.host');
  const dbName =
    process.env.DATABASE_NAME ||
    configService.get('DATABASE_NAME') ||
    configService.get('database.name');
  try {
    const dataSource = app.get(DataSource);
    if (dataSource && dataSource.isInitialized) {
      const sql = `SELECT table_name, last_update FROM (
        SELECT 'auditorias' as table_name, MAX(timestamp) as last_update FROM auditorias
        UNION ALL
        SELECT 'desarquivamentos' as table_name, MAX(updated_at) as last_update FROM desarquivamentos
      ) t WHERE last_update IS NOT NULL ORDER BY last_update DESC LIMIT 1`;
      const res: Array<any> = await dataSource.query(sql);
      if (res && res.length > 0) {
        const row = res[0];
        logger.log(
          `🔁 Conectado ao DB: ${dbHost}/${dbName} — Última alteração em ${row.table_name}: ${row.last_update}`,
        );
      } else {
        logger.log(
          `🔁 Conectado ao DB: ${dbHost}/${dbName} — Nenhuma alteração encontrada nas tabelas auditadas.`,
        );
      }
    } else {
      logger.warn(
        'DataSource do TypeORM não está inicializado; não foi possível verificar última alteração no banco.',
      );
    }
  } catch (err: any) {
    logger.warn(
      `Não foi possível determinar última alteração do DB: ${err?.message || err}`,
    );
  }
}

bootstrap();
