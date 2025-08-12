"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_CONSTANTS = exports.TestMocks = exports.ACLTestHelpers = exports.TestSetup = void 0;
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../src/modules/users/entities/user.entity");
const role_entity_1 = require("../src/modules/users/entities/role.entity");
const desarquivamento_entity_1 = require("../src/modules/nugecid/entities/desarquivamento.entity");
const auditoria_entity_1 = require("../src/modules/audit/entities/auditoria.entity");
const desarquivamento_entity_2 = require("../src/modules/nugecid/entities/desarquivamento.entity");
const tipo_solicitacao_vo_1 = require("../src/modules/nugecid/domain/value-objects/tipo-solicitacao.vo");
class TestSetup {
    static async createTestModule(additionalImports = []) {
        return testing_1.Test.createTestingModule({
            imports: [
                typeorm_1.TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [user_entity_1.User, role_entity_1.Role, desarquivamento_entity_1.Desarquivamento, auditoria_entity_1.Auditoria],
                    synchronize: true,
                    logging: false,
                    dropSchema: true,
                }),
                typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role, desarquivamento_entity_1.Desarquivamento, auditoria_entity_1.Auditoria]),
                jwt_1.JwtModule.register({
                    secret: 'test-secret-key-for-nugecid-tests',
                    signOptions: { expiresIn: '1h' },
                }),
                ...additionalImports,
            ],
        }).compile();
    }
    static async createTestRoles(roleRepository) {
        const adminRole = await roleRepository.save(roleRepository.create({
            name: 'admin',
            description: 'Administrator Role',
            permissions: ['*'],
            ativo: true,
        }));
        const editorRole = await roleRepository.save(roleRepository.create({
            name: 'editor',
            description: 'Editor Role',
            permissions: ['read', 'write', 'update'],
            ativo: true,
        }));
        const userRole = await roleRepository.save(roleRepository.create({
            name: 'user',
            description: 'User Role',
            permissions: ['read'],
            ativo: true,
        }));
        return { adminRole, editorRole, userRole };
    }
    static async createTestUsers(userRepository, roles) {
        const adminUser = userRepository.create({
            nome: 'Admin',
            usuario: 'admin',
            senha: await bcrypt.hash('admin', 12),
            role: roles.adminRole,
            ativo: true,
            tentativasLogin: 0,
        });
        await userRepository.save(adminUser);
        const editorUser = userRepository.create({
            nome: 'Editor Test User',
            usuario: 'editor',
            senha: await bcrypt.hash('editor123!@#', 12),
            role: roles.editorRole,
            ativo: true,
            tentativasLogin: 0,
        });
        await userRepository.save(editorUser);
        const regularUser = userRepository.create({
            nome: 'Regular Test User',
            usuario: 'user',
            senha: await bcrypt.hash('user123!@#', 12),
            role: roles.userRole,
            ativo: true,
            tentativasLogin: 0,
        });
        await userRepository.save(regularUser);
        return { adminUser, editorUser, regularUser };
    }
    static async cleanupTestData(desarquivamentoRepository, auditoriaRepository) {
        await desarquivamentoRepository.delete({});
        await auditoriaRepository.delete({});
    }
    static generateJwtTokens(jwtService, users) {
        return {
            adminToken: jwtService.sign({
                sub: users.adminUser.id,
                usuario: users.adminUser.usuario,
                role: users.adminUser.role.name,
            }),
            editorToken: jwtService.sign({
                sub: users.editorUser.id,
                usuario: users.editorUser.usuario,
                role: users.editorUser.role.name,
            }),
            userToken: jwtService.sign({
                sub: users.regularUser.id,
                usuario: users.regularUser.usuario,
                role: users.regularUser.role.name,
            }),
        };
    }
}
exports.TestSetup = TestSetup;
class ACLTestHelpers {
    static async testCanAccess(app, endpoint, token, expectedStatus = 200) {
        const response = await app
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(expectedStatus);
        return response;
    }
    static async testCanEdit(app, endpoint, token, data, expectedStatus = 200) {
        const response = await app
            .patch(endpoint)
            .set('Authorization', `Bearer ${token}`)
            .send(data);
        expect(response.status).toBe(expectedStatus);
        return response;
    }
    static async testCanDelete(app, endpoint, token, expectedStatus = 200) {
        const response = await app
            .delete(endpoint)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(expectedStatus);
        return response;
    }
    static async testCanCreate(app, endpoint, token, data, expectedStatus = 201) {
        const response = await app
            .post(endpoint)
            .set('Authorization', `Bearer ${token}`)
            .send(data);
        expect(response.status).toBe(expectedStatus);
        return response;
    }
}
exports.ACLTestHelpers = ACLTestHelpers;
class TestMocks {
    static createMockRepository() {
        return {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orWhere: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn(),
                getOne: jest.fn(),
                getManyAndCount: jest.fn(),
                withDeleted: jest.fn().mockReturnThis(),
            })),
        };
    }
    static createMockUser(overrides = {}) {
        const defaultUser = {
            id: 1,
            nome: 'Test User',
            usuario: 'testuser',
            senha: 'hashedPassword',
            ativo: true,
            tentativasLogin: 0,
            roleId: 1,
            ultimoLogin: null,
            bloqueadoAte: null,
            tokenReset: null,
            tokenResetExpira: null,
            deletedAt: null,
            desarquivamentos: [],
            auditorias: [],
            role: {
                id: 1,
                name: 'editor',
                description: 'Editor Role',
                permissions: ['read', 'write'],
                ativo: true,
                isAdmin: () => false,
                isEditor: () => true,
                hasPermission: (permission) => ['read', 'write'].includes(permission),
            },
            hashPassword: jest.fn(),
            validatePassword: jest.fn(() => Promise.resolve(true)),
            isAdmin: () => false,
            isEditor: () => true,
            canManageUser: () => false,
            canViewAllRecords: () => false,
            isBlocked: () => false,
            toJSON: jest.fn(),
            serialize: jest.fn(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return { ...defaultUser, ...overrides };
    }
    static createMockAdminUser(roles, overrides = {}) {
        return TestMocks.createMockUser({
            role: roles.adminRole,
            isAdmin: () => true,
            isEditor: () => false,
            canViewAllRecords: () => true,
            ...overrides,
        });
    }
    static createMockDesarquivamento(overrides = {}) {
        const defaultDesarquivamento = {
            id: 1,
            codigoBarras: 'TEST123456789',
            tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.COPIA,
            nomeSolicitante: 'Test Requerente',
            numeroRegistro: '2024001',
            finalidade: 'Test Purpose',
            status: desarquivamento_entity_2.StatusDesarquivamento.PENDENTE,
            urgente: false,
            createdBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            canBeAccessedBy: jest.fn(() => true),
            canBeEditedBy: jest.fn(() => true),
            canBeDeletedBy: jest.fn(() => true),
            isOverdue: jest.fn(() => false),
            getStatusDisplay: jest.fn(() => 'Pendente'),
        };
        return { ...defaultDesarquivamento, ...overrides };
    }
    static createMockJwtService() {
        return {
            sign: jest.fn((payload) => `mock.jwt.token.${payload.sub}`),
            verify: jest.fn(() => ({ sub: 1, usuario: 'testuser' })),
        };
    }
    static createMockAuditoriaService() {
        return {
            logAction: jest.fn(),
            logCreate: jest.fn(),
            logUpdate: jest.fn(),
            logDelete: jest.fn(),
        };
    }
}
exports.TestMocks = TestMocks;
exports.TEST_CONSTANTS = {
    DEFAULT_PASSWORD: 'test123!@#',
    JWT_SECRET: 'test-secret-key-for-nugecid-tests',
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
    ROLES: {
        ADMIN: 'admin',
        EDITOR: 'editor',
        USER: 'user',
    },
    STATUS: {
        PENDENTE: 'PENDENTE',
        EM_ANDAMENTO: 'EM_ANDAMENTO',
        CONCLUIDO: 'CONCLUIDO',
        CANCELADO: 'CANCELADO',
    },
    TIPOS: {
        COPIA_SIMPLES: 'COPIA_SIMPLES',
        COPIA_AUTENTICADA: 'COPIA_AUTENTICADA',
        VISTA: 'VISTA',
    },
};
//# sourceMappingURL=test-setup.js.map