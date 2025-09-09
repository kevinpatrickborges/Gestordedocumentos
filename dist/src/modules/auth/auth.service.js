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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, roleRepository, auditoriaRepository, jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.onlineUsers = new Map();
    }
    async validateUser(usuario, password) {
        this.logger.debug(`[AuthService] Iniciando validação para o usuário: "${usuario}"`);
        try {
            let user = await this.userRepository.findOne({
                where: { usuario: usuario },
                relations: ['role'],
            });
            if (!user && usuario.includes('@')) {
                const baseUsername = usuario.split('@')[0];
                user = await this.userRepository.findOne({
                    where: { usuario: baseUsername },
                    relations: ['role'],
                });
                this.logger.debug(`[AuthService] Tentativa de busca alternativa com nome base: "${baseUsername}"`);
            }
            if (!user) {
                this.logger.warn(`[AuthService] Tentativa de login com usuário inexistente: "${usuario}"`);
                return null;
            }
            this.logger.debug(`[AuthService] Usuário encontrado: ${user.usuario} (ID: ${user.id})`);
            this.logger.debug(`[AuthService] Usuário object: ${JSON.stringify({ id: user.id, usuario: user.usuario, ativo: user.ativo, role: user.role ? user.role.name : null })}`);
            if (!user.ativo) {
                this.logger.warn(`[AuthService] Tentativa de login com usuário inativo: "${usuario}"`);
                throw new common_1.UnauthorizedException('Usuário inativo');
            }
            if (user.isBlocked()) {
                this.logger.warn(`[AuthService] Tentativa de login com usuário bloqueado: "${usuario}"`);
                throw new common_1.UnauthorizedException(`Usuário bloqueado até ${user.bloqueadoAte.toLocaleString()}`);
            }
            this.logger.debug(`[AuthService] Verificando a senha para o usuário: "${usuario}"`);
            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) {
                this.logger.warn(`[AuthService] Senha inválida para o usuário: "${usuario}"`);
                await this.handleFailedLogin(user);
                return null;
            }
            this.logger.debug(`[AuthService] Senha válida para o usuário: "${usuario}".`);
            await this.handleSuccessfulLogin(user);
            return user;
        }
        catch (error) {
            this.logger.error(`[AuthService] Erro na validação do usuário "${usuario}": ${error.message}`, error.stack);
            throw error;
        }
    }
    async login(loginDto, ipAddress, userAgent) {
        const user = await this.validateUser(loginDto.usuario, loginDto.senha);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const payload = {
            sub: user.id,
            usuario: user.usuario,
            role: user.role?.name || 'user',
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '50m' });
        const refreshPayload = {
            sub: user.id,
            usuario: user.usuario,
            type: 'refresh'
        };
        const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });
        await this.saveLoginAudit(user.id, ipAddress, userAgent, true);
        this.onlineUsers.set(user.id, { lastActivity: new Date() });
        this.logger.log(`Login bem-sucedido para usuário: ${user.usuario}`);
        return {
            user: this.sanitizeUser(user),
            accessToken,
            refreshToken,
            expiresIn: '50m',
        };
    }
    async loginV2(loginDto, ipAddress, userAgent) {
        const user = await this.validateUser(loginDto.usuario, loginDto.senha);
        if (!user) {
            await this.saveLoginAudit(null, ipAddress, userAgent, false, 'Credenciais inválidas');
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const payload = {
            sub: user.id,
            usuario: user.usuario,
            role: user.role?.name || 'user',
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '50m' });
        await this.saveLoginAudit(user.id, ipAddress, userAgent, true);
        this.onlineUsers.set(user.id, { lastActivity: new Date() });
        this.logger.log(`Login API v2 bem-sucedido para usuário: ${user.usuario}`);
        return {
            user: {
                userId: user.id,
                usuario: user.usuario,
                role: user.role?.name || 'user',
            },
            accessToken,
            expiresIn: '50m',
        };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = this.jwtService.verify(refreshToken);
            if (decoded.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid refresh token type');
            }
            const user = await this.userRepository.findOne({
                where: { id: decoded.sub },
                relations: ['role'],
            });
            if (!user || !user.ativo) {
                throw new common_1.UnauthorizedException('Usuário não encontrado ou inativo');
            }
            const payload = {
                sub: user.id,
                usuario: user.usuario,
                role: user.role?.name || 'user',
            };
            const accessToken = this.jwtService.sign(payload, { expiresIn: '50m' });
            this.logger.log(`Token renovado para usuário: ${user.usuario}`);
            return {
                accessToken,
                expiresIn: '50m',
            };
        }
        catch (error) {
            this.logger.warn(`Falha ao renovar token: ${error.message}`);
            throw new common_1.UnauthorizedException('Token de refresh inválido ou expirado');
        }
    }
    async validateJwtPayload(payload) {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            relations: ['role'],
        });
        if (user && user.ativo) {
            return user;
        }
        return null;
    }
    async register(registerDto, currentUser) {
        if (!currentUser.isAdmin()) {
            throw new common_1.UnauthorizedException('Apenas administradores podem criar usuários');
        }
        const existingUser = await this.userRepository.findOne({
            where: { usuario: registerDto.usuario },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Usuário já está em uso');
        }
        const role = await this.roleRepository.findOne({
            where: { id: registerDto.roleId },
        });
        if (!role) {
            throw new common_1.BadRequestException('Role inválida');
        }
        const user = this.userRepository.create({
            nome: registerDto.nome,
            usuario: registerDto.usuario,
            senha: registerDto.senha,
            roleId: registerDto.roleId,
        });
        const savedUser = await this.userRepository.save(user);
        this.logger.log(`Novo usuário criado: ${savedUser.usuario} por ${currentUser.usuario}`);
        return this.sanitizeUser(savedUser);
    }
    async logout(userId, ipAddress, userAgent) {
        await this.saveLogoutAudit(userId, ipAddress, userAgent);
        this.onlineUsers.delete(userId);
        this.logger.log(`Logout realizado para usuário ID: ${userId}`);
    }
    async findUserById(id) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.id = :id', { id })
            .select([
            'user.id',
            'user.nome',
            'user.usuario',
            'user.ultimoLogin',
            'user.createdAt',
            'role.id',
            'role.name',
            'role.description',
            'role.permissions',
        ])
            .getOne();
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado');
        }
        return user;
    }
    async handleFailedLogin(user) {
        user.tentativasLogin += 1;
        if (user.tentativasLogin >= 5) {
            user.bloqueadoAte = new Date(Date.now() + 30 * 60 * 1000);
            this.logger.warn(`Usuário ${user.usuario} foi bloqueado por excesso de tentativas`);
        }
        await this.userRepository.save(user);
    }
    async handleSuccessfulLogin(user) {
        user.tentativasLogin = 0;
        user.bloqueadoAte = null;
        user.ultimoLogin = new Date();
        await this.userRepository.save(user);
    }
    async saveLoginAudit(userId, ipAddress, userAgent, success, error) {
        try {
            const auditData = auditoria_entity_1.Auditoria.createLoginAudit(userId, ipAddress, userAgent, success, error);
            const audit = this.auditoriaRepository.create(auditData);
            await this.auditoriaRepository.save(audit);
        }
        catch (auditError) {
            this.logger.error(`Erro ao salvar auditoria de login: ${auditError.message}`);
        }
    }
    async saveLogoutAudit(userId, ipAddress, userAgent) {
        try {
            const auditData = auditoria_entity_1.Auditoria.createLogoutAudit(userId, ipAddress, userAgent);
            const audit = this.auditoriaRepository.create(auditData);
            await this.auditoriaRepository.save(audit);
        }
        catch (auditError) {
            this.logger.error(`Erro ao salvar auditoria de logout: ${auditError.message}`);
        }
    }
    async getOnlineUsers() {
        const onlineUserIds = Array.from(this.onlineUsers.keys());
        if (onlineUserIds.length === 0) {
            return [];
        }
        const users = await this.userRepository.find({
            where: { id: (0, typeorm_2.In)(onlineUserIds) },
            relations: ['role'],
            select: ['id', 'nome', 'usuario'],
        });
        return users.map(user => ({
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            role: user.role?.name || 'user',
        }));
    }
    sanitizeUser(user) {
        const { senha, ...sanitizedUser } = user;
        return sanitizedUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(auditoria_entity_1.Auditoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map