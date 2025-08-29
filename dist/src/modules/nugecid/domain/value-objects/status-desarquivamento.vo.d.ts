export declare enum StatusDesarquivamentoEnum {
    FINALIZADO = "FINALIZADO",
    DESARQUIVADO = "DESARQUIVADO",
    NAO_COLETADO = "NAO_COLETADO",
    SOLICITADO = "SOLICITADO",
    REARQUIVAMENTO_SOLICITADO = "REARQUIVAMENTO_SOLICITADO",
    RETIRADO_PELO_SETOR = "RETIRADO_PELO_SETOR",
    NAO_LOCALIZADO = "NAO_LOCALIZADO"
}
export declare class StatusDesarquivamento {
    private readonly _value;
    private static readonly VALID_TRANSITIONS;
    constructor(value: StatusDesarquivamentoEnum);
    get value(): StatusDesarquivamentoEnum;
    equals(other: StatusDesarquivamento): boolean;
    toString(): string;
    static create(value: StatusDesarquivamentoEnum): StatusDesarquivamento;
    static createSolicitado(): StatusDesarquivamento;
    static createDesarquivado(): StatusDesarquivamento;
    static createFinalizado(): StatusDesarquivamento;
    static createNaoLocalizado(): StatusDesarquivamento;
    static createNaoColetado(): StatusDesarquivamento;
    static createRetiradoPeloSetor(): StatusDesarquivamento;
    static createRearquivamentoSolicitado(): StatusDesarquivamento;
    canTransitionTo(newStatus: StatusDesarquivamento): boolean;
    getValidTransitions(): StatusDesarquivamentoEnum[];
    isFinal(): boolean;
    isFinalized(): boolean;
    isDesarquivado(): boolean;
    isPending(): boolean;
    isInProgress(): boolean;
    canBeCancelled(): boolean;
    canBeCompleted(): boolean;
    getColor(): string;
    getDescription(): string;
}
