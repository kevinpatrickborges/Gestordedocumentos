import { Repository } from 'typeorm';
import { DesarquivamentoTypeOrmEntity } from '../entities/desarquivamento.typeorm-entity';
import { IDesarquivamentoRepository, FindAllOptions, FindAllResult, DashboardStats } from '../../domain/interfaces/desarquivamento.repository.interface';
import { DesarquivamentoDomain } from '../../domain/entities/desarquivamento.entity';
import { DesarquivamentoMapper } from '../mappers/desarquivamento.mapper';
import { DesarquivamentoId } from '../../domain/value-objects';
export declare class DesarquivamentoTypeOrmRepository implements IDesarquivamentoRepository {
    private readonly repository;
    private readonly mapper;
    constructor(repository: Repository<DesarquivamentoTypeOrmEntity>, mapper: DesarquivamentoMapper);
    create(desarquivamento: DesarquivamentoDomain): Promise<DesarquivamentoDomain>;
    update(desarquivamento: DesarquivamentoDomain): Promise<DesarquivamentoDomain>;
    findById(id: DesarquivamentoId): Promise<DesarquivamentoDomain | null>;
    findAll(options: FindAllOptions): Promise<FindAllResult>;
    delete(id: DesarquivamentoId): Promise<void>;
    softDelete(id: DesarquivamentoId): Promise<void>;
    restore(id: DesarquivamentoId): Promise<void>;
    findByCodigoBarras(codigoBarras: string): Promise<DesarquivamentoDomain | null>;
    findByNumeroRegistro(numeroRegistro: string): Promise<DesarquivamentoDomain[]>;
    findByCriadoPor(userId: number, options?: FindAllOptions): Promise<FindAllResult>;
    findByResponsavel(userId: number, options?: FindAllOptions): Promise<FindAllResult>;
    findOverdue(): Promise<DesarquivamentoDomain[]>;
    findUrgent(): Promise<DesarquivamentoDomain[]>;
    getDashboardStats(userId?: number, userRoles?: string[], dateRange?: {
        startDate: Date;
        endDate: Date;
    }): Promise<DashboardStats>;
    countByStatus(status: string): Promise<number>;
    countByTipo(tipo: string): Promise<number>;
    existsByCodigoBarras(codigoBarras: string): Promise<boolean>;
    getNextSequenceNumber(): Promise<number>;
    createMany(desarquivamentos: DesarquivamentoDomain[]): Promise<DesarquivamentoDomain[]>;
    updateMany(desarquivamentos: DesarquivamentoDomain[]): Promise<DesarquivamentoDomain[]>;
    private applyFilters;
}
