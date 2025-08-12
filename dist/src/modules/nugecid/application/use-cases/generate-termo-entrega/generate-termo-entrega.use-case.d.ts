import { IDesarquivamentoRepository } from '../../../domain';
export interface GenerateTermoEntregaRequest {
    id: number;
    userId: number;
    userRoles: string[];
    templateOptions?: {
        incluirObservacoes?: boolean;
        incluirLocalizacao?: boolean;
        logoPath?: string;
        assinatura?: {
            nome: string;
            cargo: string;
            data?: Date;
        };
    };
}
export interface GenerateTermoEntregaResponse {
    pdfBuffer: Buffer;
    fileName: string;
    contentType: string;
    generatedAt: Date;
}
export interface TermoEntregaData {
    desarquivamento: {
        id: number;
        codigoBarras: string;
        numeroRegistro: string;
        tipoSolicitacao: string;
        nomeSolicitante: string;
        nomeVitima?: string;
        dataFato?: Date;
        finalidade?: string;
        observacoes?: string;
        localizacaoFisica?: string;
        urgente: boolean;
    };
    entrega: {
        dataEntrega: Date;
        responsavel: {
            nome: string;
            cargo: string;
        };
        recebedor: {
            nome: string;
            documento?: string;
            assinatura?: string;
        };
    };
    instituicao: {
        nome: string;
        endereco: string;
        telefone?: string;
        email?: string;
        logo?: string;
    };
}
export declare class GenerateTermoEntregaUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: GenerateTermoEntregaRequest): Promise<GenerateTermoEntregaResponse>;
    private validateRequest;
    private validateDesarquivamentoForTermo;
    private prepareTermoData;
    private generatePDF;
    private generateHTMLTemplate;
    private generateFileName;
}
