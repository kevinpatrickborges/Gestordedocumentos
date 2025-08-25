"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
describe('AuthService', () => {
    let service;
    let userRepository;
    let roleRepository;
    let auditoriaRepository;
    let jwtService;
    const mockUser = {
        id: 1,
        nome: 'Test User',
        usuario: 'testuser',
        senha: '$2b$12$hashedPassword',
        ativo: true,
        tentativasLogin: 0,
        bloqueadoAte: null,
        role: { id: 1, name: 'user' },
        validatePassword: jest.fn(),
        isBlocked: jest.fn().mockReturnValue(false),
        isAdmin: jest.fn().mockReturnValue(false),
    };
    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };
    const mockRoleRepository = {
        findOne: jest.fn(),
    };
    const mockAuditoriaRepository = {
        save: jest.fn(),
        create: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
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
        service = module.get(auth_service_1.AuthService);
        jest.spyOn(service['logger'], 'error').mockImplementation(() => { });
        jest.spyOn(service['logger'], 'warn').mockImplementation(() => { });
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        roleRepository = module.get((0, typeorm_1.getRepositoryToken)(role_entity_1.Role));
        auditoriaRepository = module.get((0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria));
        jwtService = module.get(jwt_1.JwtService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('login', () => {
        const loginDto = {
            usuario: 'test@itep.rn.gov.br',
            senha: 'password123',
        };
        it('should login user successfully', async () => {
            mockUser.validatePassword.mockResolvedValue(true);
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const result = await service.login(loginDto, '127.0.0.1', 'test-agent');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result.accessToken).toBe('mock-jwt-token');
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                usuario: mockUser.usuario,
                role: mockUser.role.name,
            }, { expiresIn: '50m' });
        });
        it('should throw UnauthorizedException for invalid credentials', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            await expect(service.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('loginV2', () => {
        const loginDto = {
            usuario: 'test@itep.rn.gov.br',
            senha: 'password123',
        };
        it('should login user successfully with v2 format', async () => {
            mockUser.validatePassword.mockResolvedValue(true);
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const result = await service.loginV2(loginDto, '127.0.0.1', 'test-agent');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('expiresIn');
            expect(result.expiresIn).toBe('50m');
            expect(result.user).toEqual({
                userId: mockUser.id,
                usuario: mockUser.usuario,
                role: mockUser.role.name,
            });
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                usuario: mockUser.usuario,
                role: mockUser.role.name,
            }, { expiresIn: '50m' });
        });
        it('should throw UnauthorizedException for invalid credentials', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.loginV2(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(new common_1.UnauthorizedException('Credenciais inválidas'));
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            jest
                .spyOn(service, 'validateUser')
                .mockRejectedValue(new common_1.UnauthorizedException('Usuário inativo'));
            await expect(service.loginV2(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(new common_1.UnauthorizedException('Usuário inativo'));
        });
        it('should throw UnauthorizedException for blocked user', async () => {
            jest
                .spyOn(service, 'validateUser')
                .mockRejectedValue(new common_1.UnauthorizedException('Usuário bloqueado'));
            await expect(service.loginV2(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(new common_1.UnauthorizedException('Usuário bloqueado'));
        });
    });
    describe('validateUser', () => {
        it('should validate user with correct credentials', async () => {
            mockUser.validatePassword.mockResolvedValue(true);
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            const result = await service.validateUser('test@itep.rn.gov.br', 'password123');
            expect(result).toEqual(mockUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { usuario: 'testuser' },
                relations: ['role'],
            });
        });
        it('should return null for non-existent user', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const result = await service.validateUser('nonexistent@itep.rn.gov.br', 'password123');
            expect(result).toBeNull();
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            const inactiveUser = { ...mockUser, ativo: false };
            mockUserRepository.findOne.mockResolvedValue(inactiveUser);
            await expect(service.validateUser('test@itep.rn.gov.br', 'password123')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException for blocked user', async () => {
            const blockedUser = {
                ...mockUser,
                isBlocked: jest.fn().mockReturnValue(true),
                bloqueadoAte: new Date(),
            };
            mockUserRepository.findOne.mockResolvedValue(blockedUser);
            await expect(service.validateUser('test@itep.rn.gov.br', 'password123')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should return null for invalid password', async () => {
            mockUser.validatePassword.mockResolvedValue(false);
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            const result = await service.validateUser('test@itep.rn.gov.br', 'wrongpassword');
            expect(result).toBeNull();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map