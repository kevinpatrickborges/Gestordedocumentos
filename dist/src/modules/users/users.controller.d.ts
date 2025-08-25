import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { CreateUserUseCase, UpdateUserUseCase, DeleteUserUseCase, GetUserByIdUseCase, GetUsersUseCase, RestoreUserUseCase, GetUserStatisticsUseCase, GetRolesUseCase } from './application/use-cases';
import { CreateUserDto } from './application/dto/create-user.dto';
import { UpdateUserDto } from './application/dto/update-user.dto';
import { QueryUsersDto } from './application/dto/query-users.dto';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly createUserUseCase;
    private readonly updateUserUseCase;
    private readonly deleteUserUseCase;
    private readonly getUserByIdUseCase;
    private readonly getUsersUseCase;
    private readonly restoreUserUseCase;
    private readonly getUserStatisticsUseCase;
    private readonly getRolesUseCase;
    constructor(createUserUseCase: CreateUserUseCase, updateUserUseCase: UpdateUserUseCase, deleteUserUseCase: DeleteUserUseCase, getUserByIdUseCase: GetUserByIdUseCase, getUsersUseCase: GetUsersUseCase, restoreUserUseCase: RestoreUserUseCase, getUserStatisticsUseCase: GetUserStatisticsUseCase, getRolesUseCase: GetRolesUseCase);
    findAll(query: QueryUsersDto): Promise<{
        success: boolean;
        data: any;
        meta: {
            total: any;
            page: any;
            limit: any;
            totalPages: any;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findAllApi(query: QueryUsersDto): Promise<{
        success: boolean;
        data: any;
        meta: {
            total: any;
            page: any;
            limit: any;
            totalPages: any;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    createPage(): Promise<{
        title: string;
        roles: import("./entities/role.entity").Role[];
    }>;
    create(createUserDto: CreateUserDto, currentUser: User, req: ExpressRequest, res: ExpressResponse): Promise<void | ExpressResponse<any, Record<string, any>>>;
    getStats(): Promise<import("./domain/repositories").UserStatistics>;
    findAllRoles(): Promise<import("./entities/role.entity").Role[]>;
    findOne(id: number, req: ExpressRequest): Promise<User | {
        title: string;
        user: User;
    }>;
    detailPage(id: number): Promise<{
        title: string;
        user: User;
    }>;
    editPage(id: number): Promise<{
        title: string;
        user: User;
        roles: import("./entities/role.entity").Role[];
    }>;
    update(id: number, updateUserDto: UpdateUserDto, currentUser: User, req: ExpressRequest, res: ExpressResponse): Promise<void | ExpressResponse<any, Record<string, any>>>;
    remove(id: number, currentUser: User, req: ExpressRequest, res: ExpressResponse): Promise<void | ExpressResponse<any, Record<string, any>>>;
    reactivate(id: number, currentUser: User, req: ExpressRequest, res: ExpressResponse): Promise<void | ExpressResponse<any, Record<string, any>>>;
    profilePage(currentUser: User): Promise<{
        title: string;
        user: User;
        isOwnProfile: boolean;
    }>;
}
