declare const _default: (() => {
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    session: {
        secret: string;
        maxAge: number;
        secure: boolean;
        httpOnly: boolean;
        sameSite: "strict";
    };
    bcrypt: {
        rounds: number;
    };
    lockout: {
        maxAttempts: number;
        lockoutDuration: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    session: {
        secret: string;
        maxAge: number;
        secure: boolean;
        httpOnly: boolean;
        sameSite: "strict";
    };
    bcrypt: {
        rounds: number;
    };
    lockout: {
        maxAttempts: number;
        lockoutDuration: number;
    };
}>;
export default _default;
