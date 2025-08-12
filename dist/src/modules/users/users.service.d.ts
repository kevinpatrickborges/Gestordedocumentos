import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
export interface PaginatedUsers {
    users: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class UsersService {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly auditoriaRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, auditoriaRepository: Repository<Auditoria>);
    create(createUserDto: CreateUserDto, currentUser: User): Promise<User>;
    findAll(queryDto: QueryUsersDto): Promise<PaginatedUsers>;
    findOne(id: number): Promise<User>;
    findByUsuario(usuario: string): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto, currentUser: User): Promise<User>;
    remove(id: number, currentUser: User): Promise<void>;
    reactivate(id: number, currentUser: User): Promise<User>;
    findAllRoles(): Promise<Role[]>;
    getStats(): Promise<{
        total: number;
        ativos: number;
        inativos: number;
        bloqueados: number;
        porRole: {
            role: string;
            count: number;
        }[];
    }>;
    private saveAudit;
}
