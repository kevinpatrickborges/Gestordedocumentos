export declare enum TipoSolicitacaoEnum {
    DESARQUIVAMENTO = "DESARQUIVAMENTO",
    COPIA = "COPIA",
    VISTA = "VISTA",
    CERTIDAO = "CERTIDAO"
}
export declare class TipoSolicitacao {
    private readonly _value;
    constructor(value: TipoSolicitacaoEnum);
    get value(): TipoSolicitacaoEnum;
    equals(other: TipoSolicitacao): boolean;
    toString(): string;
    static create(value: TipoSolicitacaoEnum): TipoSolicitacao;
    static createDesarquivamento(): TipoSolicitacao;
    static createCopia(): TipoSolicitacao;
    static createVista(): TipoSolicitacao;
    static createCertidao(): TipoSolicitacao;
    isDesarquivamento(): boolean;
    isCopia(): boolean;
    isVista(): boolean;
    isCertidao(): boolean;
    getDescription(): string;
    getDefaultDeadlineDays(): number;
    requiresPhysicalLocation(): boolean;
    allowsUrgency(): boolean;
    getColor(): string;
}
