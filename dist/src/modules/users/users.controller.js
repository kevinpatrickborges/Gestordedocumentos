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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const use_cases_1 = require("./application/use-cases");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("./entities/user.entity");
const user_mapper_1 = require("./infrastructure/mappers/user.mapper");
const role_mapper_1 = require("./infrastructure/mappers/role.mapper");
let UsersController = class UsersController {
    constructor(createUserUseCase, updateUserUseCase, deleteUserUseCase, getUserByIdUseCase, getUsersUseCase, restoreUserUseCase, getUserStatisticsUseCase, getRolesUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
        this.getUserByIdUseCase = getUserByIdUseCase;
        this.getUsersUseCase = getUsersUseCase;
        this.restoreUserUseCase = restoreUserUseCase;
        this.getUserStatisticsUseCase = getUserStatisticsUseCase;
        this.getRolesUseCase = getRolesUseCase;
    }
    async findAll(query) {
        const result = await this.getUsersUseCase.execute(query);
        if (Array.isArray(result.users)) {
            const pag = result;
            const items = pag.users.map((u) => user_mapper_1.UserMapper.toEntity(u));
            return {
                success: true,
                data: items,
                meta: {
                    total: pag.total || items.length,
                    page: pag.page || (query.page || 1),
                    limit: pag.limit || (query.limit || items.length),
                    totalPages: pag.totalPages || 1,
                    hasNext: (pag.page || 1) < (pag.totalPages || 1),
                    hasPrev: (pag.page || 1) > 1,
                },
            };
        }
        const users = result;
        return {
            success: true,
            data: users.map(user => user_mapper_1.UserMapper.toEntity(user)),
            meta: {
                total: users.length,
                page: 1,
                limit: users.length,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            },
        };
    }
    async findAllApi(query) {
        const result = await this.getUsersUseCase.execute(query);
        if (Array.isArray(result.users)) {
            const pag = result;
            const items = pag.users.map((u) => user_mapper_1.UserMapper.toEntity(u));
            return {
                success: true,
                data: items,
                meta: {
                    total: pag.total || items.length,
                    page: pag.page || (query.page || 1),
                    limit: pag.limit || (query.limit || items.length),
                    totalPages: pag.totalPages || 1,
                    hasNext: (pag.page || 1) < (pag.totalPages || 1),
                    hasPrev: (pag.page || 1) > 1,
                },
            };
        }
        const users = result;
        return {
            success: true,
            data: users.map(user => user_mapper_1.UserMapper.toEntity(user)),
            meta: {
                total: users.length,
                page: 1,
                limit: users.length,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            },
        };
    }
    async createPage() {
        const roles = await this.getRolesUseCase.execute();
        return {
            title: 'Novo Usuário - SGC ITEP',
            roles: roles.map(role => role_mapper_1.RoleMapper.toEntity(role)),
        };
    }
    async create(createUserDto, currentUser, req, res) {
        try {
            const user = await this.createUserUseCase.execute(createUserDto);
            const userEntity = user_mapper_1.UserMapper.toEntity(user);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(201).json(userEntity);
            }
            return res.redirect('/users?message=Usuário criado com sucesso');
        }
        catch (error) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ message: error.message });
            }
            return res.redirect(`/users/novo?error=${encodeURIComponent(error.message)}`);
        }
    }
    async getStats() {
        return this.getUserStatisticsUseCase.execute();
    }
    async findAllRoles() {
        const roles = await this.getRolesUseCase.execute();
        return roles.map(role => role_mapper_1.RoleMapper.toEntity(role));
    }
    async findOne(id, req) {
        const user = await this.getUserByIdUseCase.execute(id);
        const userEntity = user_mapper_1.UserMapper.toEntity(user);
        if (req.headers.accept?.includes('application/json')) {
            return userEntity;
        }
        return {
            title: `${userEntity.nome} - SGC ITEP`,
            user: userEntity,
        };
    }
    async detailPage(id) {
        const user = await this.getUserByIdUseCase.execute(id);
        const userEntity = user_mapper_1.UserMapper.toEntity(user);
        return {
            title: `${userEntity.nome} - SGC ITEP`,
            user: userEntity,
        };
    }
    async editPage(id) {
        const user = await this.getUserByIdUseCase.execute(id);
        const roles = await this.getRolesUseCase.execute();
        const userEntity = user_mapper_1.UserMapper.toEntity(user);
        return {
            title: `Editar ${userEntity.nome} - SGC ITEP`,
            user: userEntity,
            roles: roles.map(role => role_mapper_1.RoleMapper.toEntity(role)),
        };
    }
    async update(id, updateUserDto, currentUser, req, res) {
        try {
            const user = await this.updateUserUseCase.execute(id, updateUserDto);
            const userEntity = user_mapper_1.UserMapper.toEntity(user);
            if (req.headers.accept?.includes('application/json')) {
                return res.json(userEntity);
            }
            return res.redirect(`/users/${id}?message=Usuário atualizado com sucesso`);
        }
        catch (error) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ message: error.message });
            }
            return res.redirect(`/users/${id}/editar?error=${encodeURIComponent(error.message)}`);
        }
    }
    async remove(id, currentUser, req, res) {
        try {
            await this.deleteUserUseCase.execute(id);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(204).send();
            }
            return res.redirect('/users?message=Usuário removido com sucesso');
        }
        catch (error) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ message: error.message });
            }
            return res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
        }
    }
    async reactivate(id, currentUser, req, res) {
        try {
            const user = await this.restoreUserUseCase.execute(id);
            const userEntity = user_mapper_1.UserMapper.toEntity(user);
            if (req.headers.accept?.includes('application/json')) {
                return res.json(userEntity);
            }
            return res.redirect(`/users/${id}?message=Usuário reativado com sucesso`);
        }
        catch (error) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ message: error.message });
            }
            return res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
        }
    }
    async profilePage(currentUser) {
        const user = await this.getUserByIdUseCase.execute(currentUser.id);
        const userEntity = user_mapper_1.UserMapper.toEntity(user);
        return {
            title: 'Meu Perfil - SGC ITEP',
            user: userEntity,
            isOwnProfile: true,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Header)('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todos os usuários' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'ativo', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuários retornada com sucesso.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('api'),
    (0, roles_decorator_1.Roles)('admin', 'coordenador'),
    (0, common_1.Header)('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista usuários com paginação e filtros' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'roleId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'ativo', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['nome', 'usuario', 'criadoEm', 'ultimoLogin'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usuários' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllApi", null);
__decorate([
    (0, common_1.Get)('novo'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Render)('usuarios/novo'),
    (0, swagger_1.ApiOperation)({ summary: 'Renderiza página de criação de usuário' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createPage", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Cria novo usuário' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuário criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém estatísticas dos usuários' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas dos usuários' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todas as roles disponíveis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de roles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllRoles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca usuário por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dados do usuário' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/detalhe'),
    (0, common_1.Render)('usuarios/detalhe'),
    (0, swagger_1.ApiOperation)({ summary: 'Renderiza página de detalhes do usuário' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "detailPage", null);
__decorate([
    (0, common_1.Get)(':id/editar'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Render)('usuarios/editar'),
    (0, swagger_1.ApiOperation)({ summary: 'Renderiza página de edição do usuário' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "editPage", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuário atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Request)()),
    __param(4, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove usuário (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Usuário removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/reativar'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Reativa usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuário reativado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Get)('perfil/meu'),
    (0, common_1.Render)('usuarios/perfil'),
    (0, swagger_1.ApiOperation)({ summary: 'Renderiza página do perfil do usuário logado' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "profilePage", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Usuários'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [use_cases_1.CreateUserUseCase,
        use_cases_1.UpdateUserUseCase,
        use_cases_1.DeleteUserUseCase,
        use_cases_1.GetUserByIdUseCase,
        use_cases_1.GetUsersUseCase,
        use_cases_1.RestoreUserUseCase,
        use_cases_1.GetUserStatisticsUseCase,
        use_cases_1.GetRolesUseCase])
], UsersController);
//# sourceMappingURL=users.controller.js.map