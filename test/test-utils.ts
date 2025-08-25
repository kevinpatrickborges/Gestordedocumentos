import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class TestUtils {
  /**
   * Realiza o login e retorna um token JWT válido.
   * @param app A instância da aplicação NestJS.
   * @param usuario O nome de usuário.
   * @param password A senha do usuário.
   * @returns O token JWT.
   */
  static async getJwtToken(
    app: INestApplication,
    usuario: string,
    password: string,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login') // Usando o endpoint de login existente
      .send({ usuario, password });

    if (response.status !== 200 && response.status !== 201) {
      console.error('Falha no login durante os testes:', response.body);
      throw new Error(`Não foi possível autenticar com o usuário ${usuario}`);
    }

    return response.body.accessToken;
  }
}
