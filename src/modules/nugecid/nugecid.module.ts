import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Controller
import { NugecidController } from './nugecid.controller';

// Use Cases
import {
  CreateDesarquivamentoUseCase,
  FindAllDesarquivamentosUseCase,
  FindDesarquivamentoByIdUseCase,
  UpdateDesarquivamentoUseCase,
  DeleteDesarquivamentoUseCase,
  RestoreDesarquivamentoUseCase,
  GenerateTermoEntregaUseCase,
  GetDashboardStatsUseCase,
  ImportDesarquivamentoUseCase,
  ImportRegistrosUseCase,
} from './application/use-cases';

// Infrastructure
import { DesarquivamentoRepositoryModule } from './infrastructure/desarquivamento-repository.module';
import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';

// Domain Interface
import { IDesarquivamentoRepository } from './domain/interfaces/desarquivamento.repository.interface';

// Token para injeção de dependência
import { DESARQUIVAMENTO_REPOSITORY_TOKEN } from './domain/nugecid.constants';

// Legacy entities (for compatibility)
import { Desarquivamento } from './entities/desarquivamento.entity';
import { User } from '../users/entities/user.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';

// Legacy service (for gradual migration)
import { NugecidService } from './nugecid.service';

@Module({
  imports: [
    DesarquivamentoRepositoryModule,
    // TypeORM entities - incluindo as novas entidades da arquitetura hexagonal
    TypeOrmModule.forFeature([
      // Entidades legadas (para compatibilidade)
      Desarquivamento,
      User,
      Auditoria,
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = configService.get<string>(
              'UPLOAD_PATH',
              './uploads',
            );
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
            );
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedMimes = [
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'text/csv', // .csv
          ];

          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new Error('Apenas arquivos .xls, .xlsx e .csv são permitidos.'),
              false,
            );
          }
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NugecidController],
  providers: [
    // Use Cases
    CreateDesarquivamentoUseCase,
    FindAllDesarquivamentosUseCase,
    FindDesarquivamentoByIdUseCase,
    UpdateDesarquivamentoUseCase,
    DeleteDesarquivamentoUseCase,
    RestoreDesarquivamentoUseCase,
    GenerateTermoEntregaUseCase,
    GetDashboardStatsUseCase,
    ImportDesarquivamentoUseCase,
    ImportRegistrosUseCase,

    // Legacy service (para compatibilidade durante a migração)
    NugecidService,
  ],
  exports: [
    // Use Cases (para outros módulos que possam precisar)
    CreateDesarquivamentoUseCase,
    FindAllDesarquivamentosUseCase,
    FindDesarquivamentoByIdUseCase,
    UpdateDesarquivamentoUseCase,
    DeleteDesarquivamentoUseCase,
    RestoreDesarquivamentoUseCase,
    GenerateTermoEntregaUseCase,
    GetDashboardStatsUseCase,
    ImportDesarquivamentoUseCase,
    ImportRegistrosUseCase,

    // Repository module
    DesarquivamentoRepositoryModule,

    // TypeORM module
    TypeOrmModule,

    // Legacy service (para compatibilidade)
    NugecidService,
  ],
})
export class NugecidModule {}
