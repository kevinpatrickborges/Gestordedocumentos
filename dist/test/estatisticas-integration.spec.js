"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const test_utils_1 = require("./test-utils");
describe('EstatisticasController (e2e)', () => {
    let app;
    let jwtToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        jwtToken = await test_utils_1.TestUtils.getJwtToken(app, 'admin@example.com', 'adminpass');
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
                expect(res.body[0]).toHaveProperty('name');
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
                expect(res.body[0]).toHaveProperty('name');
                expect(res.body[0]).toHaveProperty('value');
            }
        });
    });
    it('Deve retornar 401 Unauthorized se não houver token', () => {
        return request(app.getHttpServer()).get('/estatisticas/cards').expect(401);
    });
});
//# sourceMappingURL=estatisticas-integration.spec.js.map