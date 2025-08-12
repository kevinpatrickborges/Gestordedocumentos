export declare class Usuario {
    private readonly _value;
    constructor(value: string);
    private validate;
    get value(): string;
    equals(other: Usuario): boolean;
    toString(): string;
    static create(value: string): Usuario;
}
