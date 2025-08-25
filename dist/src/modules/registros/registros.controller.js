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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const role_type_enum_1 = require("../users/enums/role-type.enum");
const registros_service_1 = require("./registros.service");
let RegistrosController = class RegistrosController {
    constructor(registrosService) {
        this.registrosService = registrosService;
    }
    async importRegistros(file) {
        try {
            const result = await this.registrosService.importFromXlsx(file);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(`Falha ao processar o arquivo: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.RegistrosController = RegistrosController;
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Importa registros de uma planilha XLSX.' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Arquivo XLSX contendo os registros a serem importados.',
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
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Relatório da importação.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Arquivo inválido ou erro de validação.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado.' }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
            new common_1.FileTypeValidator({
                fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RegistrosController.prototype, "importRegistros", null);
exports.RegistrosController = RegistrosController = __decorate([
    (0, swagger_1.ApiTags)('Registros'),
    (0, common_1.Controller)('registros'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [registros_service_1.RegistrosService])
], RegistrosController);
//# sourceMappingURL=registros.controller.js.map