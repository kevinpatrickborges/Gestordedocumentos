"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const user_entity_1 = require("../src/modules/users/entities/user.entity");
const role_entity_1 = require("../src/modules/users/entities/role.entity");
const auditoria_entity_1 = require("../src/modules/audit/entities/auditoria.entity");
describe('Authentication Integration Tests', () => {
    let app;
    let jwtService;
    const mockUser = {
        id: 1,
        nome: 'Test User',
        usuario: 'testuser',
        senha: 'hashedPassword',
        ativo: true,
        role: {
            id: 1,
            name: 'user',
        },
        validatePassword: jest.fn().mockResolvedValue(true),
        isBlocked: jest.fn().mockReturnValue(false),
        isAdmin: jest.fn().mockReturnValue(false),
        tentativasLogin: 0,
        ultimoLogin: new Date(),
    };
    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };
    const mockRoleRepository = {
        findOne: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
    };
    const mockAuditoriaRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider((0, typeorm_1.getRepositoryToken)(user_entity_1.User))
            .useValue(mockUserRepository)
            .overrideProvider((0, typeorm_1.getRepositoryToken)(role_entity_1.Role))
            .useValue(mockRoleRepository)
            .overrideProvider((0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria))
            .useValue(mockAuditoriaRepository)
            .compile();
        app = moduleFixture.createNestApplication();
        jwtService = moduleFixture.get(jwt_1.JwtService);
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/v2/auth/login', () => {
        it('should login successfully and return JWT with 50m expiration', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const loginDto = {
                usuario: 'testuser',
                password: 'password123',
            };
            const response = await request(app.getHttpServer())
                .post('/api/v2/auth/login')
                .send(loginDto)
                .expect(200);
            expect(response.body).toEqual({
                user: {
                    userId: 1,
                    usuario: 'testuser',
                    role: 'user',
                },
                accessToken: expect.any(String),
                expiresIn: '50m',
            });
        });
        it('should return 401 for invalid credentials', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const loginDto = {
                usuario: 'invaliduser',
                password: 'wrongpassword',
            };
            const response = await request(app.getHttpServer())
                .post('/api/v2/auth/login')
                .send(loginDto)
                .expect(401);
            expect(response.body.message).toBe('Credenciais inválidas');
        });
        it('should return 400 for invalid request body', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/auth/login')
                .send({})
                .expect(400);
        });
    });
    describe('Global JWT Protection', () => {
        it('should allow access to public login endpoint without token', async () => {
            await request(app.getHttpServer()).get('/auth/login').expect(200);
        });
        it('should allow access to public API v2 login endpoint without token', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const loginDto = {
                usuario: 'testuser',
                password: 'password123',
            };
            await request(app.getHttpServer())
                .post('/api/v2/auth/login')
                .send(loginDto)
                .expect(200);
        });
        it('should deny access to protected routes without token', async () => {
            await request(app.getHttpServer()).get('/auth/profile').expect(401);
            await request(app.getHttpServer()).get('/auth/check').expect(401);
        });
        it('should allow access to protected routes with valid token', async () => {
            const payload = {
                sub: 1,
                usuario: 'testuser',
                role: 'user',
            };
            const token = jwtService.sign(payload);
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            await request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });
        it('should deny access to protected routes with invalid token', async () => {
            await request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
        it('should deny access to protected routes with expired token', async () => {
            const payload = {
                sub: 1,
                usuario: 'testuser',
                role: 'user',
            };
            const expiredToken = jwtService.sign(payload, { expiresIn: '-1h' });
            await request(app.getHttpServer())
                .get('/auth/profile')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401);
        });
    });
    describe('JWT Token Validation', () => {
        it('should validate JWT token structure from API v2 login', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const loginDto = {
                usuario: 'testuser',
                password: 'password123',
            };
            const loginResponse = await request(app.getHttpServer())
                .post('/api/v2/auth/login')
                .send(loginDto)
                .expect(200);
            const { accessToken } = loginResponse.body;
            const decodedToken = jwtService.decode(accessToken);
            expect(decodedToken).toMatchObject({
                sub: 1,
                usuario: 'testuser',
                role: 'user',
                iat: expect.any(Number),
                exp: expect.any(Number),
            });
            const tokenLifetime = decodedToken.exp - decodedToken.iat;
            expect(tokenLifetime).toBeCloseTo(3000, -2);
        });
    });
});
//# sourceMappingURL=auth-integration.spec.js.map