declare const _default: (() => {
    name: string;
    version: string;
    description: string;
    port: number;
    host: string;
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
    baseUrl: string;
    frontendUrl: string;
    uploadPath: string;
    maxFileSize: number;
    allowedFileTypes: string[];
    defaultPageSize: number;
    maxPageSize: number;
    throttle: {
        ttl: number;
        limit: number;
    };
    cors: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    logging: {
        level: string;
        format: string;
        file: string;
    };
    security: {
        helmet: {
            contentSecurityPolicy: boolean;
            crossOriginEmbedderPolicy: boolean;
        };
        rateLimit: {
            windowMs: number;
            max: number;
        };
    };
    cache: {
        ttl: number;
        max: number;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
    };
    features: {
        enableAuditLog: boolean;
        enableFileUpload: boolean;
        enableNotifications: boolean;
        enableExcelImport: boolean;
        enableBarcodeGeneration: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    name: string;
    version: string;
    description: string;
    port: number;
    host: string;
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
    baseUrl: string;
    frontendUrl: string;
    uploadPath: string;
    maxFileSize: number;
    allowedFileTypes: string[];
    defaultPageSize: number;
    maxPageSize: number;
    throttle: {
        ttl: number;
        limit: number;
    };
    cors: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    logging: {
        level: string;
        format: string;
        file: string;
    };
    security: {
        helmet: {
            contentSecurityPolicy: boolean;
            crossOriginEmbedderPolicy: boolean;
        };
        rateLimit: {
            windowMs: number;
            max: number;
        };
    };
    cache: {
        ttl: number;
        max: number;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
    };
    features: {
        enableAuditLog: boolean;
        enableFileUpload: boolean;
        enableNotifications: boolean;
        enableExcelImport: boolean;
        enableBarcodeGeneration: boolean;
    };
}>;
export default _default;
