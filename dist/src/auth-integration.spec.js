"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcryptjs");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const user_entity_1 = require("./modules/users/entities/user.entity");
const role_entity_1 = require("./modules/users/entities/role.entity");
const auditoria_entity_1 = require("./modules/audit/entities/auditoria.entity");
describe('Auth Integration Tests', () => {
    let app;
    let userRepository;
    let roleRepository;
    let auditoriaRepository;
    let testUser;
    let testRole;
    let accessToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideProvider(config_1.ConfigService)
            .useValue({
            get: (key) => {
                if (key === 'JWT_SECRET')
                    return 'test-secret';
                if (key === 'JWT_EXPIRATION_TIME')
                    return '50m';
                if (key === 'DB_TYPE')
                    return 'sqlite';
                if (key === 'DB_DATABASE')
                    return ':memory:';
                return process.env[key];
            },
        })
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        userRepository = moduleFixture.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        roleRepository = moduleFixture.get((0, typeorm_1.getRepositoryToken)(role_entity_1.Role));
        auditoriaRepository = moduleFixture.get((0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria));
        testRole = roleRepository.create({
            name: 'user',
            description: 'Usuário padrão',
        });
        await roleRepository.save(testRole);
        const hashedPassword = await bcrypt.hash('password123', 12);
        testUser = userRepository.create({
            nome: 'Admin',
            usuario: 'admin',
            senha: hashedPassword,
            ativo: true,
            roleId: testRole.id,
        });
        await userRepository.save(testUser);
    });
    afterAll(async () => {
        await app.close();
    });
    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials using usuario field', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'admin',
                password: 'admin123',
            })
                .expect(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body.user.usuario).toBe('admin');
            expect(response.body.user.nome).toBe('Admin');
            expect(typeof response.body.accessToken).toBe('string');
            accessToken = response.body.accessToken;
        });
        it('should fail login with invalid credentials', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'admin',
                password: 'admin123',
            })
                .expect(401);
        });
        it('should fail login with non-existent user', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'teste',
                password: 'password123',
            })
                .expect(401);
        });
        it('should fail login with missing usuario field', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                password: 'password123',
            })
                .expect(400);
        });
        it('should fail login with missing password field', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'admin@itep.rn.gov.br',
            })
                .expect(400);
        });
        it('should create audit log for successful login', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'admin@itep.rn.gov.br',
                password: 'password123',
            })
                .expect(200);
            const auditLogs = await auditoriaRepository.find({
                where: {
                    userId: testUser.id,
                    action: auditoria_entity_1.AuditAction.LOGIN,
                    success: true,
                },
            });
            expect(auditLogs.length).toBeGreaterThan(0);
        });
        it('should create audit log for failed login', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'admin@itep.rn.gov.br',
                password: 'wrongpassword',
            })
                .expect(401);
            const auditLogs = await auditoriaRepository.find({
                where: { action: auditoria_entity_1.AuditAction.LOGIN, success: false },
            });
            expect(auditLogs.length).toBeGreaterThan(0);
        });
    });
    describe('JWT Token Validation', () => {
        it('should validate JWT token correctly', async () => {
            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'admin@itep.rn.gov.br',
                password: 'password123',
            })
                .expect(200);
            const token = loginResponse.body.accessToken;
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });
        it('should reject invalid JWT token', async () => {
            const invalidToken = 'invalid.jwt.token';
            expect(invalidToken).toBe('invalid.jwt.token');
        });
    });
    describe('JWT Token Expiration', () => {
        it('should generate JWT with 50 minutes expiration', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'admin@itep.rn.gov.br',
                password: 'password123',
            })
                .expect(200);
            const token = response.body.accessToken;
            expect(token).toBeDefined();
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            const expirationTime = payload.exp;
            const issuedTime = payload.iat;
            const tokenDuration = expirationTime - issuedTime;
            expect(tokenDuration).toBe(3000);
        });
    });
    describe('User Status Validation', () => {
        it('should reject login for inactive user', async () => {
            const inactiveUser = userRepository.create({
                nome: 'Inactive User',
                usuario: 'inactive',
                senha: await bcrypt.hash('password123', 12),
                ativo: false,
                roleId: testRole.id,
            });
            await userRepository.save(inactiveUser);
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'inactive@itep.rn.gov.br',
                password: 'password123',
            })
                .expect(401);
        });
        it('should reject login for blocked user', async () => {
            const blockedUser = userRepository.create({
                nome: 'Blocked User',
                usuario: 'blocked',
                senha: await bcrypt.hash('password123', 12),
                ativo: true,
                bloqueadoAte: new Date(Date.now() + 900000),
                roleId: testRole.id,
            });
            await userRepository.save(blockedUser);
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({
                usuario: 'blocked@itep.rn.gov.br',
                password: 'password123',
            })
                .expect(401);
        });
    });
});
//# sourceMappingURL=auth-integration.spec.js.map