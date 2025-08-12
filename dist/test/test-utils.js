"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestUtils = void 0;
const request = require("supertest");
class TestUtils {
    static async getJwtToken(app, usuario, password) {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ usuario, password });
        if (response.status !== 200 && response.status !== 201) {
            console.error('Falha no login durante os testes:', response.body);
            throw new Error(`Não foi possível autenticar com o usuário ${usuario}`);
        }
        return response.body.accessToken;
    }
}
exports.TestUtils = TestUtils;
//# sourceMappingURL=test-utils.js.map