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

// Legacy entities (for compatibility) - using proper infrastructure entities
// import { Desarquivamento } from './entities/desarquivamento.entity'; // REMOVED - legacy entity
import { User } from '../users/entities/user.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';

// New Services
import { NugecidImportService } from './nugecid-import.service';
import { NugecidStatsService } from './nugecid-stats.service';
import { NugecidPdfService } from './nugecid-pdf.service';
import { NugecidExportService } from './nugecid-export.service';
import { NugecidAuditService } from './nugecid-audit.service';

// Legacy service (for gradual migration)
import { NugecidService } from './nugecid.service';

@Module({
  imports: [
    DesarquivamentoRepositoryModule,
    TypeOrmModule.forFeature([
      DesarquivamentoTypeOrmEntity,
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
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
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

    // New Services
    NugecidImportService,
    NugecidStatsService,
    NugecidPdfService,
    NugecidExportService,
    NugecidAuditService,

    // Legacy service
    NugecidService,
  ],
  exports: [
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

    // New Services
    NugecidImportService,
    NugecidStatsService,
    NugecidPdfService,
    NugecidAuditService,
    NugecidExportService,

    // Repository module
    DesarquivamentoRepositoryModule,

    // TypeORM module
    TypeOrmModule,

    // Legacy service
    NugecidService,
  ],
})
export class NugecidModule {}
