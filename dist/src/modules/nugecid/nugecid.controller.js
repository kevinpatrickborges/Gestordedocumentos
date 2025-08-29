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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NugecidController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NugecidController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const use_cases_1 = require("./application/use-cases");
const create_desarquivamento_dto_1 = require("./dto/create-desarquivamento.dto");
const update_desarquivamento_dto_1 = require("./dto/update-desarquivamento.dto");
const query_desarquivamento_dto_1 = require("./dto/query-desarquivamento.dto");
const nugecid_import_service_1 = require("./nugecid-import.service");
const nugecid_stats_service_1 = require("./nugecid-stats.service");
const nugecid_pdf_service_1 = require("./nugecid-pdf.service");
const nugecid_export_service_1 = require("./nugecid-export.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const role_type_enum_1 = require("../users/enums/role-type.enum");
let NugecidController = NugecidController_1 = class NugecidController {
    constructor(createDesarquivamentoUseCase, findAllDesarquivamentosUseCase, findDesarquivamentoByIdUseCase, updateDesarquivamentoUseCase, deleteDesarquivamentoUseCase, restoreDesarquivamentoUseCase, nugecidImportService, nugecidStatsService, nugecidPdfService, nugecidExportService) {
        this.createDesarquivamentoUseCase = createDesarquivamentoUseCase;
        this.findAllDesarquivamentosUseCase = findAllDesarquivamentosUseCase;
        this.findDesarquivamentoByIdUseCase = findDesarquivamentoByIdUseCase;
        this.updateDesarquivamentoUseCase = updateDesarquivamentoUseCase;
        this.deleteDesarquivamentoUseCase = deleteDesarquivamentoUseCase;
        this.restoreDesarquivamentoUseCase = restoreDesarquivamentoUseCase;
        this.nugecidImportService = nugecidImportService;
        this.nugecidStatsService = nugecidStatsService;
        this.nugecidPdfService = nugecidPdfService;
        this.nugecidExportService = nugecidExportService;
        this.logger = new common_1.Logger(NugecidController_1.name);
    }
    async create(createDesarquivamentoDto, currentUser, req, res) {
        const result = await this.createDesarquivamentoUseCase.execute({
            ...createDesarquivamentoDto,
            criadoPorId: currentUser.id,
        });
        return res.status(common_1.HttpStatus.CREATED).json({
            success: true,
            message: 'Desarquivamento criado com sucesso',
            data: result,
        });
    }
    async importDesarquivamentos(file, currentUser, res) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo é obrigatório');
        }
        const result = await this.nugecidImportService.importFromXLSX(file, currentUser);
        return res.status(common_1.HttpStatus.OK).json({
            success: true,
            message: `Importação concluída: ${result.successCount} de ${result.totalRows} registros importados com sucesso.`,
            data: result,
        });
    }
    async importRegistros(file, currentUser) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo enviado. Por favor, anexe um arquivo .xlsx ou .csv.');
        }
        const result = await this.nugecidImportService.importRegistrosFromXLSX(file, currentUser);
        return {
            success: true,
            message: `Importação concluída: ${result.successCount} de ${result.totalRows} registros importados com sucesso.`,
            data: result,
        };
    }
    async getTermoDeEntrega(id, res, currentUser) {
        const desarquivamento = await this.findDesarquivamentoByIdUseCase.execute({ id, userId: currentUser.id, userRoles: [currentUser.role?.name || 'USER'] });
        const buffer = await this.nugecidPdfService.generatePdf(desarquivamento);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=termo_de_entrega_${id}.pdf`);
        res.send(buffer);
    }
    async findAll(queryDto, currentUser) {
        const result = await this.findAllDesarquivamentosUseCase.execute({
            ...queryDto,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        return {
            success: true,
            data: result.data,
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
    async getDashboard() {
        const stats = await this.nugecidStatsService.getDashboardStats();
        return {
            success: true,
            data: stats,
        };
    }
    async exportToExcel(queryDto, currentUser, res) {
        const buffer = await this.nugecidExportService.exportToExcel(queryDto, currentUser);
        const fileName = `desarquivamentos_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    }
    async findOne(id, currentUser) {
        const result = await this.findDesarquivamentoByIdUseCase.execute({
            id,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        return {
            success: true,
            data: result,
        };
    }
    async findByBarcode(codigo, currentUser) {
        const result = await this.findAllDesarquivamentosUseCase.execute({
            filters: { codigoBarras: codigo },
            limit: 1,
            page: 1,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        if (result.data.length === 0) {
            throw new common_1.NotFoundException('Desarquivamento não encontrado');
        }
        return {
            success: true,
            data: result.data[0],
        };
    }
    async update(id, updateDesarquivamentoDto, currentUser) {
        const result = await this.updateDesarquivamentoUseCase.execute({
            id,
            ...updateDesarquivamentoDto,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        return {
            success: true,
            message: 'Desarquivamento atualizado com sucesso',
            data: result,
        };
    }
    async remove(id, currentUser) {
        await this.deleteDesarquivamentoUseCase.execute({
            id,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
            permanent: false,
        });
        return {
            success: true,
            message: 'Desarquivamento removido com sucesso',
        };
    }
    async restore(id, currentUser) {
        const result = await this.restoreDesarquivamentoUseCase.execute({
            id,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        return {
            success: true,
            message: result.message,
        };
    }
};
exports.NugecidController = NugecidController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova solicitação de desarquivamento' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Desarquivamento criado com sucesso' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_desarquivamento_dto_1.CreateDesarquivamentoDto,
        user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import-desarquivamentos'),
    (0, swagger_1.ApiOperation)({ summary: 'Importar desarquivamentos de planilha Excel' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Arquivo Excel com desarquivamentos',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "importDesarquivamentos", null);
__decorate([
    (0, common_1.Post)('import-registros'),
    (0, swagger_1.ApiOperation)({ summary: 'Importar registros de um arquivo .xlsx ou .csv' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Arquivo (.xlsx ou .csv) contendo os registros para importação',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "importRegistros", null);
__decorate([
    (0, common_1.Get)(':id/termo'),
    (0, swagger_1.ApiOperation)({ summary: 'Gerar termo de entrega de desarquivamento em PDF' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do desarquivamento', type: 'number' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename=termo_de_entrega.pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "getTermoDeEntrega", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.USUARIO),
    (0, swagger_1.ApiOperation)({ summary: 'Listar desarquivamentos com filtros e paginação' }),
    (0, swagger_1.ApiQuery)({ type: query_desarquivamento_dto_1.QueryDesarquivamentoDto }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_desarquivamento_dto_1.QueryDesarquivamentoDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas do dashboard' }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.USUARIO),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar desarquivamentos para Excel' }),
    (0, swagger_1.ApiQuery)({ type: query_desarquivamento_dto_1.QueryDesarquivamentoDto }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_desarquivamento_dto_1.QueryDesarquivamentoDto,
        user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "exportToExcel", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter desarquivamento por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do desarquivamento', type: 'integer' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('barcode/:codigo'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter desarquivamento por código de barras' }),
    (0, swagger_1.ApiParam)({ name: 'codigo', description: 'Código de barras do desarquivamento' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('codigo')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar desarquivamento' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do desarquivamento', type: 'integer' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_desarquivamento_dto_1.UpdateDesarquivamentoDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remover desarquivamento' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do desarquivamento', type: 'integer' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restaurar desarquivamento excluído' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do desarquivamento', type: 'integer' }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "restore", null);
exports.NugecidController = NugecidController = NugecidController_1 = __decorate([
    (0, swagger_1.ApiTags)('NUGECID - Desarquivamentos'),
    (0, common_1.Controller)('nugecid'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [use_cases_1.CreateDesarquivamentoUseCase,
        use_cases_1.FindAllDesarquivamentosUseCase,
        use_cases_1.FindDesarquivamentoByIdUseCase,
        use_cases_1.UpdateDesarquivamentoUseCase,
        use_cases_1.DeleteDesarquivamentoUseCase,
        use_cases_1.RestoreDesarquivamentoUseCase,
        nugecid_import_service_1.NugecidImportService,
        nugecid_stats_service_1.NugecidStatsService,
        nugecid_pdf_service_1.NugecidPdfService,
        nugecid_export_service_1.NugecidExportService])
], NugecidController);
//# sourceMappingURL=nugecid.controller.js.map