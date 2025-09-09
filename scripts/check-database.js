#!/usr/bin/env node

/**
 * Script de Diagnóstico de Banco de Dados
 * 
 * Este script verifica a conectividade com o banco de dados PostgreSQL
 * usando as configurações do arquivo .env
 * 
 * Uso: node scripts/check-database.js
 */

const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
config({ path: path.join(__dirname, '..', '.env') });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.cyan}🔍${colors.reset} ${msg}`),
};

async function checkDatabaseConnection() {
  log.info('🔧 Iniciando diagnóstico do banco de dados...');
  console.log('');

  // Verificar variáveis de ambiente
  const dbConfig = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'sgc_itep',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    logging: false,
    synchronize: false,
  };

  log.info('📋 Configurações do banco:');
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Username: ${dbConfig.username}`);
  console.log(`   SSL: ${dbConfig.ssl ? 'Habilitado' : 'Desabilitado'}`);
  console.log('');

  const dataSource = new DataSource(dbConfig);

  try {
    // Teste 1: Inicializar conexão
    log.info('🔌 Teste 1: Inicializando conexão...');
    await dataSource.initialize();
    log.success('Conexão inicializada com sucesso');

    // Teste 2: Query básica
    log.info('🧪 Teste 2: Executando query básica...');
    const basicResult = await dataSource.query('SELECT 1 as test, NOW() as current_time');
    log.success(`Query básica executada: ${JSON.stringify(basicResult[0])}`);

    // Teste 3: Informações do PostgreSQL
    log.info('📊 Teste 3: Coletando informações do PostgreSQL...');
    const dbInfo = await dataSource.query(`
      SELECT 
        version() as postgres_version,
        current_database() as database_name,
        current_user as current_user,
        current_timestamp as server_time
    `);
    
    const info = dbInfo[0];
    log.success('Informações do PostgreSQL:');
    console.log(`   Versão: ${info.postgres_version.split(' ')[0]} ${info.postgres_version.split(' ')[1]}`);
    console.log(`   Database: ${info.database_name}`);
    console.log(`   Usuário: ${info.current_user}`);
    console.log(`   Horário do servidor: ${info.server_time}`);

    // Teste 4: Listar tabelas
    log.info('📋 Teste 4: Verificando tabelas...');
    const tables = await dataSource.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    log.success(`Encontradas ${tables.length} tabelas:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Teste 5: Verificar tabelas esperadas
    log.info('🔍 Teste 5: Verificando tabelas esperadas...');
    const expectedTables = ['usuarios', 'roles', 'desarquivamentos', 'auditorias', 'audit_logs', 'migrations'];
    const foundTableNames = tables.map(t => t.table_name);

    for (const expectedTable of expectedTables) {
      if (foundTableNames.includes(expectedTable)) {
        try {
          const countResult = await dataSource.query(`SELECT COUNT(*) as count FROM ${expectedTable}`);
          const count = countResult[0]?.count || 0;
          log.success(`Tabela '${expectedTable}': ${count} registros`);
        } catch (countError) {
          log.warning(`Erro ao contar registros da tabela '${expectedTable}': ${countError.message}`);
        }
      } else {
        log.warning(`Tabela esperada '${expectedTable}' não encontrada`);
      }
    }

    // Teste 6: Verificar conexões ativas
    log.info('🔗 Teste 6: Verificando conexões ativas...');
    const connectionStats = await dataSource.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);

    const stats = connectionStats[0];
    log.success('Estatísticas de conexões:');
    console.log(`   Total: ${stats.total_connections}`);
    console.log(`   Ativas: ${stats.active_connections}`);
    console.log(`   Idle: ${stats.idle_connections}`);

    // Teste 7: Performance de queries
    log.info('⏱️ Teste 7: Testando performance...');
    const startTime = Date.now();
    await dataSource.query('SELECT pg_sleep(0.1)'); // Sleep por 100ms
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (responseTime < 1000) {
      log.success(`Tempo de resposta: ${responseTime}ms (Excelente)`);
    } else if (responseTime < 3000) {
      log.warning(`Tempo de resposta: ${responseTime}ms (Aceitável)`);
    } else {
      log.warning(`Tempo de resposta: ${responseTime}ms (Lento)`);
    }

    console.log('');
    log.success('🎉 Todos os testes de conectividade foram bem-sucedidos!');
    log.info('💡 O banco de dados está funcionando corretamente.');

  } catch (error) {
    console.log('');
    log.error('💥 ERRO na conexão com banco de dados:');
    console.log('');
    
    // Análise detalhada do erro
    if (error.code) {
      log.error(`Código do erro: ${error.code}`);
    }
    
    log.error(`Mensagem: ${error.message}`);
    
    // Sugestões baseadas no tipo de erro
    console.log('');
    log.info('🔧 Sugestões para resolução:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   1. Verificar se o PostgreSQL está rodando');
      console.log('   2. Verificar se a porta está correta');
      console.log('   3. Verificar configurações de firewall');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   1. Verificar se o host está correto');
      console.log('   2. Verificar conectividade de rede');
    } else if (error.message.includes('password')) {
      console.log('   1. Verificar username e password no .env');
      console.log('   2. Verificar se o usuário tem permissões adequadas');
    } else if (error.message.includes('database')) {
      console.log('   1. Verificar se o database existe');
      console.log('   2. Verificar se o usuário tem acesso ao database');
    } else {
      console.log('   1. Verificar configurações no arquivo .env');
      console.log('   2. Verificar logs do PostgreSQL');
      console.log('   3. Verificar conectividade de rede');
    }
    
    console.log('');
    log.info('📋 Configurações atuais:');
    console.log(`   DATABASE_HOST=${process.env.DATABASE_HOST || 'não definido'}`);
    console.log(`   DATABASE_PORT=${process.env.DATABASE_PORT || 'não definido'}`);
    console.log(`   DATABASE_NAME=${process.env.DATABASE_NAME || 'não definido'}`);
    console.log(`   DATABASE_USERNAME=${process.env.DATABASE_USERNAME || 'não definido'}`);
    console.log(`   DATABASE_SSL=${process.env.DATABASE_SSL || 'não definido'}`);
    
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      log.debug('Conexão fechada');
    }
  }
}

// Executar diagnóstico
checkDatabaseConnection().catch(console.error);