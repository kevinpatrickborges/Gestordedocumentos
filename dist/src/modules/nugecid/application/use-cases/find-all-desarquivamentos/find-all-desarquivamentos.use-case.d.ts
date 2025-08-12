import { IDesarquivamentoRepository } from '../../../domain';
export interface FindAllDesarquivamentosRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    filters?: {
        status?: string;
        tipoSolicitacao?: string;
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
        codigoBarras: string;
        tipoSolicitacao: string;
        status: string;
        nomeSolicitante: string;
        nomeVitima?: string;
        numeroRegistro: string;
        tipoDocumento?: string;
        dataFato?: Date;
        prazoAtendimento?: Date;
        dataAtendimento?: Date;
        resultadoAtendimento?: string;
        finalidade?: string;
        observacoes?: string;
        urgente: boolean;
        localizacaoFisica?: string;
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
