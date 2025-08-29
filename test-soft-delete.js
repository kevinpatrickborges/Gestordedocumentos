const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_ENDPOINT = 'http://localhost:3000/auth';
const NUGECID_ENDPOINT = `${API_BASE_URL}/nugecid`;

// Credenciais de teste
const TEST_CREDENTIALS = {
  usuario: 'admin@itep.rn.gov.br',
  password: 'password123'
};

// Headers base
let headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Função para fazer login e obter token
async function getAuthToken() {
  console.log('🔐 Fazendo login para obter token de autenticação...');
  
  try {
    const loginResponse = await axios.post(`${AUTH_ENDPOINT}/login`, TEST_CREDENTIALS, { headers });
    
    if (loginResponse.data && loginResponse.data.accessToken) {
      console.log('✅ Login realizado com sucesso');
      console.log(`   Usuário: ${loginResponse.data.user.usuario}`);
      console.log(`   Token obtido: ${loginResponse.data.accessToken.substring(0, 20)}...`);
      
      // Atualizar headers com o token
      headers.Authorization = `Bearer ${loginResponse.data.accessToken}`;
      return loginResponse.data.accessToken;
    } else {
      throw new Error('Token não encontrado na resposta do login');
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

async function testSoftDelete() {
  console.log('🔍 INICIANDO TESTE DE SOFT DELETE');
  console.log('=' .repeat(50));
  
  try {
    // ETAPA 0: Fazer login e obter token
    console.log('\n🔐 ETAPA 0: Autenticação...');
    await getAuthToken();
    
    // ETAPA 1: Buscar registros existentes
    console.log('\n📋 ETAPA 1: Buscando registros existentes...');
    const listResponse = await axios.get(NUGECID_ENDPOINT, { headers });
    
    if (!listResponse.data.data || listResponse.data.data.length === 0) {
      console.log('❌ Nenhum registro encontrado para testar');
      return;
    }
    
    const firstRecord = listResponse.data.data[0];
    console.log(`✅ Registro encontrado: ID ${firstRecord.id}`);
    console.log(`   - Nome: ${firstRecord.nomeCompleto}`);
    console.log(`   - Status: ${firstRecord.status}`);
    console.log(`   - Deleted At: ${firstRecord.deletedAt || 'null'}`);
    
    const recordId = firstRecord.id;
    
    // ETAPA 2: Verificar contagem inicial
    console.log('\n📊 ETAPA 2: Verificando contagem inicial...');
    const initialCount = listResponse.data.total;
    console.log(`✅ Total de registros antes da exclusão: ${initialCount}`);
    
    // ETAPA 3: Executar soft delete
    console.log(`\n🗑️ ETAPA 3: Executando soft delete do registro ID ${recordId}...`);
    
    try {
      const deleteResponse = await axios.delete(`${NUGECID_ENDPOINT}/${recordId}`, { headers });
      console.log(`✅ Resposta da exclusão: ${deleteResponse.status} - ${deleteResponse.statusText}`);
      console.log(`   Mensagem: ${JSON.stringify(deleteResponse.data)}`);
    } catch (deleteError) {
      console.log(`❌ Erro na exclusão: ${deleteError.response?.status} - ${deleteError.response?.statusText}`);
      console.log(`   Detalhes: ${JSON.stringify(deleteError.response?.data)}`);
      return;
    }
    
    // ETAPA 4: Verificar se o registro foi marcado como deletado
    console.log('\n🔍 ETAPA 4: Verificando se o registro foi marcado como deletado...');
    
    // Aguardar um pouco para garantir que a operação foi processada
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Tentar buscar o registro específico (pode retornar 404 se soft deleted)
      const specificRecordResponse = await axios.get(`${NUGECID_ENDPOINT}/${recordId}`, { headers });
      console.log(`⚠️ Registro ainda acessível diretamente:`);
      console.log(`   - ID: ${specificRecordResponse.data.id}`);
      console.log(`   - Deleted At: ${specificRecordResponse.data.deletedAt || 'null'}`);
    } catch (specificError) {
      if (specificError.response?.status === 404) {
        console.log(`✅ Registro não encontrado (404) - pode indicar soft delete funcionando`);
      } else {
        console.log(`❌ Erro inesperado ao buscar registro: ${specificError.response?.status}`);
      }
    }
    
    // ETAPA 5: Verificar se o registro não aparece na listagem normal
    console.log('\n📋 ETAPA 5: Verificando listagem normal (sem incluir excluídos)...');
    const normalListResponse = await axios.get(`${NUGECID_ENDPOINT}?page=1&limit=10`, { headers });
    
    const recordStillInList = normalListResponse.data.data.find(record => record.id === recordId);
    
    if (recordStillInList) {
      console.log(`❌ PROBLEMA: Registro ainda aparece na listagem normal!`);
      console.log(`   - ID: ${recordStillInList.id}`);
      console.log(`   - Deleted At: ${recordStillInList.deletedAt || 'null'}`);
    } else {
      console.log(`✅ Registro não aparece mais na listagem normal`);
    }
    
    console.log(`   Total de registros após exclusão: ${normalListResponse.data.total}`);
    console.log(`   Diferença: ${initialCount - normalListResponse.data.total}`);
    
    // ETAPA 6: Verificar se o registro aparece com incluirExcluidos=true
    console.log('\n📋 ETAPA 6: Verificando listagem com incluirExcluidos=true...');
    
    try {
      const deletedListResponse = await axios.get(`${NUGECID_ENDPOINT}?page=1&limit=10&incluirExcluidos=true`, { headers });
      
      const recordInDeletedList = deletedListResponse.data.data.find(record => record.id === recordId);
      
      if (recordInDeletedList) {
        console.log(`✅ Registro encontrado na listagem com excluídos:`);
        console.log(`   - ID: ${recordInDeletedList.id}`);
        console.log(`   - Deleted At: ${recordInDeletedList.deletedAt || 'null'}`);
        
        if (recordInDeletedList.deletedAt) {
          console.log(`✅ Campo deletedAt preenchido corretamente!`);
        } else {
          console.log(`❌ PROBLEMA: Campo deletedAt não está preenchido!`);
        }
      } else {
        console.log(`❌ PROBLEMA: Registro não encontrado nem na listagem com excluídos!`);
      }
      
      console.log(`   Total com excluídos: ${deletedListResponse.data.total}`);
    } catch (deletedListError) {
      console.log(`❌ Erro ao buscar listagem com excluídos: ${deletedListError.response?.status}`);
      console.log(`   Pode ser que o parâmetro incluirExcluidos não seja suportado`);
    }
    
    // ETAPA 7: Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log('=' .repeat(30));
    
    if (!recordStillInList) {
      console.log('✅ Soft delete aparenta estar funcionando - registro removido da listagem normal');
    } else {
      console.log('❌ Soft delete NÃO está funcionando - registro ainda na listagem normal');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
    console.error('   Código do erro:', error.code);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Erro completo:', error);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 DICA: O servidor backend não está rodando!');
      console.error('   Execute: npm run start:dev (no diretório do backend)');
    }
  }
}

// Executar o teste
testSoftDelete().then(() => {
  console.log('\n🏁 Teste concluído!');
}).catch(error => {
  console.error('💥 Erro fatal:', error.message);
});