import { StatusDesarquivamento } from '../entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';
export declare class UpdateDesarquivamentoDto {
    tipo?: TipoSolicitacaoEnum;
    status?: StatusDesarquivamento;
    nomeRequerente?: string;
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
