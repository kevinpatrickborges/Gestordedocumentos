import { TipoDesarquivamentoEnum } from '../domain/enums/tipo-desarquivamento.enum';
import { StatusDesarquivamentoEnum } from '../domain/enums/status-desarquivamento.enum';
export declare class UpdateDesarquivamentoDto {
    desarquivamentoFisicoDigital?: TipoDesarquivamentoEnum;
    status?: StatusDesarquivamentoEnum;
    nomeCompleto?: string;
    numeroNicLaudoAuto?: string;
    numeroProcesso?: string;
    tipoDocumento?: string;
    dataSolicitacao?: Date;
    dataDesarquivamentoSAG?: Date;
    dataDevolucaoSetor?: Date;
    setorDemandante?: string;
    servidorResponsavel?: string;
    finalidadeDesarquivamento?: string;
    solicitacaoProrrogacao?: boolean;
    urgente?: boolean;
    responsavelId?: number;
}
