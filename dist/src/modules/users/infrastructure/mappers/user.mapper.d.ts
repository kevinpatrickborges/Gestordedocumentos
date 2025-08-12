import { User as DomainUser } from '../../domain/entities/user';
import { User as UserEntity } from '../../entities/user.entity';
export declare class UserMapper {
    static toDomain(entity: UserEntity): DomainUser;
    static toEntity(domain: DomainUser): UserEntity;
    static toDomainArray(entities: UserEntity[]): DomainUser[];
    static toEntityArray(domains: DomainUser[]): UserEntity[];
}
