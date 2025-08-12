import { DesarquivamentoDomain } from '../../domain/entities/desarquivamento.entity';
import { DesarquivamentoTypeOrmEntity } from '../entities/desarquivamento.typeorm-entity';
export declare class DesarquivamentoMapper {
    toTypeOrm(domain: DesarquivamentoDomain): DesarquivamentoTypeOrmEntity;
    toDomain(entity: DesarquivamentoTypeOrmEntity): DesarquivamentoDomain;
    toDomainList(entities: DesarquivamentoTypeOrmEntity[]): DesarquivamentoDomain[];
    toTypeOrmList(domains: DesarquivamentoDomain[]): DesarquivamentoTypeOrmEntity[];
    toPlainObject(domain: DesarquivamentoDomain): any;
    toPlainObjectList(domains: DesarquivamentoDomain[]): any[];
    fromCreateDto(dto: any): DesarquivamentoDomain;
    applyUpdateDto(domain: DesarquivamentoDomain, dto: any): DesarquivamentoDomain;
}
