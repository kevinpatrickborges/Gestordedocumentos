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
var SeedingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
const role_type_enum_1 = require("../users/enums/role-type.enum");
let SeedingService = SeedingService_1 = class SeedingService {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.logger = new common_1.Logger(SeedingService_1.name);
    }
    async onModuleInit() {
        this.logger.log('Iniciando o processo de seeding do banco de dados...');
        await this.seedRoles();
        await this.updateExistingRoles();
        await this.seedAdminUser();
        this.logger.log('Seeding do banco de dados concluído.');
    }
    async updateExistingRoles() {
        const rolePermissions = {
            [role_type_enum_1.RoleType.ADMIN]: ['users:create', 'users:read', 'users:update', 'users:delete', 'roles:manage', 'system:admin', 'nugecid:manage', 'audit:read'],
            [role_type_enum_1.RoleType.USUARIO]: ['nugecid:read', 'nugecid:create', 'nugecid:update', 'profile:read', 'dashboard:read', 'reports:read']
        };
        for (const [roleName, permissions] of Object.entries(rolePermissions)) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: roleName }
            });
            if (existingRole && (!existingRole.permissions || existingRole.permissions.length === 0)) {
                this.logger.log(`Atualizando permissões para a role: ${roleName}`);
                existingRole.permissions = permissions;
                await this.roleRepository.save(existingRole);
                this.logger.log(`Permissões atualizadas para a role: ${roleName}`);
            }
        }
    }
    async seedRoles() {
        const existingRoles = await this.roleRepository.find();
        const existingRoleNames = existingRoles.map(role => role.name);
        const rolesToCreate = [
            {
                name: role_type_enum_1.RoleType.ADMIN,
                description: 'Administrador do sistema',
                permissions: ['users:create', 'users:read', 'users:update', 'users:delete', 'roles:manage', 'system:admin', 'nugecid:manage', 'audit:read']
            },
            {
                name: role_type_enum_1.RoleType.USUARIO,
                description: 'Usuário padrão',
                permissions: ['nugecid:read', 'nugecid:create', 'nugecid:update', 'profile:read', 'dashboard:read', 'reports:read']
            },
        ];
        const newRoles = rolesToCreate.filter(role => !existingRoleNames.includes(role.name));
        if (newRoles.length > 0) {
            this.logger.log(`Criando ${newRoles.length} roles faltantes...`);
            const roleEntities = newRoles.map(role => this.roleRepository.create(role));
            await this.roleRepository.save(roleEntities);
            this.logger.log('Roles criadas com sucesso:', newRoles.map(r => r.name).join(', '));
        }
        else {
            this.logger.log('Todas as roles já existem.');
        }
    }
    async seedAdminUser() {
        const adminRole = await this.roleRepository.findOne({
            where: { name: role_type_enum_1.RoleType.ADMIN },
        });
        if (!adminRole) {
            this.logger.error('Role de Admin não encontrada. Não foi possível criar ou atualizar o usuário admin.');
            return;
        }
        const adminUser = await this.userRepository.findOne({
            where: { usuario: 'admin' },
        });
        const hashedPassword = await bcrypt.hash('admin123', 12);
        if (adminUser) {
            this.logger.log('Usuário admin encontrado. Atualizando a senha...');
            adminUser.senha = hashedPassword;
            adminUser.role = adminRole;
            await this.userRepository.save(adminUser);
            this.logger.log('Usuário admin atualizado com sucesso.');
        }
        else {
            this.logger.log('Usuário admin não encontrado. Criando usuário admin...');
            const newAdminUser = this.userRepository.create({
                nome: 'Administrador',
                usuario: 'admin',
                senha: hashedPassword,
                ativo: true,
                role: adminRole,
            });
            await this.userRepository.save(newAdminUser);
            this.logger.log('Usuário admin criado com sucesso.');
        }
    }
};
exports.SeedingService = SeedingService;
exports.SeedingService = SeedingService = SeedingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SeedingService);
//# sourceMappingURL=seeding.service.js.map