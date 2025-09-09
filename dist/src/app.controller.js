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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_service_1 = require("./app.service");
const session_auth_guard_1 = require("./modules/auth/guards/session-auth.guard");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getRoot(res) {
        return res.redirect('http://localhost:3001');
    }
    async getDashboard(req) {
        const user = req.user;
        const dashboardData = await this.appService.getDashboardData(user);
        return {
            title: 'Dashboard - SGC-ITEP',
            user,
            ...dashboardData,
        };
    }
    getSobre(req) {
        return {
            title: 'Sobre - SGC-ITEP',
            version: '1.0',
            description: 'Sistema de Gestão de Conteúdo do ITEP',
            user: req.user,
        };
    }
    getHealth() {
        return this.appService.getHealth();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Rota raiz da API' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Informações da API retornadas com sucesso',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Dados do dashboard' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dados do dashboard retornados com sucesso',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('sobre'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Informações sobre o sistema' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Informações sobre o sistema retornadas com sucesso',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getSobre", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check da aplicação' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Aplicação funcionando corretamente',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('app'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map