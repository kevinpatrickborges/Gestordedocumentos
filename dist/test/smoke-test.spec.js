"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const BASE_URL = 'http://localhost:3001';
const generateRg = () => Math.floor(1000000 + Math.random() * 9000000).toString();
test_1.test.describe('Smoke Test - Nugecid CRUD', () => {
    const newRg = generateRg();
    const newNome = 'Nome de Teste Automatizado';
    (0, test_1.test)('deve realizar o login, criar, verificar e deslogar', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="usuario"]', 'admin');
        await page.fill('input[name="password"]', '123456');
        await page.click('button[type="submit"]');
        await (0, test_1.expect)(page).toHaveURL(`${BASE_URL}/dashboard`);
        await (0, test_1.expect)(page.locator('h1')).toContainText('Dashboard');
        await page.goto(`${BASE_URL}/nugecid`);
        await (0, test_1.expect)(page.locator('h1')).toContainText('Solicitações Nugecid');
        await page.click('a[href="/nugecid/nova-solicitacao"]');
        await (0, test_1.expect)(page.locator('h1')).toContainText('Nova Solicitação');
        await page.fill('input[name="rg"]', newRg);
        await page.fill('input[name="nome"]', newNome);
        await page.fill('input[name="numero_processo"]', 'PROC-12345');
        await page.fill('input[name="numero_inquerito"]', 'INQ-67890');
        await page.fill('input[name="servidor_responsavel"]', 'Servidor Teste');
        await page.selectOption('select[name="tipo_procedimento"]', { label: 'Procedimento 1' });
        await page.click('button[type="submit"]');
        await (0, test_1.expect)(page.locator('h1')).toContainText('Solicitações Nugecid');
        const table = page.locator('table');
        await (0, test_1.expect)(table).toBeVisible();
        await page.waitForSelector(`tr:has-text("${newNome}")`);
        const row = page.locator(`tr:has-text("${newNome}")`);
        await (0, test_1.expect)(row).toContainText(newRg);
        await (0, test_1.expect)(row).toContainText(newNome);
        await page.click('button:has-text("Sair")');
        await (0, test_1.expect)(page).toHaveURL(`${BASE_URL}/login`);
    });
});
//# sourceMappingURL=smoke-test.spec.js.map