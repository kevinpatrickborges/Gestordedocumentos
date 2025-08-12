import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AuthModule } from '../src/modules/auth/auth.module';
import { NugecidModule } from '../src/modules/nugecid/nugecid.module';
import { UsersModule } from '../src/modules/users/users.module';
import { User } from '../src/modules/users/entities/user.entity';
import { TestBed } from './test-bed';

describe('NugecidController (PDF Generation E2E)', () => {
  let app: INestApplication;
  let testBed: TestBed;
  let adminToken: string;

  beforeAll(async () => {
        testBed = await TestBed.init([
      ConfigModule.forRoot({ isGlobal: true }),
      NugecidModule,
      AuthModule,
      UsersModule,
    ]);
    app = testBed.getApp();
    adminToken = await testBed.createAuthenticatedUser('admin');
  });

  afterAll(async () => {
    await testBed.close();
  });

  it('should generate a PDF for a valid record ID', async () => {
    // 1. Obter o usuário admin para associar ao registro
    const userRepository = testBed.getRepository(User);
    const adminUser = await userRepository.findOne({ where: { usuario: 'admin' } });
    expect(adminUser).toBeDefined();

    // 2. Criar um registro de desarquivamento usando o TestBed
    const desarquivamento = await testBed.createDesarquivamento(adminUser, {
      responsavel: adminUser,
    });
    const recordId = desarquivamento.id;

    // 3. Solicitar a geração do PDF para o registro criado
    const response = await request(app.getHttpServer())
      .get(`/nugecid/${recordId}/termo`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', 'application/pdf')
      .expect(200);

    // 4. Validar a resposta
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.headers['content-disposition']).toContain(`attachment; filename=termo_de_entrega.pdf`);
  });

  it('should return 404 for a non-existent record ID', async () => {
    await request(app.getHttpServer())
      .get('/nugecid/999999/pdf')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});