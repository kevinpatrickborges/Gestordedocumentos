import { User } from '../../users/entities/user.entity';
export declare enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    EXPORT = "EXPORT",
    IMPORT = "IMPORT",
    VIEW = "VIEW"
}
export declare class Auditoria {
    id: number;
    userId: number;
    action: AuditAction;
    entityName: string;
    entityId: number;
    details: any;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    error: string;
    response: any;
    timestamp: Date;
    user: User;
    static createLoginAudit(userId: number, ipAddress: string, userAgent: string, success: boolean, error?: string): Partial<Auditoria>;
    static createLogoutAudit(userId: number, ipAddress: string, userAgent: string): Partial<Auditoria>;
    static createResourceAudit(userId: number, action: AuditAction, entityName: string, entityId: number, details: any, ipAddress: string, userAgent: string): Partial<Auditoria>;
    getActionLabel(): string;
    getResourceLabel(): string;
    isSuccessful(): boolean;
    hasError(): boolean;
}
