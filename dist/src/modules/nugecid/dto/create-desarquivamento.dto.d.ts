import { TipoDesarquivamentoEnum } from '../domain/enums/tipo-desarquivamento.enum';
export declare class CreateDesarquivamentoDto {
    tipoDesarquivamento: string;
    desarquivamentoFisicoDigital?: TipoDesarquivamentoEnum;
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
}
