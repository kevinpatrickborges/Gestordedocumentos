import { StatusDesarquivamento } from '../entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';
export declare class QueryDesarquivamentoDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: StatusDesarquivamento[];
    tipo?: TipoSolicitacaoEnum[];
    usuarioId?: number;
    responsavelId?: number;
    dataInicio?: string;
    dataFim?: string;
    urgente?: boolean;
    vencidos?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    incluirExcluidos?: boolean;
    formato?: string;
}
