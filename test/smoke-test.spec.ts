import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

// Gera um número de RG aleatório para garantir a unicidade do teste
const generateRg = () => Math.floor(1000000 + Math.random() * 9000000).toString();


test.describe('Smoke Test - Nugecid CRUD', () => {
  const newRg = generateRg();
  const newNome = 'Nome de Teste Automatizado';

  test('deve realizar o login, criar, verificar e deslogar', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="usuario"]', 'admin');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // 2. Navegar para a página de listagem do NUGECID
    await page.goto(`${BASE_URL}/nugecid`);
    await expect(page.locator('h1')).toContainText('Solicitações Nugecid');

    // 3. Clicar em 'Nova Solicitação'
    await page.click('a[href="/nugecid/nova-solicitacao"]');
    await expect(page.locator('h1')).toContainText('Nova Solicitação');

    // 4. Preencher os campos obrigatórios
    await page.fill('input[name="rg"]', newRg);
    await page.fill('input[name="nome"]', newNome);
    await page.fill('input[name="numero_processo"]', 'PROC-12345');
    await page.fill('input[name="numero_inquerito"]', 'INQ-67890');
    await page.fill('input[name="servidor_responsavel"]', 'Servidor Teste');
    await page.selectOption('select[name="tipo_procedimento"]', { label: 'Procedimento 1' });

    // 5. Salvar o novo registro
    await page.click('button[type="submit"]');

    // 6. Verificar se o novo registro aparece na tabela
    await expect(page.locator('h1')).toContainText('Solicitações Nugecid'); // Confirma o redirecionamento
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Espera a tabela carregar e verifica o conteúdo
    await page.waitForSelector(`tr:has-text("${newNome}")`);
    const row = page.locator(`tr:has-text("${newNome}")`);
    await expect(row).toContainText(newRg);
    await expect(row).toContainText(newNome);

    // 7. Logout
    await page.click('button:has-text("Sair")');
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});