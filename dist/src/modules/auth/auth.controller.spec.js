"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
describe('AuthController', () => {
    let controller;
    let userRepository;
    let roleRepository;
    let auditoriaRepository;
    let jwtService;
    const mockUser = {
        id: 1,
        nome: 'Test User',
        usuario: 'test@example.com',
        senha: 'hashedPassword',
        ativo: true,
        role: {
            id: 1,
            name: 'user',
        },
        validatePassword: jest.fn().mockResolvedValue(true),
        isBlocked: jest.fn().mockReturnValue(false),
        isAdmin: jest.fn().mockReturnValue(false),
    };
    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };
    const mockRoleRepository = {
        findOne: jest.fn(),
    };
    const mockAuditoriaRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };
    const mockAuthService = {
        login: jest.fn(),
        loginV2: jest.fn(),
        logout: jest.fn(),
        validateJwtPayload: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                {
                    provide: auth_service_1.AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(role_entity_1.Role),
                    useValue: mockRoleRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria),
                    useValue: mockAuditoriaRepository,
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        jest.spyOn(controller['logger'], 'error').mockImplementation(() => { });
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        roleRepository = module.get((0, typeorm_1.getRepositoryToken)(role_entity_1.Role));
        auditoriaRepository = module.get((0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria));
        jwtService = module.get(jwt_1.JwtService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('loginV2', () => {
        const loginDto = {
            usuario: 'testuser',
            senha: 'password123',
        };
        it('should return JWT token with 50m expiration on successful login', async () => {
            const mockResponse = {
                user: {
                    userId: 1,
                    usuario: 'testuser',
                    role: 'user',
                },
                accessToken: 'mock-jwt-token-50m',
                expiresIn: '50m',
            };
            mockAuthService.loginV2.mockResolvedValue(mockResponse);
            const result = await controller.loginV2(loginDto, '127.0.0.1', 'test-agent');
            expect(result).toEqual(mockResponse);
            expect(mockAuthService.loginV2).toHaveBeenCalledWith(loginDto, '127.0.0.1', 'test-agent');
        });
        it('should throw UnauthorizedException for invalid credentials', async () => {
            mockAuthService.loginV2.mockRejectedValue(new common_1.UnauthorizedException('Credenciais inválidas'));
            await expect(controller.loginV2(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(new common_1.UnauthorizedException('Credenciais inválidas'));
            expect(mockAuthService.loginV2).toHaveBeenCalledWith(loginDto, '127.0.0.1', 'test-agent');
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            mockAuthService.loginV2.mockRejectedValue(new common_1.UnauthorizedException('Usuário inativo'));
            await expect(controller.loginV2(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(new common_1.UnauthorizedException('Usuário inativo'));
        });
        it('should throw UnauthorizedException for blocked user', async () => {
            mockAuthService.loginV2.mockRejectedValue(new common_1.UnauthorizedException('Usuário bloqueado'));
            await expect(controller.loginV2(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(new common_1.UnauthorizedException('Usuário bloqueado'));
        });
        it('should call authService.loginV2 with correct parameters', async () => {
            const loginDto = {
                usuario: 'testuser',
                senha: 'password123',
            };
            const mockResponse = {
                user: {
                    userId: 1,
                    usuario: 'testuser',
                    role: 'USER',
                },
                accessToken: 'jwt-token',
                expiresIn: '50m',
            };
            mockAuthService.loginV2.mockResolvedValue(mockResponse);
            const result = await controller.loginV2(loginDto, '127.0.0.1', 'test-agent');
            expect(result).toEqual(mockResponse);
            expect(mockAuthService.loginV2).toHaveBeenCalledWith(loginDto, '127.0.0.1', 'test-agent');
        });
        it('should handle service errors properly', async () => {
            const loginDto = {
                usuario: 'testuser',
                senha: 'wrongpassword',
            };
            mockAuthService.loginV2.mockRejectedValue(new common_1.UnauthorizedException('Credenciais inválidas'));
            await expect(controller.loginV2(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(common_1.UnauthorizedException);
            expect(mockAuthService.loginV2).toHaveBeenCalledWith(loginDto, '127.0.0.1', 'test-agent');
        });
    });
});
//# sourceMappingURL=auth.controller.spec.js.map