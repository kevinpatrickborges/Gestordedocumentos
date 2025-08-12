export declare class NumeroRegistro {
    private readonly _value;
    private static readonly MIN_LENGTH;
    private static readonly MAX_LENGTH;
    constructor(value: string);
    get value(): string;
    equals(other: NumeroRegistro): boolean;
    toString(): string;
    static create(value: string): NumeroRegistro;
    static normalize(value: string): string;
    isYearFormat(): boolean;
    getYear(): number | null;
    getSequentialNumber(): string | null;
}
