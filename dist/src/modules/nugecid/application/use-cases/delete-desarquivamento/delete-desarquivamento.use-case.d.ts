import { IDesarquivamentoRepository } from '../../../domain';
export interface DeleteDesarquivamentoRequest {
    id: number;
    userId: number;
    userRoles: string[];
    permanent?: boolean;
}
export interface DeleteDesarquivamentoResponse {
    success: boolean;
    message: string;
    deletedAt?: Date;
}
export declare class DeleteDesarquivamentoUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: DeleteDesarquivamentoRequest): Promise<DeleteDesarquivamentoResponse>;
    private validateRequest;
    private checkPermissions;
    private performSoftDelete;
    private performHardDelete;
}
export declare class RestoreDesarquivamentoUseCase {
    private readonly desarquivamentoRepository;
    constructor(desarquivamentoRepository: IDesarquivamentoRepository);
    execute(request: {
        id: number;
        userId: number;
        userRoles: string[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
