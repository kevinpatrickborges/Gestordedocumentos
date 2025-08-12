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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
let UsersService = UsersService_1 = class UsersService {
    constructor(userRepository, roleRepository, auditoriaRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(createUserDto, currentUser) {
        if (!currentUser.isAdmin()) {
            throw new common_1.ForbiddenException('Apenas administradores podem criar usuários');
        }
        const existingUser = await this.userRepository.findOne({
            where: { usuario: createUserDto.usuario },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Usuário já está em uso');
        }
        const role = await this.roleRepository.findOne({
            where: { id: createUserDto.roleId },
        });
        if (!role) {
            throw new common_1.BadRequestException('Role inválida');
        }
        const user = this.userRepository.create({
            ...createUserDto,
            role,
        });
        const savedUser = await this.userRepository.save(user);
        await this.saveAudit(currentUser.id, 'CREATE', 'USER', `Usuário criado: ${savedUser.usuario}`, { userId: savedUser.id });
        this.logger.log(`Usuário criado: ${savedUser.usuario} por ${currentUser.usuario}`);
        return this.findOne(savedUser.id);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, roleId, ativo, sortBy = 'criadoEm', sortOrder = 'DESC', } = queryDto;
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.desarquivamentos', 'desarquivamentos');
        if (search) {
            queryBuilder.andWhere('(user.nome ILIKE :search OR user.usuario ILIKE :search)', { search: `%${search}%` });
        }
        if (roleId) {
            queryBuilder.andWhere('user.roleId = :roleId', { roleId });
        }
        if (ativo !== undefined) {
            queryBuilder.andWhere('user.ativo = :ativo', { ativo });
        }
        const validSortFields = ['nome', 'usuario', 'criadoEm', 'ultimoLogin'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'criadoEm';
        queryBuilder.orderBy(`user.${sortField}`, sortOrder);
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        const [users, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        return {
            users: users.map(user => user.serialize()),
            total,
            page,
            limit,
            totalPages,
        };
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role', 'desarquivamentos'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async findByUsuario(usuario) {
        return this.userRepository.findOne({
            where: { usuario },
            relations: ['role'],
        });
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (!currentUser.isAdmin() && currentUser.id !== id) {
            throw new common_1.ForbiddenException('Você só pode editar seu próprio perfil ou ser administrador');
        }
        if (!currentUser.isAdmin()) {
            delete updateUserDto.roleId;
            delete updateUserDto.ativo;
        }
        if (updateUserDto.usuario && updateUserDto.usuario !== user.usuario) {
            const existingUser = await this.userRepository.findOne({
                where: { usuario: updateUserDto.usuario },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Usuário já está em uso');
            }
        }
        if (updateUserDto.roleId) {
            const role = await this.roleRepository.findOne({
                where: { id: updateUserDto.roleId },
            });
            if (!role) {
                throw new common_1.BadRequestException('Role inválida');
            }
        }
        Object.assign(user, updateUserDto);
        const updatedUser = await this.userRepository.save(user);
        await this.saveAudit(currentUser.id, 'UPDATE', 'USER', `Usuário atualizado: ${updatedUser.usuario}`, { userId: updatedUser.id, changes: updateUserDto });
        this.logger.log(`Usuário atualizado: ${updatedUser.usuario} por ${currentUser.usuario}`);
        return this.findOne(updatedUser.id);
    }
    async remove(id, currentUser) {
        if (!currentUser.isAdmin()) {
            throw new common_1.ForbiddenException('Apenas administradores podem remover usuários');
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (user.id === currentUser.id) {
            throw new common_1.BadRequestException('Você não pode remover sua própria conta');
        }
        user.ativo = false;
        await this.userRepository.save(user);
        await this.saveAudit(currentUser.id, 'DELETE', 'USER', `Usuário removido: ${user.usuario}`, { userId: user.id });
        this.logger.log(`Usuário removido: ${user.usuario} por ${currentUser.usuario}`);
    }
    async reactivate(id, currentUser) {
        if (!currentUser.isAdmin()) {
            throw new common_1.ForbiddenException('Apenas administradores podem reativar usuários');
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        user.ativo = true;
        user.tentativasLogin = 0;
        user.bloqueadoAte = null;
        const reactivatedUser = await this.userRepository.save(user);
        await this.saveAudit(currentUser.id, 'UPDATE', 'USER', `Usuário reativado: ${reactivatedUser.usuario}`, { userId: reactivatedUser.id });
        this.logger.log(`Usuário reativado: ${reactivatedUser.usuario} por ${currentUser.usuario}`);
        return this.findOne(reactivatedUser.id);
    }
    async findAllRoles() {
        return this.roleRepository.find({
            order: { name: 'ASC' },
        });
    }
    async getStats() {
        const total = await this.userRepository.count();
        const ativos = await this.userRepository.count({ where: { ativo: true } });
        const inativos = await this.userRepository.count({ where: { ativo: false } });
        const bloqueados = await this.userRepository
            .createQueryBuilder('user')
            .where('user.bloqueadoAte > :now', { now: new Date() })
            .getCount();
        const porRole = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.role', 'role')
            .select('role.name', 'role')
            .addSelect('COUNT(user.id)', 'count')
            .groupBy('role.name')
            .getRawMany();
        return {
            total,
            ativos,
            inativos,
            bloqueados,
            porRole: porRole.map(item => ({
                role: item.role || 'Sem role',
                count: parseInt(item.count),
            })),
        };
    }
    async saveAudit(userId, action, resource, details, data) {
        try {
            const auditData = auditoria_entity_1.Auditoria.createResourceAudit(userId, action, resource, 0, { details, data }, 'unknown', 'unknown');
            const audit = this.auditoriaRepository.create(auditData);
            await this.auditoriaRepository.save(audit);
        }
        catch (error) {
            this.logger.error(`Erro ao salvar auditoria: ${error.message}`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(auditoria_entity_1.Auditoria)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map