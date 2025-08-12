import { INestApplication } from '@nestjs/common';
export declare class TestUtils {
    static getJwtToken(app: INestApplication, usuario: string, password: string): Promise<string>;
}
