import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../src/modules/users/entities/user.entity';
import { Role } from '../src/modules/users/entities/role.entity';
import { Desarquivamento } from '../src/modules/nugecid/entities/desarquivamento.entity';
import { Auditoria } from '../src/modules/audit/entities/auditoria.entity';
import { StatusDesarquivamento } from '../src/modules/nugecid/entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from '../src/modules/nugecid/domain/value-objects/tipo-solicitacao.vo';

/**
 * Configuração base para testes de integração
 */
export class TestSetup {
  static async createTestModule(additionalImports: any[] = []) {
    return Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Role, Desarquivamento, Auditoria],
          synchronize: true,
          logging: false,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User, Role, Desarquivamento, Auditoria]),
        JwtModule.register({
          secret: 'test-secret-key-for-nugecid-tests',
          signOptions: { expiresIn: '1h' },
        }),
        ...additionalImports,
      ],
    }).compile();
  }

  /**
   * Cria roles de teste padrão
   */
  static async createTestRoles(roleRepository: Repository<Role>) {
    const adminRole = await roleRepository.save(
      roleRepository.create({
        name: 'admin',
        description: 'Administrator Role',
        permissions: ['*'],
        ativo: true,
      }),
    );

    const editorRole = await roleRepository.save(
      roleRepository.create({
        name: 'editor',
        description: 'Editor Role',
        permissions: ['read', 'write', 'update'],
        ativo: true,
      }),
    );

    const userRole = await roleRepository.save(
      roleRepository.create({
        name: 'user',
        description: 'User Role',
        permissions: ['read'],
        ativo: true,
      }),
    );

    return { adminRole, editorRole, userRole };
  }

  /**
   * Cria usuários de teste
   */
  static async createTestUsers(
    userRepository: Repository<User>,
    roles: { adminRole: Role; editorRole: Role; userRole: Role },
  ) {
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

  /**
   * Limpa dados de teste
   */
  static async cleanupTestData(
    desarquivamentoRepository: Repository<Desarquivamento>,
    auditoriaRepository: Repository<Auditoria>,
  ) {
    await desarquivamentoRepository.delete({});
    await auditoriaRepository.delete({});
  }

  /**
   * Gera tokens JWT para testes
   */
  static generateJwtTokens(jwtService: any, users: any) {
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

/**
 * Helpers para validação de ACL
 */
export class ACLTestHelpers {
  /**
   * Testa se um usuário pode acessar um recurso
   */
  static async testCanAccess(
    app: any,
    endpoint: string,
    token: string,
    expectedStatus: number = 200,
  ) {
    const response = await app
      .get(endpoint)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(expectedStatus);
    return response;
  }

  /**
   * Testa se um usuário pode editar um recurso
   */
  static async testCanEdit(
    app: any,
    endpoint: string,
    token: string,
    data: any,
    expectedStatus: number = 200,
  ) {
    const response = await app
      .patch(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    expect(response.status).toBe(expectedStatus);
    return response;
  }

  /**
   * Testa se um usuário pode deletar um recurso
   */
  static async testCanDelete(
    app: any,
    endpoint: string,
    token: string,
    expectedStatus: number = 200,
  ) {
    const response = await app
      .delete(endpoint)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(expectedStatus);
    return response;
  }

  /**
   * Testa se um usuário pode criar um recurso
   */
  static async testCanCreate(
    app: any,
    endpoint: string,
    token: string,
    data: any,
    expectedStatus: number = 201,
  ) {
    const response = await app
      .post(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    expect(response.status).toBe(expectedStatus);
    return response;
  }
}

/**
 * Mocks para testes unitários
 */
export class TestMocks {
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

  static createMockUser(overrides: Partial<User> = {}): User {
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
        hasPermission: (permission: string) =>
          ['read', 'write'].includes(permission),
      } as Role,
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
    } as User;

    return { ...defaultUser, ...overrides } as User;
  }

  static createMockAdminUser(
    roles: { adminRole: Role },
    overrides: Partial<User> = {},
  ): User {
    return TestMocks.createMockUser({
      role: roles.adminRole,
      isAdmin: () => true,
      isEditor: () => false,
      canViewAllRecords: () => true,
      ...overrides,
    });
  }

  static createMockDesarquivamento(
    overrides: Partial<Desarquivamento> = {},
  ): Desarquivamento {
    const defaultDesarquivamento = {
      id: 1,
      codigoBarras: 'TEST123456789',
      tipoSolicitacao: TipoSolicitacaoEnum.COPIA,
      nomeSolicitante: 'Test Requerente',
      numeroRegistro: '2024001',
      finalidade: 'Test Purpose',
      status: StatusDesarquivamento.PENDENTE,
      urgente: false,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      canBeAccessedBy: jest.fn(() => true),
      canBeEditedBy: jest.fn(() => true),
      canBeDeletedBy: jest.fn(() => true),
      isOverdue: jest.fn(() => false),
      getStatusDisplay: jest.fn(() => 'Pendente'),
    } as Partial<Desarquivamento>;

    return { ...defaultDesarquivamento, ...overrides } as Desarquivamento;
  }

  static createMockJwtService() {
    return {
      sign: jest.fn(payload => `mock.jwt.token.${payload.sub}`),
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

/**
 * Constantes para testes
 */
export const TEST_CONSTANTS = {
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
