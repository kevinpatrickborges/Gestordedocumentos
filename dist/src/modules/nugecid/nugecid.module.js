"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NugecidModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const nugecid_controller_1 = require("./nugecid.controller");
const use_cases_1 = require("./application/use-cases");
const desarquivamento_repository_module_1 = require("./infrastructure/desarquivamento-repository.module");
const desarquivamento_typeorm_entity_1 = require("./infrastructure/entities/desarquivamento.typeorm-entity");
const user_entity_1 = require("../users/entities/user.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
const nugecid_import_service_1 = require("./nugecid-import.service");
const nugecid_stats_service_1 = require("./nugecid-stats.service");
const nugecid_pdf_service_1 = require("./nugecid-pdf.service");
const nugecid_export_service_1 = require("./nugecid-export.service");
const nugecid_audit_service_1 = require("./nugecid-audit.service");
const nugecid_service_1 = require("./nugecid.service");
let NugecidModule = class NugecidModule {
};
exports.NugecidModule = NugecidModule;
exports.NugecidModule = NugecidModule = __decorate([
    (0, common_1.Module)({
        imports: [
            desarquivamento_repository_module_1.DesarquivamentoRepositoryModule,
            typeorm_1.TypeOrmModule.forFeature([
                desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity,
                user_entity_1.User,
                auditoria_entity_1.Auditoria,
            ]),
            platform_express_1.MulterModule.register({
                storage: multer.memoryStorage(),
                fileFilter: (req, file, cb) => {
                    const allowedMimes = [
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'text/csv',
                        'application/vnd.ms-excel.sheet.macroEnabled.12',
                    ];
                    if (allowedMimes.includes(file.mimetype)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('Apenas arquivos .xls, .xlsx, .xlsm e .csv são permitidos.'), false);
                    }
                },
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
        ],
        controllers: [nugecid_controller_1.NugecidController],
        providers: [
            use_cases_1.CreateDesarquivamentoUseCase,
            use_cases_1.FindAllDesarquivamentosUseCase,
            use_cases_1.FindDesarquivamentoByIdUseCase,
            use_cases_1.UpdateDesarquivamentoUseCase,
            use_cases_1.DeleteDesarquivamentoUseCase,
            use_cases_1.RestoreDesarquivamentoUseCase,
            use_cases_1.GenerateTermoEntregaUseCase,
            use_cases_1.GetDashboardStatsUseCase,
            use_cases_1.ImportDesarquivamentoUseCase,
            use_cases_1.ImportRegistrosUseCase,
            nugecid_import_service_1.NugecidImportService,
            nugecid_stats_service_1.NugecidStatsService,
            nugecid_pdf_service_1.NugecidPdfService,
            nugecid_export_service_1.NugecidExportService,
            nugecid_audit_service_1.NugecidAuditService,
            nugecid_service_1.NugecidService,
        ],
        exports: [
            use_cases_1.CreateDesarquivamentoUseCase,
            use_cases_1.FindAllDesarquivamentosUseCase,
            use_cases_1.FindDesarquivamentoByIdUseCase,
            use_cases_1.UpdateDesarquivamentoUseCase,
            use_cases_1.DeleteDesarquivamentoUseCase,
            use_cases_1.RestoreDesarquivamentoUseCase,
            use_cases_1.GenerateTermoEntregaUseCase,
            use_cases_1.GetDashboardStatsUseCase,
            use_cases_1.ImportDesarquivamentoUseCase,
            use_cases_1.ImportRegistrosUseCase,
            nugecid_import_service_1.NugecidImportService,
            nugecid_stats_service_1.NugecidStatsService,
            nugecid_pdf_service_1.NugecidPdfService,
            nugecid_audit_service_1.NugecidAuditService,
            nugecid_export_service_1.NugecidExportService,
            desarquivamento_repository_module_1.DesarquivamentoRepositoryModule,
            typeorm_1.TypeOrmModule,
            nugecid_service_1.NugecidService,
        ],
    })
], NugecidModule);
//# sourceMappingURL=nugecid.module.js.map