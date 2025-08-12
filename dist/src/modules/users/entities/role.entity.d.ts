import { User } from './user.entity';
export declare class Role {
    id: number;
    name: string;
    description: string;
    permissions: string[];
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
    hasPermission(permission: string): boolean;
    isAdmin(): boolean;
    isEditor(): boolean;
}
