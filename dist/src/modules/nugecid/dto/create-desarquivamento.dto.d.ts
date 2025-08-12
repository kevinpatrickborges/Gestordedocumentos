import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';
export declare class CreateDesarquivamentoDto {
    tipoSolicitacao: TipoSolicitacaoEnum;
    nomeSolicitante: string;
    nomeVitima?: string;
    numeroRegistro: string;
    tipoDocumento?: string;
    dataFato?: Date;
    finalidade?: string;
    observacoes?: string;
    urgente?: boolean;
    localizacaoFisica?: string;
    prazoAtendimento?: Date;
    responsavelId?: number;
}
