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
exports.TypeOrmUserRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const user_mapper_1 = require("../mappers/user.mapper");
let TypeOrmUserRepository = class TypeOrmUserRepository {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async save(user) {
        const entity = user_mapper_1.UserMapper.toEntity(user);
        const savedEntity = await this.userRepository.save(entity);
        return user_mapper_1.UserMapper.toDomain(savedEntity);
    }
    async findById(id) {
        const entity = await this.userRepository.findOne({
            where: { id: id.value },
            relations: ['role'],
        });
        return entity ? user_mapper_1.UserMapper.toDomain(entity) : null;
    }
    async findByUsuario(usuario) {
        const entity = await this.userRepository.findOne({
            where: { usuario: usuario.value },
            relations: ['role'],
        });
        return entity ? user_mapper_1.UserMapper.toDomain(entity) : null;
    }
    async findAll(filters) {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role');
        if (filters) {
            if (filters.nome) {
                queryBuilder.andWhere('user.nome ILIKE :nome', {
                    nome: `%${filters.nome}%`,
                });
            }
            if (filters.usuario) {
                queryBuilder.andWhere('user.usuario ILIKE :usuario', {
                    usuario: `%${filters.usuario}%`,
                });
            }
            if (filters.ativo !== undefined) {
                queryBuilder.andWhere('user.ativo = :ativo', { ativo: filters.ativo });
            }
            if (filters.roleId) {
                queryBuilder.andWhere('user.roleId = :roleId', {
                    roleId: filters.roleId,
                });
            }
            if (!filters.includeDeleted) {
                queryBuilder.andWhere('user.deletedAt IS NULL');
            }
        }
        else {
            queryBuilder.andWhere('user.deletedAt IS NULL');
        }
        const entities = await queryBuilder.getMany();
        return user_mapper_1.UserMapper.toDomainArray(entities);
    }
    async findWithPagination(page, limit, filters) {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role');
        if (filters) {
            if (filters.nome) {
                queryBuilder.andWhere('user.nome ILIKE :nome', {
                    nome: `%${filters.nome}%`,
                });
            }
            if (filters.usuario) {
                queryBuilder.andWhere('user.usuario ILIKE :usuario', {
                    usuario: `%${filters.usuario}%`,
                });
            }
            if (filters.ativo !== undefined) {
                queryBuilder.andWhere('user.ativo = :ativo', { ativo: filters.ativo });
            }
            if (filters.roleId) {
                queryBuilder.andWhere('user.roleId = :roleId', {
                    roleId: filters.roleId,
                });
            }
            if (!filters.includeDeleted) {
                queryBuilder.andWhere('user.deletedAt IS NULL');
            }
        }
        else {
            queryBuilder.andWhere('user.deletedAt IS NULL');
        }
        const total = await queryBuilder.getCount();
        const entities = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const users = user_mapper_1.UserMapper.toDomainArray(entities);
        const totalPages = Math.ceil(total / limit);
        return { users, total, totalPages };
    }
    async update(user) {
        const entity = user_mapper_1.UserMapper.toEntity(user);
        const updatedEntity = await this.userRepository.save(entity);
        return user_mapper_1.UserMapper.toDomain(updatedEntity);
    }
    async delete(id) {
        await this.userRepository.delete(id.value);
    }
    async softDelete(id) {
        await this.userRepository.softDelete(id.value);
    }
    async restore(id) {
        await this.userRepository.restore(id.value);
    }
    async exists(usuario) {
        const count = await this.userRepository.count({
            where: { usuario: usuario.value },
        });
        return count > 0;
    }
    async getStatistics() {
        const total = await this.userRepository.count();
        const ativos = await this.userRepository.count({ where: { ativo: true } });
        const inativos = await this.userRepository.count({
            where: { ativo: false },
        });
        const deletados = await this.userRepository
            .createQueryBuilder('user')
            .withDeleted()
            .where('user.deletedAt IS NOT NULL')
            .getCount();
        return { total, ativos, inativos, deletados };
    }
};
exports.TypeOrmUserRepository = TypeOrmUserRepository;
exports.TypeOrmUserRepository = TypeOrmUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmUserRepository);
//# sourceMappingURL=typeorm-user.repository.js.map