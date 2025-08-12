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
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SGC-ITEP v2.0</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 1rem;
            }
            .subtitle {
                text-align: center;
                color: #7f8c8d;
                margin-bottom: 2rem;
            }
            .status {
                display: inline-block;
                background: #27ae60;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                margin-bottom: 2rem;
            }
            .endpoints {
                display: grid;
                gap: 1rem;
                margin-top: 2rem;
            }
            .endpoint {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #3498db;
            }
            .endpoint a {
                color: #3498db;
                text-decoration: none;
                font-weight: 500;
            }
            .endpoint a:hover {
                text-decoration: underline;
            }
            .timestamp {
                text-align: center;
                color: #95a5a6;
                font-size: 0.9rem;
                margin-top: 2rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 SGC-ITEP v2.0</h1>
            <p class="subtitle">Sistema de Gestão de Conteúdo - ITEP/RN</p>
            
            <div style="text-align: center;">
                <span class="status">✅ Sistema Online</span>
            </div>
            
            <div class="endpoints">
                <div class="endpoint">
                    <span>📊 Dashboard</span>
                    <a href="/dashboard">Acessar Dashboard</a>
                </div>
                <div class="endpoint">
                    <span>📚 Documentação da API</span>
                    <a href="/api/docs">Swagger UI</a>
                </div>
                <div class="endpoint">
                    <span>🏥 Health Check</span>
                    <a href="/health">Status do Sistema</a>
                </div>
                <div class="endpoint">
                    <span>ℹ️ Sobre o Sistema</span>
                    <a href="/sobre">Informações</a>
                </div>
            </div>
            
            <div class="timestamp">
                Última atualização: ${new Date().toLocaleString('pt-BR')}
            </div>
        </div>
    </body>
    </html>
    `;
        return res.send(html);
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
            version: '2.0',
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
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Dados do dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dados do dashboard retornados com sucesso' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('sobre'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Informações sobre o sistema' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Informações sobre o sistema retornadas com sucesso' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getSobre", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check da aplicação' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Aplicação funcionando corretamente' }),
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