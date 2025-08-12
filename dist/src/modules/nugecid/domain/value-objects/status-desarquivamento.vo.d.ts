export declare enum StatusDesarquivamentoEnum {
    PENDENTE = "PENDENTE",
    EM_ANDAMENTO = "EM_ANDAMENTO",
    CONCLUIDO = "CONCLUIDO",
    CANCELADO = "CANCELADO"
}
export declare class StatusDesarquivamento {
    private readonly _value;
    private static readonly VALID_TRANSITIONS;
    constructor(value: StatusDesarquivamentoEnum);
    get value(): StatusDesarquivamentoEnum;
    equals(other: StatusDesarquivamento): boolean;
    toString(): string;
    static create(value: StatusDesarquivamentoEnum): StatusDesarquivamento;
    static createPendente(): StatusDesarquivamento;
    static createEmAndamento(): StatusDesarquivamento;
    static createConcluido(): StatusDesarquivamento;
    static createCancelado(): StatusDesarquivamento;
    canTransitionTo(newStatus: StatusDesarquivamento): boolean;
    getValidTransitions(): StatusDesarquivamentoEnum[];
    isFinal(): boolean;
    isCancelled(): boolean;
    isInProgress(): boolean;
    isPending(): boolean;
    canBeCancelled(): boolean;
    canBeCompleted(): boolean;
    getColor(): string;
    getDescription(): string;
}
