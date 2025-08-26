import { TipoDesarquivamentoEnum } from '../domain/value-objects/tipo-desarquivamento.vo';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';
export declare class CreateDesarquivamentoDto {
    tipoSolicitacao: TipoSolicitacaoEnum;
    nomeSolicitante: string;
    requerente: string;
    numeroRegistro: string;
    numeroProcesso: string;
    tipoDesarquivamento: TipoDesarquivamentoEnum;
    numeroNicLaudoAuto?: string;
    tipoDocumento: string;
    setorDemandante: string;
    servidorResponsavel: string;
    finalidadeDesarquivamento: string;
    solicitacaoProrrogacao?: boolean;
    urgente?: boolean;
}
