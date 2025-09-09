import { Repository } from 'typeorm';
import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';
import { User } from '../users/entities/user.entity';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { UpdateDesarquivamentoDto } from './dto/update-desarquivamento.dto';
import { QueryDesarquivamentoDto } from './dto/query-desarquivamento.dto';
export interface PaginatedDesarquivamentos {
    desarquivamentos: DesarquivamentoTypeOrmEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface DashboardStats {
    total: number;
    pendentes: number;
    emAndamento: number;
    concluidos: number;
    vencidos: number;
    porStatus: {
        status: string;
        count: number;
        color: string;
    }[];
    porTipo: {
        tipo: string;
        count: number;
    }[];
    recentes: DesarquivamentoTypeOrmEntity[];
}
import { NugecidAuditService } from './nugecid-audit.service';
export declare class NugecidService {
    private readonly desarquivamentoRepository;
    private readonly userRepository;
    private readonly nugecidAuditService;
    private readonly logger;
    constructor(desarquivamentoRepository: Repository<DesarquivamentoTypeOrmEntity>, userRepository: Repository<User>, nugecidAuditService: NugecidAuditService);
    create(createDesarquivamentoDto: CreateDesarquivamentoDto, currentUser: User): Promise<DesarquivamentoTypeOrmEntity>;
    findAll(queryDto: QueryDesarquivamentoDto): Promise<PaginatedDesarquivamentos>;
    private applyFilters;
    findOne(id: number): Promise<DesarquivamentoTypeOrmEntity>;
    findByBarcode(numeroNicLaudoAuto: string): Promise<DesarquivamentoTypeOrmEntity>;
    update(id: number, updateDesarquivamentoDto: UpdateDesarquivamentoDto, currentUser: User): Promise<DesarquivamentoTypeOrmEntity>;
    remove(id: number, currentUser: User): Promise<void>;
    findAllDeleted(queryDto: QueryDesarquivamentoDto): Promise<PaginatedDesarquivamentos>;
    restore(id: number, currentUser: User): Promise<void>;
}
