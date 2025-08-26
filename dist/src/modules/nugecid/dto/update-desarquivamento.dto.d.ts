import { StatusDesarquivamento } from '../entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';
import { TipoDesarquivamentoEnum } from '../domain/value-objects/tipo-desarquivamento.vo';
export declare class UpdateDesarquivamentoDto {
    tipo?: TipoSolicitacaoEnum;
    tipoSolicitacao?: TipoSolicitacaoEnum;
    tipoDesarquivamento?: TipoDesarquivamentoEnum;
    requerente?: string;
    numeroNicLaudoAuto?: string;
    numeroProcesso?: string;
    setorDemandante?: string;
    servidorResponsavel?: string;
    finalidadeDesarquivamento?: string;
    solicitacaoProrrogacao?: boolean;
    status?: StatusDesarquivamento;
    nomeSolicitante?: string;
    nomeVitima?: string;
    numeroRegistro?: string;
    tipoDocumento?: string;
    dataFato?: Date;
    finalidade?: string;
    observacoes?: string;
    urgente?: boolean;
    localizacaoFisica?: string;
    prazoAtendimento?: Date;
    responsavelId?: number;
    dataAtendimento?: Date;
    resultadoAtendimento?: string;
}
