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
    dataDesarquivamentoSAG?: Date | string;
    dataDevolucaoSetor?: Date | string;
    userId: number;
    userRoles: string[];
}
export interface UpdateDesarquivamentoResponse {
    id: number;
    codigoBarras?: string;
    tipoDesarquivamento: string;
    tipoSolicitacao?: string;
    status: string;
    nomeSolicitante?: string;
    nomeCompleto: string;
    numeroNicLaudoAuto: string;
    nomeVitima?: string;
    numeroRegistro?: string;
    numeroProcesso: string;
    tipoDocumento?: string;
    dataFato?: Date;
    dataSolicitacao: Date;
    dataDesarquivamentoSAG?: Date;
    dataDevolucaoSetor?: Date;
    setorDemandante: string;
    servidorResponsavel: string;
    finalidadeDesarquivamento: string;
    solicitacaoProrrogacao: boolean;
    prazoAtendimento?: Date;
    dataAtendimento?: Date;
    resultadoAtendimento?: string;
    finalidade?: string;
    observacoes?: string;
    urgente?: boolean;
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
