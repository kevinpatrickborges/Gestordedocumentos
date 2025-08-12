import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entidades
import { User } from '../src/modules/users/entities/user.entity';
import { Role } from '../src/modules/users/entities/role.entity';
import { Desarquivamento } from '../src/modules/nugecid/entities/desarquivamento.entity';
import { Auditoria } from '../src/modules/audit/entities/auditoria.entity';

// Factories
import { UserFactory } from './factories/user.factory';
import { RoleFactory } from './factories/role.factory';
import { DesarquivamentoFactory } from './factories/desarquivamento.factory';

export class TestBed {
  private _module: TestingModule;
  private _app: INestApplication;

  private constructor(module: TestingModule, app: INestApplication) {
    this._module = module;
    this._app = app;
  }

  public static async init(imports: any[] = []): Promise<TestBed> {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Role, Desarquivamento, Auditoria],
          synchronize: true,
          logging: false,
          dropSchema: true,
          extra: {
            // Desabilita foreign key constraints para testes
            pragma: 'PRAGMA foreign_keys = OFF;'
          },
        }),
        TypeOrmModule.forFeature([User, Role, Desarquivamento, Auditoria]),
        JwtModule.register({
          secret: 'test-secret-for-e2e',
          signOptions: { expiresIn: '1h' },
        }),
        ...imports,
      ],
    }).compile();

    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    return new TestBed(module, app);
  }

  public getApp(): INestApplication {
    return this._app;
  }

  public getService<T>(service: new (...args: any[]) => T): T {
    return this._module.get<T>(service);
  }

  public getRepository<T>(entity: new (...args: any[]) => T): Repository<T> {
    return this._module.get<Repository<T>>(getRepositoryToken(entity));
  }

  public async createAuthenticatedUser(roleName: 'admin' | 'editor' | 'user'): Promise<string> {
    const roleRepository = this.getRepository(Role);
    const userRepository = this.getRepository(User);
    const jwtService = this.getService(JwtService);

    const roleData = RoleFactory.build({ name: roleName });
    const role = await roleRepository.save(roleData);

    const userData = UserFactory.build({ usuario: roleName, role: role });
    const user = userRepository.create(userData);
    await userRepository.save(user);

    return jwtService.sign({ sub: user.id, usuario: user.usuario, role: user.role.name });
  }

  public async createDesarquivamento(createdBy: User, data: Partial<Desarquivamento> = {}): Promise<Desarquivamento> {
    const desarquivamentoRepository = this.getRepository(Desarquivamento);
    const factoryData = DesarquivamentoFactory.build({ ...data, criadoPor: createdBy });
    const desarquivamento = desarquivamentoRepository.create(factoryData);
    return desarquivamentoRepository.save(desarquivamento);
  }

  public async close() {
    await this._app.close();
  }
}