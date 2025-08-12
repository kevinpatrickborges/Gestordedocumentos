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
const config_1 = require("@nestjs/config");
const multer_1 = require("multer");
const path_1 = require("path");
const nugecid_controller_1 = require("./nugecid.controller");
const use_cases_1 = require("./application/use-cases");
const desarquivamento_repository_module_1 = require("./infrastructure/desarquivamento-repository.module");
const desarquivamento_entity_1 = require("./entities/desarquivamento.entity");
const user_entity_1 = require("../users/entities/user.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
const nugecid_service_1 = require("./nugecid.service");
let NugecidModule = class NugecidModule {
};
exports.NugecidModule = NugecidModule;
exports.NugecidModule = NugecidModule = __decorate([
    (0, common_1.Module)({
        imports: [
            desarquivamento_repository_module_1.DesarquivamentoRepositoryModule,
            typeorm_1.TypeOrmModule.forFeature([
                desarquivamento_entity_1.Desarquivamento,
                user_entity_1.User,
                auditoria_entity_1.Auditoria,
            ]),
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    storage: (0, multer_1.diskStorage)({
                        destination: (req, file, cb) => {
                            const uploadPath = configService.get('UPLOAD_PATH', './uploads');
                            cb(null, uploadPath);
                        },
                        filename: (req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                            cb(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
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
                        }
                        else {
                            cb(new Error('Apenas arquivos .xls, .xlsx e .csv são permitidos.'), false);
                        }
                    },
                    limits: {
                        fileSize: 10 * 1024 * 1024,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [nugecid_controller_1.NugecidController],
        providers: [
            use_cases_1.CreateDesarquivamentoUseCase,
            use_cases_1.FindAllDesarquivamentosUseCase,
            use_cases_1.FindDesarquivamentoByIdUseCase,
            use_cases_1.UpdateDesarquivamentoUseCase,
            use_cases_1.DeleteDesarquivamentoUseCase,
            use_cases_1.GenerateTermoEntregaUseCase,
            use_cases_1.GetDashboardStatsUseCase,
            use_cases_1.ImportDesarquivamentoUseCase,
            use_cases_1.ImportRegistrosUseCase,
            nugecid_service_1.NugecidService,
        ],
        exports: [
            use_cases_1.CreateDesarquivamentoUseCase,
            use_cases_1.FindAllDesarquivamentosUseCase,
            use_cases_1.FindDesarquivamentoByIdUseCase,
            use_cases_1.UpdateDesarquivamentoUseCase,
            use_cases_1.DeleteDesarquivamentoUseCase,
            use_cases_1.GenerateTermoEntregaUseCase,
            use_cases_1.GetDashboardStatsUseCase,
            use_cases_1.ImportDesarquivamentoUseCase,
            use_cases_1.ImportRegistrosUseCase,
            desarquivamento_repository_module_1.DesarquivamentoRepositoryModule,
            typeorm_1.TypeOrmModule,
            nugecid_service_1.NugecidService,
        ],
    })
], NugecidModule);
//# sourceMappingURL=nugecid.module.js.map