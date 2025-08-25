"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_1 = require("../../domain/entities/user");
const role_1 = require("../../domain/entities/role");
const user_id_1 = require("../../domain/value-objects/user-id");
const usuario_1 = require("../../domain/value-objects/usuario");
const password_1 = require("../../domain/value-objects/password");
const role_id_1 = require("../../domain/value-objects/role-id");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
class UserMapper {
    static toDomain(entity) {
        const userId = entity.id ? new user_id_1.UserId(entity.id) : undefined;
        const usuario = new usuario_1.Usuario(entity.usuario);
        const password = password_1.Password.fromHash(entity.senha);
        const roleId = new role_id_1.RoleId(entity.roleId);
        let role;
        if (entity.role) {
            role = new role_1.Role({
                id: new role_id_1.RoleId(entity.role.id),
                nome: entity.role.name,
                descricao: entity.role.description,
                permissoes: entity.role.permissions || [],
                createdAt: entity.role.createdAt,
                updatedAt: entity.role.updatedAt,
            });
        }
        return new user_1.User({
            id: userId,
            nome: entity.nome,
            usuario,
            password,
            roleId,
            role,
            ativo: entity.ativo,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt,
        });
    }
    static toEntity(domain) {
        const entity = new user_entity_1.User();
        if (domain.id) {
            entity.id = domain.id.value;
        }
        entity.nome = domain.nome;
        entity.usuario = domain.usuario.value;
        entity.senha = domain.password.hashedValue;
        entity.roleId = domain.roleId.value;
        entity.ativo = domain.ativo;
        entity.createdAt = domain.createdAt;
        entity.updatedAt = domain.updatedAt;
        entity.deletedAt = domain.deletedAt;
        if (domain.role) {
            const roleEntity = new role_entity_1.Role();
            roleEntity.id = domain.role.id.value;
            roleEntity.name = domain.role.nome;
            roleEntity.description = domain.role.descricao;
            roleEntity.permissions = domain.role.permissoes;
            roleEntity.createdAt = domain.role.createdAt;
            roleEntity.updatedAt = domain.role.updatedAt;
            entity.role = roleEntity;
        }
        return entity;
    }
    static toDomainArray(entities) {
        return entities.map(entity => this.toDomain(entity));
    }
    static toEntityArray(domains) {
        return domains.map(domain => this.toEntity(domain));
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map