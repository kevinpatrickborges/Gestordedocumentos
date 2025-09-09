import { IDesarquivamentoRepository } from '../../../domain';
export interface CreateDesarquivamentoRequest {
    tipoDesarquivamento: string;
    nomeCompleto: string;
    numeroNicLaudoAuto: string;
    numeroProcesso: string;
    tipoDocumento: string;
    dataSolicitacao: string;
    dataDesarquivamentoSAG?: string;
    dataDevolucaoSetor?: string;
    setorDemandante: string;
    servidorResponsavel: string;
    finalidadeDesarquivamento: string;
    solicitacaoProrrogacao: boolean;
    urgente?: boolean;
    criadoPorId: number;
    responsavelId?: number;
    nomeSolicitante?: string;
    numeroRegistro?: string;
    tipoSolicitacao?: string;
    nomeVitima?: string;
    dataFato?: Date;
    prazoAtendimento?: Date;
    finalidade?: string;
    observacoes?: string;
    localizacaoFisica?: string;
    requerente?: string;
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
    private readonly logger;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: CreateDesarquivamentoRequest): Promise<CreateDesarquivamentoResponse>;
    private validateRequest;
    private generateUniqueCodigoBarras;
    private mapToResponse;
}
