import { IDesarquivamentoRepository } from '../../../domain';
export interface CreateDesarquivamentoRequest {
    tipoSolicitacao: string;
    nomeSolicitante: string;
    requerente: string;
    nomeVitima?: string;
    numeroRegistro: string;
    numeroProcesso: string;
    tipoDocumento?: string;
    dataFato?: Date;
    prazoAtendimento?: Date;
    finalidade?: string;
    observacoes?: string;
    urgente: boolean;
    localizacaoFisica?: string;
    criadoPorId: number;
    responsavelId?: number;
}
export interface CreateDesarquivamentoResponse {
    id: number;
    codigoBarras: string;
    tipoSolicitacao: string;
    status: string;
    nomeSolicitante: string;
    nomeVitima?: string;
    numeroRegistro: string;
    numeroProcesso: string;
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
export declare class CreateDesarquivamentoUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: CreateDesarquivamentoRequest): Promise<CreateDesarquivamentoResponse>;
    private validateRequest;
    private generateUniqueCodigoBarras;
    private mapToResponse;
}
