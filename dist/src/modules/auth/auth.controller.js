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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const session_auth_guard_1 = require("./guards/session-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const is_public_decorator_1 = require("../../common/decorators/is-public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    loginPage(req) {
        if (req.user) {
            return { redirect: '/' };
        }
        return {
            title: 'Login - SGC ITEP',
            error: req.query.error || null,
            message: req.query.message || null,
        };
    }
    async login(loginDto, req, res, ipAddress, userAgent) {
        try {
            const result = await this.authService.login(loginDto, ipAddress, userAgent || 'Unknown');
            res.cookie('access_token', result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600000,
            });
            req.session.user = result.user;
            if (req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    data: result,
                });
            }
            return res.redirect('/');
        }
        catch (error) {
            this.logger.error(`Erro no login: ${error.message}`);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ message: error.message });
            }
            return res.redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
        }
    }
    async register(registerDto, currentUser) {
        return this.authService.register(registerDto, currentUser);
    }
    async logout(req, res, ipAddress, userAgent) {
        try {
            if (req.session.user) {
                await this.authService.logout(req.session.user.id, ipAddress, userAgent || 'Unknown');
            }
            req.session.destroy(err => {
                if (err) {
                    this.logger.error(`Erro ao destruir sessão: ${err.message}`);
                }
            });
            if (req.headers.accept?.includes('application/json')) {
                return res.json({ message: 'Logout realizado com sucesso' });
            }
            return res.redirect('/auth/login?message=Logout realizado com sucesso');
        }
        catch (error) {
            this.logger.error(`Erro no logout: ${error.message}`);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(500).json({ message: 'Erro interno do servidor' });
            }
            return res.redirect('/auth/login?error=Erro ao realizar logout');
        }
    }
    async getProfile(currentUser) {
        try {
            this.logger.debug(`[AuthController] Endpoint /auth/profile chamado`);
            this.logger.debug(`[AuthController] CurrentUser recebido: ${JSON.stringify(currentUser ? { id: currentUser.id, usuario: currentUser.usuario } : 'null')}`);
            if (!currentUser) {
                this.logger.error(`[AuthController] CurrentUser é null/undefined no endpoint /auth/profile`);
                throw new common_1.UnauthorizedException('Usuário não encontrado no contexto da requisição');
            }
            if (!currentUser.id) {
                this.logger.error(`[AuthController] CurrentUser não possui ID: ${JSON.stringify(currentUser)}`);
                throw new common_1.UnauthorizedException('ID do usuário não encontrado');
            }
            this.logger.debug(`[AuthController] Buscando dados completos do usuário ID: ${currentUser.id}`);
            const user = await this.authService.findUserById(currentUser.id);
            this.logger.debug(`[AuthController] Usuário encontrado: ${JSON.stringify({ id: user.id, usuario: user.usuario, role: user.role?.name })}`);
            const response = {
                id: user.id,
                nome: user.nome,
                usuario: user.usuario,
                role: user.role
                    ? {
                        id: user.role.id,
                        name: user.role.name,
                        description: user.role.description,
                        permissions: user.role.permissions,
                    }
                    : null,
                ultimoLogin: user.ultimoLogin,
                criadoEm: user.createdAt,
            };
            this.logger.debug(`[AuthController] Retornando perfil do usuário: ${user.usuario}`);
            return response;
        }
        catch (error) {
            this.logger.error(`[AuthController] Erro no endpoint /auth/profile: ${error.message}`, error.stack);
            throw error;
        }
    }
    async checkAuth(user) {
        return {
            authenticated: true,
            user: {
                id: user.id,
                nome: user.nome,
                usuario: user.usuario,
                role: user.role?.name,
            },
        };
    }
    async loginV2(loginDto, ipAddress, userAgent) {
        try {
            const result = await this.authService.loginV2(loginDto, ipAddress, userAgent || 'Unknown');
            this.logger.log(`Login API v2 bem-sucedido para usuário: ${loginDto.usuario}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erro no login API v2: ${error.message}`);
            throw error;
        }
    }
    async refreshToken(body) {
        try {
            const result = await this.authService.refreshToken(body.refreshToken);
            this.logger.log('Token renovado com sucesso');
            return result;
        }
        catch (error) {
            this.logger.error(`Erro ao renovar token: ${error.message}`);
            throw error;
        }
    }
    async getOnlineUsers() {
        try {
            const onlineUsers = await this.authService.getOnlineUsers();
            this.logger.debug(`Usuários online: ${onlineUsers.length}`);
            return onlineUsers;
        }
        catch (error) {
            this.logger.error(`Erro ao obter usuários online: ${error.message}`);
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('login'),
    (0, is_public_decorator_1.IsPublic)(),
    (0, swagger_1.ApiOperation)({ summary: 'Renderiza página de login' }),
    (0, common_1.Render)('login'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginPage", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, is_public_decorator_1.IsPublic)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Realiza login do usuário' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        nome: { type: 'string' },
                        usuario: { type: 'string' },
                        role: { type: 'object' },
                    },
                },
                accessToken: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __param(3, (0, common_1.Ip)()),
    __param(4, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Registra novo usuário (apenas admins)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuário criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Realiza logout do usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout realizado com sucesso' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Ip)()),
    __param(3, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém perfil do usuário logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil do usuário' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('check'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Verifica se usuário está autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuário autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAuth", null);
__decorate([
    (0, common_1.Post)('/api/v2/auth/login'),
    (0, is_public_decorator_1.IsPublic)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Login API v2 - Retorna JWT com expiração de 50 minutos',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        userId: { type: 'number' },
                        usuario: { type: 'string' },
                        role: { type: 'string' },
                    },
                },
                accessToken: { type: 'string' },
                expiresIn: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginV2", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, is_public_decorator_1.IsPublic)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Renovar token JWT usando refresh token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token renovado com sucesso',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' },
                expiresIn: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Refresh token inválido ou expirado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('online-users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém lista de usuários online' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuários online',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    nome: { type: 'string' },
                    usuario: { type: 'string' },
                    role: { type: 'string' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autorizado' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getOnlineUsers", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Autenticação'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map