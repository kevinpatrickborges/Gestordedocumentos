"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("supertest");
const test_bed_1 = require("./test-bed");
const nugecid_module_1 = require("../src/modules/nugecid/nugecid.module");
const users_module_1 = require("../src/modules/users/users.module");
const auditoria_module_1 = require("../src/modules/audit/auditoria.module");
const XLSX = require("xlsx");
describe('NUGECID Import E2E Tests', () => {
    let app;
    let testBed;
    let adminToken;
    let userToken;
    beforeAll(async () => {
        testBed = await test_bed_1.TestBed.init([
            nugecid_module_1.NugecidModule,
            users_module_1.UsersModule,
            auditoria_module_1.AuditoriaModule,
        ]);
        app = testBed.getApp();
        adminToken = await testBed.createAuthenticatedUser('admin');
        userToken = await testBed.createAuthenticatedUser('user');
    });
    afterAll(async () => {
        await testBed.close();
    });
    describe('POST /nugecid/import', () => {
        const createTestXlsxFile = (data) => {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
            return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        };
        const createTestCsvFile = (data) => {
            const headers = Object.keys(data[0] || {});
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => row[header] || '').join(','))
            ].join('\n');
            return csvContent;
        };
        it('should import valid XLSX file successfully', async () => {
            const validData = [
                {
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': 'Físico',
                    'Status': 'Finalizado',
                    'Nome Completo': 'João Silva',
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': 'NIC-2024-001',
                    'Data de solicitação': '2024-01-15',
                },
            ];
            const worksheet = XLSX.utils.json_to_sheet(validData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
            const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            const response = await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('file', xlsxBuffer, 'valid-data.xlsx');
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('totalRows');
            expect(response.body).toHaveProperty('successCount');
            expect(response.body).toHaveProperty('errorCount');
        });
        it('should successfully import valid CSV file as admin', async () => {
            const testData = [
                {
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': 'Físico',
                    'Status': 'Finalizado',
                    'Nome Completo': 'Pedro Oliveira',
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': 'LAUDO-2024-003',
                    'Data de solicitação': '2024-01-17',
                    'Prorrogação': false
                }
            ];
            const csvContent = createTestCsvFile(testData);
            const response = await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('file', Buffer.from(csvContent), 'test-import.csv')
                .expect(201);
            expect(response.body).toHaveProperty('fileName', 'test-import.csv');
            expect(response.body).toHaveProperty('totalRecords', 1);
            expect(response.body).toHaveProperty('successCount');
            expect(response.body).toHaveProperty('errorCount');
        });
        it('should handle invalid data and return error report', async () => {
            const invalidData = [
                {
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': 'Inválido',
                    'Status': 'StatusInválido',
                    'Nome Completo': '',
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': '',
                    'Data de solicitação': 'data-inválida',
                    'Prorrogação': 'não-booleano'
                },
                {
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': 'Físico',
                    'Status': 'Finalizado',
                    'Nome Completo': 'Usuário Válido',
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': 'VALID-001',
                    'Data de solicitação': '2024-01-18',
                    'Prorrogação': false
                }
            ];
            const xlsxBuffer = createTestXlsxFile(invalidData);
            const response = await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('file', xlsxBuffer, 'invalid-data.xlsx')
                .expect(201);
            expect(response.body.totalRecords).toBe(2);
            expect(response.body.errorCount).toBeGreaterThan(0);
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0]).toHaveProperty('line');
            expect(response.body.errors[0]).toHaveProperty('error');
        });
        it('should reject non-admin users', async () => {
            const testData = [
                {
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': 'Físico',
                    'Status': 'Finalizado',
                    'Nome Completo': 'Teste User',
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': 'TEST-001',
                    'Data de solicitação': '2024-01-19',
                    'Prorrogação': false
                }
            ];
            const xlsxBuffer = createTestXlsxFile(testData);
            await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${userToken}`)
                .attach('file', xlsxBuffer, 'test-unauthorized.xlsx')
                .expect(403);
        });
        it('should reject requests without authentication', async () => {
            const testData = [
                {
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': 'Físico',
                    'Status': 'Finalizado',
                    'Nome Completo': 'Teste Anônimo',
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': 'ANON-001',
                    'Data de solicitação': '2024-01-20',
                    'Prorrogação': false
                }
            ];
            const xlsxBuffer = createTestXlsxFile(testData);
            await request(app.getHttpServer())
                .post('/nugecid/import')
                .attach('file', xlsxBuffer, 'test-no-auth.xlsx')
                .expect(401);
        });
        it('should reject requests without file', async () => {
            await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should reject unsupported file formats', async () => {
            const textContent = 'This is not a valid spreadsheet file';
            await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('file', Buffer.from(textContent), 'invalid-format.txt')
                .expect(400);
        });
        it('should handle empty spreadsheet', async () => {
            const emptyData = [];
            const xlsxBuffer = createTestXlsxFile(emptyData);
            const response = await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('file', xlsxBuffer, 'empty-file.xlsx')
                .expect(201);
            expect(response.body.totalRecords).toBe(0);
            expect(response.body.successCount).toBe(0);
            expect(response.body.errorCount).toBe(0);
        });
        it('should handle large file with mixed valid/invalid data', async () => {
            const largeData = [];
            for (let i = 1; i <= 50; i++) {
                largeData.push({
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': i % 2 === 0 ? 'Físico' : 'Digital',
                    'Status': 'Finalizado',
                    'Nome Completo': `Usuário Teste ${i}`,
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': `TEST-${i.toString().padStart(3, '0')}`,
                    'Data de solicitação': '2024-01-21',
                    'Prorrogação': i % 3 === 0
                });
            }
            for (let i = 1; i <= 10; i++) {
                largeData.push({
                    'DESARQUIVAMENTO FÍSICO/DIGITAL': 'TipoInválido',
                    'Status': 'StatusInválido',
                    'Nome Completo': '',
                    'Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA': '',
                    'Data de solicitação': 'data-inválida',
                    'Prorrogação': 'não-booleano'
                });
            }
            const xlsxBuffer = createTestXlsxFile(largeData);
            const response = await request(app.getHttpServer())
                .post('/nugecid/import')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('file', xlsxBuffer, 'large-mixed-data.xlsx')
                .expect(201);
            expect(response.body.totalRecords).toBe(60);
            expect(response.body.successCount).toBe(50);
            expect(response.body.errorCount).toBe(10);
            expect(response.body.errors.length).toBe(10);
        });
    });
});
//# sourceMappingURL=nugecid-import.e2e-spec.js.map