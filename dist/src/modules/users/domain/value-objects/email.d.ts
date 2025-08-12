export declare class Email {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    private isValidEmail;
    equals(other: Email): boolean;
    toString(): string;
}
