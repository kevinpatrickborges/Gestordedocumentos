export declare class Password {
    private readonly _hashedValue;
    private constructor();
    static create(plainPassword: string): Promise<Password>;
    static fromHash(hashedValue: string): Password;
    get hashedValue(): string;
    isValid(plainPassword: string): Promise<boolean>;
    equals(other: Password): boolean;
}
