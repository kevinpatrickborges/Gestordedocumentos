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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstatisticasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_type_enum_1 = require("../users/enums/role-type.enum");
const estatisticas_service_1 = require("./estatisticas.service");
let EstatisticasController = class EstatisticasController {
    constructor(estatisticasService) {
        this.estatisticasService = estatisticasService;
    }
    async getCardData() {
        const data = await this.estatisticasService.getCardData();
        return { success: true, data };
    }
    async getAtendimentosPorMes() {
        const data = await this.estatisticasService.getAtendimentosPorMes();
        return { success: true, data };
    }
    async getStatusDistribuicao() {
        const data = await this.estatisticasService.getStatusDistribuicao();
        return { success: true, data };
    }
};
exports.EstatisticasController = EstatisticasController;
__decorate([
    (0, common_1.Get)('cards'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém dados para os cards de estatísticas' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dados dos cards retornados com sucesso.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EstatisticasController.prototype, "getCardData", null);
__decorate([
    (0, common_1.Get)('atendimentos-por-mes'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtém o número de atendimentos por mês no último ano',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dados do gráfico de barras retornados com sucesso.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EstatisticasController.prototype, "getAtendimentosPorMes", null);
__decorate([
    (0, common_1.Get)('status-distribuicao'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém a distribuição de atendimentos por status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dados do gráfico de pizza retornados com sucesso.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EstatisticasController.prototype, "getStatusDistribuicao", null);
exports.EstatisticasController = EstatisticasController = __decorate([
    (0, swagger_1.ApiTags)('Estatísticas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_type_enum_1.RoleType.ADMIN, role_type_enum_1.RoleType.USUARIO),
    (0, common_1.Controller)('estatisticas'),
    __metadata("design:paramtypes", [estatisticas_service_1.EstatisticasService])
], EstatisticasController);
//# sourceMappingURL=estatisticas.controller.js.map