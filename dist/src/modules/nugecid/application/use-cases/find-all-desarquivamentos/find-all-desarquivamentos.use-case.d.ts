import { IDesarquivamentoRepository } from '../../../domain';
export interface FindAllDesarquivamentosRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    filters?: {
        status?: string;
        tipoDesarquivamento?: string;
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
    userId?: number;
    userRoles?: string[];
}
export interface FindAllDesarquivamentosResponse {
    data: {
        id: number;
        codigoBarras?: string;
        tipoDesarquivamento: string;
        status: string;
        nomeCompleto: string;
        numeroNicLaudoAuto: string;
        numeroProcesso: string;
        tipoDocumento?: string;
        dataSolicitacao: Date;
        dataDesarquivamentoSAG?: Date;
        dataDevolucaoSetor?: Date;
        setorDemandante: string;
        servidorResponsavel: string;
        finalidadeDesarquivamento: string;
        solicitacaoProrrogacao: boolean;
        urgente?: boolean;
        criadoPorId: number;
        responsavelId?: number;
        createdAt: Date;
        updatedAt: Date;
        isOverdue?: boolean;
        daysUntilDeadline?: number;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class FindAllDesarquivamentosUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: FindAllDesarquivamentosRequest): Promise<FindAllDesarquivamentosResponse>;
    private validateRequest;
    private applySecurityFilters;
    private mapToResponse;
}
