"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const request = require("supertest");
const auth_module_1 = require("../src/modules/auth/auth.module");
const nugecid_module_1 = require("../src/modules/nugecid/nugecid.module");
const users_module_1 = require("../src/modules/users/users.module");
const user_entity_1 = require("../src/modules/users/entities/user.entity");
const test_bed_1 = require("./test-bed");
describe('NugecidController (PDF Generation E2E)', () => {
    let app;
    let testBed;
    let adminToken;
    beforeAll(async () => {
        testBed = await test_bed_1.TestBed.init([
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            nugecid_module_1.NugecidModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
        ]);
        app = testBed.getApp();
        adminToken = await testBed.createAuthenticatedUser('admin');
    });
    afterAll(async () => {
        await testBed.close();
    });
    it('should generate a PDF for a valid record ID', async () => {
        const userRepository = testBed.getRepository(user_entity_1.User);
        const adminUser = await userRepository.findOne({ where: { usuario: 'admin' } });
        expect(adminUser).toBeDefined();
        const desarquivamento = await testBed.createDesarquivamento(adminUser, {
            responsavel: adminUser,
        });
        const recordId = desarquivamento.id;
        const response = await request(app.getHttpServer())
            .get(`/nugecid/${recordId}/termo`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect('Content-Type', 'application/pdf')
            .expect(200);
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
//# sourceMappingURL=nugecid-pdf.e2e-spec.js.map