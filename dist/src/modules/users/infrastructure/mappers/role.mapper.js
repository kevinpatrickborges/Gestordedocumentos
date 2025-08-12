"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleMapper = void 0;
const role_1 = require("../../domain/entities/role");
const role_id_1 = require("../../domain/value-objects/role-id");
const role_entity_1 = require("../../entities/role.entity");
class RoleMapper {
    static toDomain(entity) {
        const roleId = entity.id ? new role_id_1.RoleId(entity.id) : undefined;
        return new role_1.Role({
            id: roleId,
            nome: entity.name,
            descricao: entity.description,
            permissoes: entity.permissions || [],
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
    static toEntity(domain) {
        const entity = new role_entity_1.Role();
        if (domain.id) {
            entity.id = domain.id.value;
        }
        entity.name = domain.nome;
        entity.description = domain.descricao;
        entity.permissions = domain.permissoes;
        entity.createdAt = domain.createdAt;
        entity.updatedAt = domain.updatedAt;
        return entity;
    }
    static toDomainArray(entities) {
        return entities.map(entity => this.toDomain(entity));
    }
    static toEntityArray(domains) {
        return domains.map(domain => this.toEntity(domain));
    }
}
exports.RoleMapper = RoleMapper;
//# sourceMappingURL=role.mapper.js.map