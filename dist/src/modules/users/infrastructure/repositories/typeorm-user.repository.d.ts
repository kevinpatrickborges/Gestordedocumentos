import { Repository } from 'typeorm';
import { User as DomainUser } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';
import { Usuario } from '../../domain/value-objects/usuario';
import { IUserRepository, UserFilters, UserStatistics } from '../../domain/repositories/user.repository.interface';
import { User as UserEntity } from '../../entities/user.entity';
export declare class TypeOrmUserRepository implements IUserRepository {
    private readonly userRepository;
    constructor(userRepository: Repository<UserEntity>);
    save(user: DomainUser): Promise<DomainUser>;
    findById(id: UserId): Promise<DomainUser | null>;
    findByUsuario(usuario: Usuario): Promise<DomainUser | null>;
    findAll(filters?: UserFilters): Promise<DomainUser[]>;
    findWithPagination(page: number, limit: number, filters?: UserFilters): Promise<{
        users: DomainUser[];
        total: number;
        totalPages: number;
    }>;
    update(user: DomainUser): Promise<DomainUser>;
    delete(id: UserId): Promise<void>;
    softDelete(id: UserId): Promise<void>;
    restore(id: UserId): Promise<void>;
    exists(usuario: Usuario): Promise<boolean>;
    getStatistics(): Promise<UserStatistics>;
}
