import { Role } from './role.entity';
import { Auditoria } from '../../audit/entities/auditoria.entity';
export declare class User {
    id: number;
    nome: string;
    usuario: string;
    senha: string;
    roleId: number;
    role: Role;
    ultimoLogin: Date;
    ativo: boolean;
    tentativasLogin: number;
    bloqueadoAte: Date;
    tokenReset: string;
    tokenResetExpira: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    auditorias: Auditoria[];
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    isAdmin(): boolean;
    isEditor(): boolean;
    canManageUser(targetUserId: number): boolean;
    canViewAllRecords(): boolean;
    isBlocked(): boolean;
    toJSON(): Omit<this, "senha" | "tokenReset" | "tokenResetExpira" | "hashPassword" | "validatePassword" | "isAdmin" | "isEditor" | "canManageUser" | "canViewAllRecords" | "isBlocked" | "toJSON" | "serialize">;
    serialize(): Omit<this, "senha" | "tokenReset" | "tokenResetExpira" | "hashPassword" | "validatePassword" | "isAdmin" | "isEditor" | "canManageUser" | "canViewAllRecords" | "isBlocked" | "toJSON" | "serialize">;
}
