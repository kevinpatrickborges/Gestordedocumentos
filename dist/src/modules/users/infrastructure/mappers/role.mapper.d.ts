import { Role as DomainRole } from '../../domain/entities/role';
import { Role as RoleEntity } from '../../entities/role.entity';
export declare class RoleMapper {
    static toDomain(entity: RoleEntity): DomainRole;
    static toEntity(domain: DomainRole): RoleEntity;
    static toDomainArray(entities: RoleEntity[]): DomainRole[];
    static toEntityArray(domains: DomainRole[]): RoleEntity[];
}
