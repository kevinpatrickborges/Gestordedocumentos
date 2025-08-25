import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestUtils } from './test-utils'; // Supondo um utilitário de teste para login

describe('EstatisticasController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obter token JWT para um usuário autenticado
    jwtToken = await TestUtils.getJwtToken(
      app,
      'admin@example.com',
      'adminpass',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/estatisticas/cards (GET) - deve retornar os dados dos cards', () => {
    return request(app.getHttpServer())
      .get('/estatisticas/cards')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('totalAtendimentos');
        expect(res.body).toHaveProperty('totalDesarquivamentos');
        expect(res.body).toHaveProperty('atendimentosPendentes');
        expect(res.body).toHaveProperty('atendimentosEsteMes');
      });
  });

  it('/estatisticas/atendimentos-por-mes (GET) - deve retornar dados para o gráfico de barras', () => {
    return request(app.getHttpServer())
      .get('/estatisticas/atendimentos-por-mes')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect(res => {
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
          expect(res.body[0]).toHaveProperty('name'); // ex: '2023-10'
          expect(res.body[0]).toHaveProperty('total');
        }
      });
  });

  it('/estatisticas/status-distribuicao (GET) - deve retornar dados para o gráfico de pizza', () => {
    return request(app.getHttpServer())
      .get('/estatisticas/status-distribuicao')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect(res => {
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
          expect(res.body[0]).toHaveProperty('name'); // ex: 'Pendente'
          expect(res.body[0]).toHaveProperty('value');
        }
      });
  });

  it('Deve retornar 401 Unauthorized se não houver token', () => {
    return request(app.getHttpServer()).get('/estatisticas/cards').expect(401);
  });
});
