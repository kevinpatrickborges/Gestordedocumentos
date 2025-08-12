export declare enum TipoDesarquivamento {
    FISICO = "F\u00EDsico",
    DIGITAL = "Digital",
    NAO_LOCALIZADO = "N\u00E3o Localizado"
}
export declare enum StatusDesarquivamento {
    FINALIZADO = "Finalizado",
    DESARQUIVADO = "Desarquivado",
    NAO_COLETADO = "N\u00E3o coletado",
    SOLICITADO = "Solicitado",
    REARQUIVAMENTO_SOLICITADO = "Rearquivamento Solicitado",
    RETIRADO_PELO_SETOR = "Retirado pelo setor",
    NAO_LOCALIZADO = "N\u00E3o Localizado"
}
export declare class ImportRegistroDto {
    desarquivamentoTipo: TipoDesarquivamento;
    status: StatusDesarquivamento;
    nomeCompleto: string;
    numDocumento: string;
    numProcesso?: string;
    tipoDocumento?: string;
    dataSolicitacao: string;
    dataDesarquivamento?: string;
    dataDevolucao?: string;
    setorDemandante?: string;
    servidorResponsavel?: string;
    finalidade?: string;
    prorrogacao: boolean;
}
