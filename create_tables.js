const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPassword() {
  return new Promise((resolve) => {
    rl.question('Digite a senha do PostgreSQL para o usuário postgres: ', (password) => {
      resolve(password);
    });
  });
}

async function createTables() {
  try {
    console.log('=== Configuração do Banco de Dados SGC-ITEP ===\n');
    
    const password = await askPassword();
    rl.close();
    
    // Configurações do banco de dados
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'sgc_itep',
      user: 'postgres',
      password: password
    });

    console.log('\nConectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Verificar e limpar tabelas existentes se necessário
    console.log('Verificando tabelas existentes...');
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('roles', 'usuarios', 'audit_logs', 'desarquivamentos');
    `);
    
    if (existingTables.rows.length > 0) {
      console.log('Removendo tabelas existentes para recriar...');
      await client.query('DROP TABLE IF EXISTS desarquivamentos CASCADE;');
      await client.query('DROP TABLE IF EXISTS audit_logs CASCADE;');
      await client.query('DROP TABLE IF EXISTS usuarios CASCADE;');
      await client.query('DROP TABLE IF EXISTS roles CASCADE;');
    }

    // Executar comandos SQL em etapas
    console.log('Criando tabela roles...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        permissions JSONB,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('Inserindo dados iniciais em roles...');
    await client.query(`
      INSERT INTO roles (name, description, permissions, ativo)
      VALUES 
        ('admin', 'Administrador do sistema com acesso completo', '["*"]', TRUE),
        ('gestor', 'Gestor com acesso a relatórios e aprovações', '["users.view", "desarquivamentos.*", "dashboard.*"]', TRUE),
        ('operador', 'Operador com acesso básico ao sistema', '["desarquivamentos.create", "desarquivamentos.view", "desarquivamentos.update"]', TRUE),
        ('consulta', 'Usuário com acesso somente leitura', '["desarquivamentos.view", "dashboard.view"]', TRUE)
      ON CONFLICT (name) DO NOTHING;
    `);
    
    console.log('Criando tabela usuarios...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE,
        telefone VARCHAR(20),
        cargo VARCHAR(100),
        setor VARCHAR(100),
        role_id INTEGER REFERENCES roles(id),
        ativo BOOLEAN DEFAULT TRUE,
        ultimo_login TIMESTAMP WITH TIME ZONE,
        tentativas_login INTEGER DEFAULT 0,
        bloqueado_ate TIMESTAMP WITH TIME ZONE,
        token_reset VARCHAR(255),
        token_reset_expira TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    console.log('Inserindo usuário administrador...');
    const adminRoleResult = await client.query("SELECT id FROM roles WHERE name = 'admin'");
    const adminRoleId = adminRoleResult.rows[0].id;
    
    await client.query(`
      INSERT INTO usuarios (nome, email, senha, role_id, ativo)
      VALUES (
        'Administrador',
        'admin@itep.rn.gov.br',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9jm',
        $1,
        TRUE
      )
      ON CONFLICT (email) DO NOTHING;
    `, [adminRoleId]);
    
    console.log('Criando tabela audit_logs...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usuarios(id),
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(50),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('Criando tabela desarquivamentos...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS desarquivamentos (
        id SERIAL PRIMARY KEY,
        numero_processo VARCHAR(50) NOT NULL,
        requerente VARCHAR(200) NOT NULL,
        cpf_cnpj VARCHAR(18),
        telefone VARCHAR(20),
        email VARCHAR(100),
        endereco TEXT,
        tipo_solicitacao VARCHAR(100),
        descricao TEXT,
        documentos_anexos JSONB,
        status VARCHAR(50) DEFAULT 'pendente',
        observacoes TEXT,
        usuario_responsavel_id INTEGER REFERENCES usuarios(id),
        data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        data_conclusao TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    console.log('Criando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
      CREATE INDEX IF NOT EXISTS idx_usuarios_role_id ON usuarios(role_id);
      CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_desarquivamentos_numero_processo ON desarquivamentos(numero_processo);
      CREATE INDEX IF NOT EXISTS idx_desarquivamentos_requerente ON desarquivamentos(requerente);
      CREATE INDEX IF NOT EXISTS idx_desarquivamentos_cpf_cnpj ON desarquivamentos(cpf_cnpj);
      CREATE INDEX IF NOT EXISTS idx_desarquivamentos_status ON desarquivamentos(status);
      CREATE INDEX IF NOT EXISTS idx_desarquivamentos_usuario_responsavel ON desarquivamentos(usuario_responsavel_id);
      CREATE INDEX IF NOT EXISTS idx_desarquivamentos_data_solicitacao ON desarquivamentos(data_solicitacao);
    `);
    
    console.log('\n✅ Tabelas criadas com sucesso!');
    console.log('✅ Usuário admin criado: admin@itep.rn.gov.br / admin123');
    
    // Verificar se as tabelas foram criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('\n🎉 Configuração concluída! Agora você pode executar "npm run dev"');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Senha incorreta. Tente executar o script novamente com a senha correta.');
      console.log('\nPara descobrir a senha do PostgreSQL:');
      console.log('1. Abra o pgAdmin');
      console.log('2. Use a senha que você definiu durante a instalação');
      console.log('3. Ou redefina a senha do usuário postgres no pgAdmin');
    }
    
    process.exit(1);
  }
}

createTables();