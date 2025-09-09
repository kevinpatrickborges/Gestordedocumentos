import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    loginPage(req: ExpressRequest): {
        redirect: string;
        title?: undefined;
        error?: undefined;
        message?: undefined;
    } | {
        title: string;
        error: string | import("qs").ParsedQs | (string | import("qs").ParsedQs)[];
        message: string | import("qs").ParsedQs | (string | import("qs").ParsedQs)[];
        redirect?: undefined;
    };
    login(loginDto: LoginDto, req: ExpressRequest, res: ExpressResponse, ipAddress: string, userAgent: string): Promise<void | ExpressResponse<any, Record<string, any>>>;
    register(registerDto: RegisterDto, currentUser: User): Promise<User>;
    logout(req: ExpressRequest, res: ExpressResponse, ipAddress: string, userAgent: string): Promise<void | ExpressResponse<any, Record<string, any>>>;
    getProfile(currentUser: User): Promise<{
        id: number;
        nome: string;
        usuario: string;
        role: {
            id: number;
            name: string;
            description: string;
            permissions: string[];
        };
        ultimoLogin: Date;
        criadoEm: Date;
    }>;
    checkAuth(user: User): Promise<{
        authenticated: boolean;
        user: {
            id: number;
            nome: string;
            usuario: string;
            role: string;
        };
    }>;
    loginV2(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<import("./auth.service").LoginV2Response>;
    refreshToken(body: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        expiresIn: string;
    }>;
    getOnlineUsers(): Promise<{
        id: number;
        nome: string;
        usuario: string;
        role: string;
    }[]>;
}
