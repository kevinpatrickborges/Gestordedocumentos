/**
 * Script de Verificação do Docker (modo enxuto)
 * Exibe apenas informações essenciais.
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Função para log simples
function log(message) {
  console.log(message);
}

async function checkDockerInstalled() {
  try {
    await execAsync('docker --version');
    return true;
  } catch {
    log('Erro: Docker não instalado ou fora do PATH.');
    return false;
  }
}

async function checkDockerRunning() {
  try {
    await execAsync('docker info');
    return true;
  } catch {
    log('Erro: Docker não está rodando.');
    return false;
  }
}

async function checkContainersRunning() {
  try {
    const { stdout } = await execAsync('docker-compose ps --services --filter "status=running"');
    const runningServices = stdout.trim().split('\n').filter(Boolean);
    const requiredServices = ['postgres', 'redis', 'pgadmin'];
    const missingServices = requiredServices.filter(s => !runningServices.includes(s));
    if (missingServices.length === 0) {
      return true;
    } else {
      log(`Aviso: Serviços ausentes: ${missingServices.join(', ')}`);
      return false;
    }
  } catch {
    log('Erro ao verificar containers Docker.');
    return false;
  }
}

async function checkPostgresConnection() {
  try {
    const { stdout } = await execAsync('docker-compose exec -T postgres pg_isready -U postgres -d sgc_itep');
    return stdout.includes('accepting connections');
  } catch {
    return false;
  }
}

async function checkRedisConnection() {
  try {
    const { stdout } = await execAsync('docker-compose exec -T redis redis-cli ping');
    return stdout.trim() === 'PONG';
  } catch {
    return false;
  }
}

async function checkDockerServices() {
  log('Iniciando verificação de dependências...');

  if (!(await checkDockerInstalled())) process.exit(1);
  if (!(await checkDockerRunning())) process.exit(1);

  const containersOK = await checkContainersRunning();
  if (!containersOK) {
    log('Subindo serviços Docker necessários...');
    try {
      await execAsync('docker-compose up -d');
    } catch (e) {
      log('Falha ao subir serviços Docker.');
      process.exit(1);
    }
  }

  const pgOK = await checkPostgresConnection();
  const redisOK = await checkRedisConnection();

  if (pgOK && redisOK) {
    log('Dependências OK.');
  } else {
    log(`Aviso: PostgreSQL: ${pgOK ? 'OK' : 'NOK'} | Redis: ${redisOK ? 'OK' : 'NOK'}`);
  }
}

if (require.main === module) {
  checkDockerServices().catch(() => {
    log('Erro inesperado na verificação de dependências.');
    process.exit(1);
  });
}

module.exports = {
  checkDockerServices,
  checkDockerInstalled,
  checkDockerRunning,
  checkContainersRunning,
  checkPostgresConnection,
  checkRedisConnection,
};