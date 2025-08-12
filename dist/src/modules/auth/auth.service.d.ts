import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export interface JwtPayload {
    sub: number;
    usuario: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface LoginResponse {
    user: Omit<User, 'senha'>;
    accessToken: string;
    refreshToken?: string;
}
export interface LoginV2Response {
    user: {
        userId: number;
        usuario: string;
        role: string;
    };
    accessToken: string;
    expiresIn: string;
}
export declare class AuthService {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly auditoriaRepository;
    private readonly jwtService;
    private readonly logger;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, auditoriaRepository: Repository<Auditoria>, jwtService: JwtService);
    validateUser(usuario: string, password: string): Promise<User | null>;
    login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<LoginResponse>;
    loginV2(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<LoginV2Response>;
    validateJwtPayload(payload: JwtPayload): Promise<User | null>;
    register(registerDto: RegisterDto, currentUser: User): Promise<User>;
    logout(userId: number, ipAddress: string, userAgent: string): Promise<void>;
    findUserById(id: number): Promise<User>;
    private handleFailedLogin;
    private handleSuccessfulLogin;
    private saveLoginAudit;
    private saveLogoutAudit;
    private sanitizeUser;
}
