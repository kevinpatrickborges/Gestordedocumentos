/**
 * Script de Verificação do Docker
 * Verifica se os serviços Docker estão rodando antes de iniciar a aplicação
 * Autor: Kevin Patrick Borges
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Cores para output no console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para verificar se o Docker está instalado
async function checkDockerInstalled() {
  try {
    await execAsync('docker --version');
    log('✅ Docker está instalado', 'green');
    return true;
  } catch (error) {
    log('❌ Docker não está instalado ou não está no PATH', 'red');
    log('   Instale o Docker Desktop: https://www.docker.com/products/docker-desktop', 'yellow');
    return false;
  }
}

// Função para verificar se o Docker está rodando
async function checkDockerRunning() {
  try {
    await execAsync('docker info');
    log('✅ Docker está rodando', 'green');
    return true;
  } catch (error) {
    log('❌ Docker não está rodando', 'red');
    log('   Inicie o Docker Desktop ou execute: docker-compose up -d', 'yellow');
    return false;
  }
}

// Função para verificar se os containers estão rodando
async function checkContainersRunning() {
  try {
    const { stdout } = await execAsync('docker-compose ps --services --filter "status=running"');
    const runningServices = stdout.trim().split('\n').filter(service => service.length > 0);
    
    const requiredServices = ['postgres', 'redis', 'pgadmin'];
    const missingServices = requiredServices.filter(service => !runningServices.includes(service));
    
    if (missingServices.length === 0) {
      log('✅ Todos os serviços Docker estão rodando', 'green');
      log(`   Serviços ativos: ${runningServices.join(', ')}`, 'cyan');
      return true;
    } else {
      log('⚠️  Alguns serviços Docker não estão rodando', 'yellow');
      log(`   Serviços faltando: ${missingServices.join(', ')}`, 'red');
      log('   Execute: npm run docker:up', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Erro ao verificar containers', 'red');
    log('   Execute: docker-compose up -d', 'yellow');
    return false;
  }
}

// Função para verificar conectividade com PostgreSQL
async function checkPostgresConnection() {
  try {
    const { stdout } = await execAsync('docker-compose exec -T postgres pg_isready -U postgres -d sgc_itep');
    if (stdout.includes('accepting connections')) {
      log('✅ PostgreSQL está aceitando conexões', 'green');
      return true;
    } else {
      log('⚠️  PostgreSQL não está pronto', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Erro ao verificar PostgreSQL', 'red');
    return false;
  }
}

// Função para verificar conectividade com Redis
async function checkRedisConnection() {
  try {
    const { stdout } = await execAsync('docker-compose exec -T redis redis-cli ping');
    if (stdout.trim() === 'PONG') {
      log('✅ Redis está respondendo', 'green');
      return true;
    } else {
      log('⚠️  Redis não está respondendo', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Erro ao verificar Redis', 'red');
    return false;
  }
}

// Função principal de verificação
async function checkDockerServices() {
  log('🔍 Verificando serviços Docker...', 'blue');
  log('=' .repeat(50), 'blue');
  
  const dockerInstalled = await checkDockerInstalled();
  if (!dockerInstalled) {
    process.exit(1);
  }
  
  const dockerRunning = await checkDockerRunning();
  if (!dockerRunning) {
    process.exit(1);
  }
  
  const containersRunning = await checkContainersRunning();
  if (!containersRunning) {
    log('\n🚀 Iniciando serviços Docker...', 'blue');
    try {
      await execAsync('docker-compose up -d');
      log('✅ Serviços Docker iniciados', 'green');
      
      // Aguardar um pouco para os serviços iniciarem
      log('⏳ Aguardando serviços iniciarem...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      log('❌ Erro ao iniciar serviços Docker', 'red');
      log(`   Erro: ${error.message}`, 'red');
      process.exit(1);
    }
  }
  
  // Verificar conectividade dos serviços
  log('\n🔗 Verificando conectividade dos serviços...', 'blue');
  await checkPostgresConnection();
  await checkRedisConnection();
  
  log('\n✅ Verificação concluída!', 'green');
  log('🚀 Pronto para iniciar a aplicação', 'green');
  log('=' .repeat(50), 'blue');
}

// Executar verificação se chamado diretamente
if (require.main === module) {
  checkDockerServices().catch(error => {
    log(`❌ Erro durante verificação: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkDockerServices,
  checkDockerInstalled,
  checkDockerRunning,
  checkContainersRunning,
  checkPostgresConnection,
  checkRedisConnection
};