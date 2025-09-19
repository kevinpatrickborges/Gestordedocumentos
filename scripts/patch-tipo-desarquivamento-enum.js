#!/usr/bin/env node

/**
 * Patch: Atualiza o enum tipo_desarquivamento_enum no PostgreSQL
 * - Adiciona os valores 'FISICO', 'DIGITAL' e 'NAO_LOCALIZADO' caso ainda não existam
 * - Útil quando migrações não foram aplicadas mas o schema já existe
 */

const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const path = require('path');

config({ path: path.join(__dirname, '..', '.env') });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
};

(async () => {
  log.info('Iniciando patch do enum tipo_desarquivamento_enum...');

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

  const dataSource = new DataSource(dbConfig);

  try {
    await dataSource.initialize();
    log.success('Conectado ao banco com sucesso');

    const enumName = 'tipo_desarquivamento_enum';
    const valuesToAdd = ['FISICO', 'DIGITAL', 'NAO_LOCALIZADO'];

    // Garante que o tipo enum existe (cria se não existir)
    const enumExists = await dataSource.query(
      `SELECT 1 FROM pg_type WHERE typname = $1`,
      [enumName]
    );

    if (enumExists.length === 0) {
      log.warning(`Tipo enum '${enumName}' não encontrado. Tentando criar...`);
      await dataSource.query(
        `DO $$ BEGIN
           CREATE TYPE ${enumName} AS ENUM ('FISICO','DIGITAL','NAO_LOCALIZADO');
         EXCEPTION
           WHEN duplicate_object THEN null;
         END $$;`
      );
      log.success(`Tipo enum '${enumName}' criado (ou já existia).`);
    }

    // Adiciona valores caso não existam
    for (const val of valuesToAdd) {
      const exists = await dataSource.query(
        `SELECT 1
         FROM pg_type t
         JOIN pg_enum e ON t.oid = e.enumtypid
         WHERE t.typname = $1 AND e.enumlabel = $2`,
        [enumName, val]
      );

      if (exists.length > 0) {
        log.info(`Valor '${val}' já existe em ${enumName}`);
        continue;
      }

      log.info(`Adicionando valor '${val}' ao enum ${enumName}...`);
      await dataSource.query(
        `ALTER TYPE ${enumName} ADD VALUE IF NOT EXISTS '${val}'`
      );
      log.success(`Valor '${val}' adicionado com sucesso`);
    }

    log.success('Patch de tipo_desarquivamento_enum concluído com sucesso.');
    process.exit(0);
  } catch (error) {
    log.error('Falha ao aplicar patch do enum tipo_desarquivamento_enum');
    log.error(error.message || String(error));
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
})();