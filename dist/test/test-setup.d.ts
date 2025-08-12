import { TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { Role } from '../src/modules/users/entities/role.entity';
import { Desarquivamento } from '../src/modules/nugecid/entities/desarquivamento.entity';
import { Auditoria } from '../src/modules/audit/entities/auditoria.entity';
export declare class TestSetup {
    static createTestModule(additionalImports?: any[]): Promise<TestingModule>;
    static createTestRoles(roleRepository: Repository<Role>): Promise<{
        adminRole: Role;
        editorRole: Role;
        userRole: Role;
    }>;
    static createTestUsers(userRepository: Repository<User>, roles: {
        adminRole: Role;
        editorRole: Role;
        userRole: Role;
    }): Promise<{
        adminUser: User;
        editorUser: User;
        regularUser: User;
    }>;
    static cleanupTestData(desarquivamentoRepository: Repository<Desarquivamento>, auditoriaRepository: Repository<Auditoria>): Promise<void>;
    static generateJwtTokens(jwtService: any, users: any): {
        adminToken: any;
        editorToken: any;
        userToken: any;
    };
}
export declare class ACLTestHelpers {
    static testCanAccess(app: any, endpoint: string, token: string, expectedStatus?: number): Promise<any>;
    static testCanEdit(app: any, endpoint: string, token: string, data: any, expectedStatus?: number): Promise<any>;
    static testCanDelete(app: any, endpoint: string, token: string, expectedStatus?: number): Promise<any>;
    static testCanCreate(app: any, endpoint: string, token: string, data: any, expectedStatus?: number): Promise<any>;
}
export declare class TestMocks {
    static createMockRepository(): {
        find: jest.Mock<any, any, any>;
        findOne: jest.Mock<any, any, any>;
        findAndCount: jest.Mock<any, any, any>;
        create: jest.Mock<any, any, any>;
        save: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
        softDelete: jest.Mock<any, any, any>;
        restore: jest.Mock<any, any, any>;
        createQueryBuilder: jest.Mock<{
            where: jest.Mock<any, any, any>;
            andWhere: jest.Mock<any, any, any>;
            orWhere: jest.Mock<any, any, any>;
            leftJoinAndSelect: jest.Mock<any, any, any>;
            orderBy: jest.Mock<any, any, any>;
            skip: jest.Mock<any, any, any>;
            take: jest.Mock<any, any, any>;
            getMany: jest.Mock<any, any, any>;
            getOne: jest.Mock<any, any, any>;
            getManyAndCount: jest.Mock<any, any, any>;
            withDeleted: jest.Mock<any, any, any>;
        }, [], any>;
    };
    static createMockUser(overrides?: Partial<User>): User;
    static createMockAdminUser(roles: {
        adminRole: Role;
    }, overrides?: Partial<User>): User;
    static createMockDesarquivamento(overrides?: Partial<Desarquivamento>): Desarquivamento;
    static createMockJwtService(): {
        sign: jest.Mock<string, [payload: any], any>;
        verify: jest.Mock<{
            sub: number;
            usuario: string;
        }, [], any>;
    };
    static createMockAuditoriaService(): {
        logAction: jest.Mock<any, any, any>;
        logCreate: jest.Mock<any, any, any>;
        logUpdate: jest.Mock<any, any, any>;
        logDelete: jest.Mock<any, any, any>;
    };
}
export declare const TEST_CONSTANTS: {
    DEFAULT_PASSWORD: string;
    JWT_SECRET: string;
    PAGINATION: {
        DEFAULT_PAGE: number;
        DEFAULT_LIMIT: number;
        MAX_LIMIT: number;
    };
    ROLES: {
        ADMIN: string;
        EDITOR: string;
        USER: string;
    };
    STATUS: {
        PENDENTE: string;
        EM_ANDAMENTO: string;
        CONCLUIDO: string;
        CANCELADO: string;
    };
    TIPOS: {
        COPIA_SIMPLES: string;
        COPIA_AUTENTICADA: string;
        VISTA: string;
    };
};
