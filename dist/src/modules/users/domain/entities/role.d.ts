import { RoleId } from '../value-objects/role-id';
export interface RoleProps {
    id?: RoleId;
    nome: string;
    descricao?: string;
    permissoes: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Role {
    private _id?;
    private _nome;
    private _descricao?;
    private _permissoes;
    private _createdAt;
    private _updatedAt;
    constructor(props: RoleProps);
    private validateProps;
    get id(): RoleId | undefined;
    get nome(): string;
    get descricao(): string | undefined;
    get permissoes(): string[];
    get createdAt(): Date;
    get updatedAt(): Date;
    hasPermission(permission: string): boolean;
    addPermission(permission: string): void;
    removePermission(permission: string): void;
    updateDescricao(descricao: string): void;
    equals(other: Role): boolean;
}
