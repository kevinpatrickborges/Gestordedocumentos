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
exports.TypeOrmRoleRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../../entities/role.entity");
const role_mapper_1 = require("../mappers/role.mapper");
let TypeOrmRoleRepository = class TypeOrmRoleRepository {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async save(role) {
        const entity = role_mapper_1.RoleMapper.toEntity(role);
        const savedEntity = await this.roleRepository.save(entity);
        return role_mapper_1.RoleMapper.toDomain(savedEntity);
    }
    async findById(id) {
        const entity = await this.roleRepository.findOne({
            where: { id: id.value },
        });
        return entity ? role_mapper_1.RoleMapper.toDomain(entity) : null;
    }
    async findByName(nome) {
        const entity = await this.roleRepository.findOne({
            where: { name: nome },
        });
        return entity ? role_mapper_1.RoleMapper.toDomain(entity) : null;
    }
    async findAll(filters) {
        const queryBuilder = this.roleRepository.createQueryBuilder('role');
        if (filters) {
            if (filters.nome) {
                queryBuilder.andWhere('role.name ILIKE :nome', { nome: `%${filters.nome}%` });
            }
            if (filters.permissao) {
                queryBuilder.andWhere(':permissao = ANY(role.permissions)', { permissao: filters.permissao });
            }
        }
        const entities = await queryBuilder.getMany();
        return role_mapper_1.RoleMapper.toDomainArray(entities);
    }
    async update(role) {
        const entity = role_mapper_1.RoleMapper.toEntity(role);
        const updatedEntity = await this.roleRepository.save(entity);
        return role_mapper_1.RoleMapper.toDomain(updatedEntity);
    }
    async delete(id) {
        await this.roleRepository.delete(id.value);
    }
    async exists(nome) {
        const count = await this.roleRepository.count({
            where: { name: nome },
        });
        return count > 0;
    }
    async findByPermission(permission) {
        const entities = await this.roleRepository
            .createQueryBuilder('role')
            .where(':permission = ANY(role.permissions)', { permission })
            .getMany();
        return role_mapper_1.RoleMapper.toDomainArray(entities);
    }
};
exports.TypeOrmRoleRepository = TypeOrmRoleRepository;
exports.TypeOrmRoleRepository = TypeOrmRoleRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmRoleRepository);
//# sourceMappingURL=typeorm-role.repository.js.map