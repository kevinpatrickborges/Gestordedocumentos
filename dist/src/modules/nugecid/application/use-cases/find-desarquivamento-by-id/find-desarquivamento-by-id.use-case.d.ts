import { IDesarquivamentoRepository } from '../../../domain';
export interface FindDesarquivamentoByIdRequest {
    id: number;
    userId?: number;
    userRoles?: string[];
}
export interface FindDesarquivamentoByIdResponse {
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
    deletedAt?: Date;
    isOverdue?: boolean;
    daysUntilDeadline?: number;
    canBeEdited?: boolean;
    canBeCancelled?: boolean;
    canBeCompleted?: boolean;
}
export declare class FindDesarquivamentoByIdUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: FindDesarquivamentoByIdRequest): Promise<FindDesarquivamentoByIdResponse>;
    private validateRequest;
    private mapToResponse;
}
