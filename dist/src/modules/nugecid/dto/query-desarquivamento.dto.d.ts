export declare class QueryDesarquivamentoDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    tipoDesarquivamento?: string[];
    usuarioId?: number;
    responsavelId?: number;
    dataInicio?: string;
    dataFim?: string;
    startDate?: string;
    endDate?: string;
    urgente?: boolean;
    vencidos?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    incluirExcluidos?: boolean;
    formato?: string;
}
