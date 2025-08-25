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
const multer_1 = require("multer");
const path_1 = require("path");
const XLSX = require("xlsx");
const use_cases_1 = require("./application/use-cases");
const create_desarquivamento_dto_1 = require("./dto/create-desarquivamento.dto");
const update_desarquivamento_dto_1 = require("./dto/update-desarquivamento.dto");
const query_desarquivamento_dto_1 = require("./dto/query-desarquivamento.dto");
const import_result_dto_1 = require("./dto/import-result.dto");
const desarquivamento_entity_1 = require("./entities/desarquivamento.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const role_type_enum_1 = require("../users/enums/role-type.enum");
let NugecidController = NugecidController_1 = class NugecidController {
    constructor(createDesarquivamentoUseCase, findAllDesarquivamentosUseCase, findDesarquivamentoByIdUseCase, updateDesarquivamentoUseCase, deleteDesarquivamentoUseCase, restoreDesarquivamentoUseCase, generateTermoEntregaUseCase, getDashboardStatsUseCase, importDesarquivamentoUseCase, importRegistrosUseCase) {
        this.createDesarquivamentoUseCase = createDesarquivamentoUseCase;
        this.findAllDesarquivamentosUseCase = findAllDesarquivamentosUseCase;
        this.findDesarquivamentoByIdUseCase = findDesarquivamentoByIdUseCase;
        this.updateDesarquivamentoUseCase = updateDesarquivamentoUseCase;
        this.deleteDesarquivamentoUseCase = deleteDesarquivamentoUseCase;
        this.restoreDesarquivamentoUseCase = restoreDesarquivamentoUseCase;
        this.generateTermoEntregaUseCase = generateTermoEntregaUseCase;
        this.getDashboardStatsUseCase = getDashboardStatsUseCase;
        this.importDesarquivamentoUseCase = importDesarquivamentoUseCase;
        this.importRegistrosUseCase = importRegistrosUseCase;
        this.logger = new common_1.Logger(NugecidController_1.name);
    }
    async create(createDesarquivamentoDto, currentUser, req, res) {
        const result = await this.createDesarquivamentoUseCase.execute({
            ...createDesarquivamentoDto,
            urgente: createDesarquivamentoDto.urgente || false,
            criadoPorId: currentUser.id,
        });
        this.logger.log(`Desarquivamento criado: ${result.id} por ${currentUser.usuario}`);
        if (req.headers.accept?.includes('application/json')) {
            return res.status(common_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Desarquivamento criado com sucesso',
                data: result,
            });
        }
        else {
            return res.redirect(`/nugecid/${result.id}?created=true`);
        }
    }
    async importDesarquivamentos(file, currentUser, res) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo é obrigatório');
        }
        const startTime = Date.now();
        const result = await this.importDesarquivamentoUseCase.execute(file.buffer, currentUser.id);
        const processingTime = Date.now() - startTime;
        const enhancedResult = {
            ...result,
            processingTime,
            fileName: file.originalname,
            fileSize: file.size,
            importedAt: new Date(),
            importedBy: currentUser.usuario,
        };
        this.logger.log(`Importação de desarquivamentos concluída por ${currentUser.usuario}: ${result.successCount}/${result.totalRows} registros em ${processingTime}ms`);
        return res.status(common_1.HttpStatus.OK).json({
            success: true,
            message: `Importação concluída: ${result.successCount} de ${result.totalRows} registros importados com sucesso.`,
            data: enhancedResult,
        });
    }
    async importRegistros(file, currentUser) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo enviado. Por favor, anexe um arquivo .xlsx ou .csv.');
        }
        try {
            const result = await this.importRegistrosUseCase.execute({
                file,
                userId: currentUser.id,
            });
            this.logger.log(`Importação de registros concluída: ${result.successCount}/${result.totalRows} registros importados por ${currentUser.usuario}`);
            return {
                success: true,
                message: result.summary.message,
                data: {
                    totalRows: result.totalRows,
                    successCount: result.successCount,
                    errorCount: result.errorCount,
                    errors: result.errors,
                    summary: result.summary,
                },
            };
        }
        catch (error) {
            this.logger.error('Erro durante importação de registros:', error);
            throw new common_1.BadRequestException(error.message || 'Erro ao processar arquivo de importação');
        }
    }
    async getTermoDeEntrega(id, res, currentUser) {
        try {
            const result = await this.generateTermoEntregaUseCase.execute({
                id: +id,
                userId: currentUser.id,
                userRoles: [currentUser.role?.name || 'USER'],
            });
            this.logger.debug(`[PDF Generation] Termo gerado para desarquivamento ${id}`);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
            res.setHeader('Content-Length', result.pdfBuffer.length);
            res.send(result.pdfBuffer);
        }
        catch (error) {
            this.logger.error(`Falha ao gerar PDF para o desarquivamento ${id}:`, error);
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(error.message);
            }
            if (error instanceof common_1.ForbiddenException) {
                throw new common_1.ForbiddenException(error.message);
            }
            throw new common_1.InternalServerErrorException('Ocorreu um erro ao gerar o termo em PDF.');
        }
    }
    async findAll(queryDto, currentUser, req, res) {
        const result = await this.findAllDesarquivamentosUseCase.execute({
            ...queryDto,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        if (req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                data: result,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            });
        }
        else {
            return res.render('nugecid/list', {
                title: 'Desarquivamentos - NUGECID',
                desarquivamentos: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
                filters: queryDto,
                user: currentUser,
            });
        }
    }
    async getDashboard(currentUser, req, res) {
        const stats = await this.getDashboardStatsUseCase.execute({
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        return res.json({
            success: true,
            data: stats,
        });
    }
    async exportToExcel(queryDto, currentUser, res) {
        const result = await this.findAllDesarquivamentosUseCase.execute({
            ...queryDto,
            limit: 10000,
            page: 1,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        const workbook = XLSX.utils.book_new();
        const worksheetData = result.data.map(item => ({
            ID: item.id,
            'Código de Barras': item.codigoBarras,
            Tipo: item.tipoSolicitacao,
            Status: item.status,
            'Nome Requerente': item.nomeSolicitante,
            'Nome Vítima': item.nomeVitima || '',
            'Número Registro': item.numeroRegistro,
            'Tipo Documento': item.tipoDocumento || '',
            'Data Fato': item.dataFato
                ? item.dataFato.toISOString().split('T')[0]
                : '',
            Finalidade: item.finalidade || '',
            Urgente: item.urgente ? 'Sim' : 'Não',
            'Localização Física': item.localizacaoFisica || '',
            'Prazo Atendimento': item.prazoAtendimento
                ? item.prazoAtendimento.toISOString()
                : '',
            'Data Atendimento': item.dataAtendimento
                ? item.dataAtendimento.toISOString()
                : '',
            Resultado: item.resultadoAtendimento || '',
            'Criado Por ID': item.criadoPorId || '',
            'Responsável ID': item.responsavelId || '',
            'Criado em': item.createdAt.toISOString(),
            Observações: item.observacoes || '',
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Desarquivamentos');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const fileName = `desarquivamentos_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length);
        this.logger.log(`Exportação realizada por ${currentUser.usuario}: ${result.total} registros`);
        return res.send(buffer);
    }
    async findOne(id, currentUser, req, res) {
        try {
            const result = await this.findDesarquivamentoByIdUseCase.execute({
                id,
                userId: currentUser.id,
                userRoles: [currentUser.role?.name || 'USER'],
            });
            if (req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    data: result,
                });
            }
            else {
                return res.render('nugecid/detail', {
                    title: `Desarquivamento ${result.codigoBarras}`,
                    desarquivamento: result,
                    user: currentUser,
                });
            }
        }
        catch (error) {
            if (error.message.includes('não encontrado')) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(common_1.HttpStatus.NOT_FOUND).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    return res.redirect('/nugecid?error=not-found');
                }
            }
            if (error.message.includes('permissão')) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(common_1.HttpStatus.FORBIDDEN).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    return res.redirect('/nugecid?error=forbidden');
                }
            }
            throw error;
        }
    }
    async findByBarcode(codigo, currentUser, req, res) {
        try {
            const result = await this.findAllDesarquivamentosUseCase.execute({
                filters: { codigoBarras: codigo },
                limit: 1,
                page: 1,
                userId: currentUser.id,
                userRoles: [currentUser.role?.name || 'USER'],
            });
            if (result.data.length === 0) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(common_1.HttpStatus.NOT_FOUND).json({
                        success: false,
                        message: 'Desarquivamento não encontrado',
                    });
                }
                else {
                    return res.redirect('/nugecid?error=not-found');
                }
            }
            const desarquivamento = result.data[0];
            if (req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    data: desarquivamento,
                });
            }
            else {
                return res.redirect(`/nugecid/${desarquivamento.id}`);
            }
        }
        catch (error) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Erro interno do servidor',
                });
            }
            else {
                return res.redirect('/nugecid?error=server-error');
            }
        }
    }
    async update(id, updateDesarquivamentoDto, currentUser, req, res) {
        const result = await this.updateDesarquivamentoUseCase.execute({
            id,
            ...updateDesarquivamentoDto,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
        });
        this.logger.log(`Desarquivamento atualizado: ${result.id} por ${currentUser.usuario}`);
        if (req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                message: 'Desarquivamento atualizado com sucesso',
                data: result,
            });
        }
        else {
            return res.redirect(`/nugecid/${result.id}?updated=true`);
        }
    }
    async remove(id, currentUser, req, res) {
        await this.deleteDesarquivamentoUseCase.execute({
            id,
            userId: currentUser.id,
            userRoles: [currentUser.role?.name || 'USER'],
            permanent: false,
        });
        this.logger.log(`Desarquivamento removido: ${id} por ${currentUser.usuario}`);
        if (req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                message: 'Desarquivamento removido com sucesso',
            });
        }
        else {
            return res.redirect('/nugecid?deleted=true');
        }
    }
    async restore(id, currentUser, req, res) {
        try {
            const result = await this.restoreDesarquivamentoUseCase.execute({
                id,
                userId: currentUser.id,
                userRoles: [currentUser.role?.name || 'USER'],
            });
            this.logger.log(`Desarquivamento restaurado: ${id} por ${currentUser.usuario}`);
            if (req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    message: result.message,
                });
            }
            else {
                return res.redirect('/nugecid/excluidos?restored=true');
            }
        }
        catch (error) {
            if (error.message.includes('não encontrado')) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(common_1.HttpStatus.NOT_FOUND).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    return res.redirect('/nugecid/excluidos?error=not-found');
                }
            }
            if (error.message.includes('permissão') ||
                error.message.includes('Acesso negado')) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(common_1.HttpStatus.FORBIDDEN).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    return res.redirect('/nugecid/excluidos?error=forbidden');
                }
            }
            if (error.message.includes('não está excluído')) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    return res.redirect('/nugecid/excluidos?error=not-deleted');
                }
            }
            throw error;
        }
    }
};
exports.NugecidController = NugecidController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova solicitação de desarquivamento' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Desarquivamento criado com sucesso',
        type: desarquivamento_entity_1.Desarquivamento,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
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
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Resultado da importação',
        type: import_result_dto_1.ImportResultDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Arquivo inválido' }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.GESTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `file-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv',
            ];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Apenas arquivos Excel (.xlsx, .xls) ou .csv são permitidos'), false);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
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
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Importação concluída' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Arquivo inválido ou dados incorretos',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
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
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID do desarquivamento',
        type: 'number',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF do termo gerado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Desarquivamento não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erro ao gerar o PDF' }),
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
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.GESTOR, role_type_enum_1.RoleType.NUGECID_OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Listar desarquivamentos com filtros e paginação' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de desarquivamentos',
    }),
    (0, swagger_1.ApiQuery)({ type: query_desarquivamento_dto_1.QueryDesarquivamentoDto }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_desarquivamento_dto_1.QueryDesarquivamentoDto,
        user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas do dashboard' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estatísticas do dashboard',
    }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.GESTOR),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar desarquivamentos para Excel' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Arquivo Excel gerado',
        content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                schema: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiQuery)({ type: query_desarquivamento_dto_1.QueryDesarquivamentoDto }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.GESTOR),
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
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID do desarquivamento',
        type: 'integer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Desarquivamento encontrado',
        type: desarquivamento_entity_1.Desarquivamento,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Desarquivamento não encontrado' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('barcode/:codigo'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter desarquivamento por código de barras' }),
    (0, swagger_1.ApiParam)({
        name: 'codigo',
        description: 'Código de barras do desarquivamento',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Desarquivamento encontrado',
        type: desarquivamento_entity_1.Desarquivamento,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Desarquivamento não encontrado' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('codigo')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar desarquivamento' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID do desarquivamento',
        type: 'integer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Desarquivamento atualizado com sucesso',
        type: desarquivamento_entity_1.Desarquivamento,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Desarquivamento não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sem permissão para editar' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_desarquivamento_dto_1.UpdateDesarquivamentoDto,
        user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover desarquivamento' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID do desarquivamento',
        type: 'integer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Desarquivamento removido com sucesso',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Desarquivamento não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sem permissão para remover' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], NugecidController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restaurar desarquivamento excluído' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID do desarquivamento',
        type: 'integer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Desarquivamento restaurado com sucesso',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Desarquivamento não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sem permissão para restaurar' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Desarquivamento não está excluído',
    }),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.NUGECID_OPERATOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User, Object, Object]),
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
        use_cases_1.GenerateTermoEntregaUseCase,
        use_cases_1.GetDashboardStatsUseCase,
        use_cases_1.ImportDesarquivamentoUseCase,
        use_cases_1.ImportRegistrosUseCase])
], NugecidController);
//# sourceMappingURL=nugecid.controller.js.map