export declare class DesarquivamentoId {
    private readonly _value;
    constructor(value: number);
    get value(): number;
    equals(other: DesarquivamentoId): boolean;
    toString(): string;
    static create(value: number): DesarquivamentoId;
}
