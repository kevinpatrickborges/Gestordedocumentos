import { IDesarquivamentoRepository } from '../../../domain';
export interface UpdateDesarquivamentoRequest {
    id: number;
    nomeVitima?: string;
    tipoDocumento?: string;
    dataFato?: Date;
    prazoAtendimento?: Date;
    finalidade?: string;
    observacoes?: string;
    localizacaoFisica?: string;
    responsavelId?: number;
    status?: string;
    resultadoAtendimento?: string;
    userId: number;
    userRoles: string[];
}
export interface UpdateDesarquivamentoResponse {
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
}
export declare class UpdateDesarquivamentoUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: UpdateDesarquivamentoRequest): Promise<UpdateDesarquivamentoResponse>;
    private validateRequest;
    private applyUpdates;
    private updateStatus;
    private requiresReconstruction;
    private mapToResponse;
}
