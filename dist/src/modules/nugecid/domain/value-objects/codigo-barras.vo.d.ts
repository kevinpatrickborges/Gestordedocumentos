export declare class CodigoBarras {
    private readonly _value;
    private static readonly PATTERN;
    constructor(value: string);
    get value(): string;
    equals(other: CodigoBarras): boolean;
    toString(): string;
    static create(value: string): CodigoBarras;
    static generateNew(): CodigoBarras;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getSequence(): string;
}
