import { Repository } from 'typeorm';
import { Role as DomainRole } from '../../domain/entities/role';
import { RoleId } from '../../domain/value-objects/role-id';
import { IRoleRepository, RoleFilters } from '../../domain/repositories/role.repository.interface';
import { Role as RoleEntity } from '../../entities/role.entity';
export declare class TypeOrmRoleRepository implements IRoleRepository {
    private readonly roleRepository;
    constructor(roleRepository: Repository<RoleEntity>);
    save(role: DomainRole): Promise<DomainRole>;
    findById(id: RoleId): Promise<DomainRole | null>;
    findByName(nome: string): Promise<DomainRole | null>;
    findAll(filters?: RoleFilters): Promise<DomainRole[]>;
    update(role: DomainRole): Promise<DomainRole>;
    delete(id: RoleId): Promise<void>;
    exists(nome: string): Promise<boolean>;
    findByPermission(permission: string): Promise<DomainRole[]>;
}
