import { DesarquivamentoDomain } from '../entities';
import { DesarquivamentoId } from '../value-objects';
import { StatusDesarquivamentoEnum } from '../enums/status-desarquivamento.enum';
export declare const DESARQUIVAMENTO_REPOSITORY = "DesarquivamentoRepository";
export interface FindAllOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    filters?: {
        search?: string;
        status?: string | string[];
        statusList?: string[];
        tipoDesarquivamento?: string | string[];
        tipoDesarquivamentoList?: string[];
        nomeSolicitante?: string;
        numeroRegistro?: string;
        codigoBarras?: string;
        criadoPorId?: number;
        responsavelId?: number;
        urgente?: boolean;
        dataInicio?: Date;
        dataFim?: Date;
        incluirExcluidos?: boolean;
    };
}
export interface FindAllResult {
    data: DesarquivamentoDomain[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface DashboardStats {
    totalRegistros: number;
    pendentes: number;
    emAndamento: number;
    concluidos: number;
    naoLocalizados: number;
    cancelados: number;
    vencidos: number;
    urgentes: number;
    porTipo: Record<string, number>;
    porMes: Record<string, number>;
    taxaConclusao: number;
    tempoMedioAtendimento: number;
    registrosVencendoEm7Dias: number;
    eficienciaPorResponsavel?: Record<string, {
        total: number;
        concluidos: number;
        tempoMedio: number;
    }>;
}
export interface IDesarquivamentoRepository {
    create(desarquivamento: DesarquivamentoDomain): Promise<DesarquivamentoDomain>;
    findById(id: DesarquivamentoId): Promise<DesarquivamentoDomain | null>;
    findByIdWithDeleted(id: DesarquivamentoId): Promise<DesarquivamentoDomain | null>;
    findAll(options?: FindAllOptions): Promise<FindAllResult>;
    update(desarquivamento: DesarquivamentoDomain): Promise<DesarquivamentoDomain>;
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
    countByStatus(status: StatusDesarquivamentoEnum): Promise<number>;
    countByTipo(tipo: string): Promise<number>;
    existsByCodigoBarras(codigoBarras: string): Promise<boolean>;
    getNextSequenceNumber(): Promise<number>;
    createMany(desarquivamentos: DesarquivamentoDomain[]): Promise<DesarquivamentoDomain[]>;
    updateMany(desarquivamentos: DesarquivamentoDomain[]): Promise<DesarquivamentoDomain[]>;
}
