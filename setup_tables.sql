-- Script consolidado para criar todas as tabelas do SGC-ITEP
-- Execute após criar o banco de dados sgc_itep

-- =============================================
-- TABELA: roles
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  permissions JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Dados iniciais para roles
INSERT INTO roles (name, description, permissions, ativo)
VALUES 
  ('admin', 'Administrador do sistema com acesso completo', '["*"]', TRUE),
  ('gestor', 'Gestor com acesso a relatórios e aprovações', '["users.view", "desarquivamentos.*", "dashboard.*"]', TRUE),
  ('operador', 'Operador com acesso básico ao sistema', '["desarquivamentos.create", "desarquivamentos.view", "desarquivamentos.update"]', TRUE),
  ('consulta', 'Usuário com acesso somente leitura', '["desarquivamentos.view", "dashboard.view"]', TRUE)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- TABELA: usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  usuario VARCHAR(100) NOT NULL UNIQUE,
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

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_role_id ON usuarios(role_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (nome, usuario, senha, role_id, ativo)
VALUES (
  'Administrador',
  'admin',
  '$2a$12$tW3g.JhNG4UqUfYEHHA6aeqj3fy5gyqSVGuemVs1hY7MWdhyu7rQC', -- admin123
  (SELECT id FROM roles WHERE name = 'admin'),
  TRUE
)
ON CONFLICT (usuario) DO UPDATE SET senha = EXCLUDED.senha;

-- =============================================
-- TABELA: audit_logs
-- =============================================
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

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================
-- TABELA: desarquivamentos
-- =============================================
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

-- Índices para desarquivamentos
CREATE INDEX IF NOT EXISTS idx_desarquivamentos_numero_processo ON desarquivamentos(numero_processo);
CREATE INDEX IF NOT EXISTS idx_desarquivamentos_requerente ON desarquivamentos(requerente);
CREATE INDEX IF NOT EXISTS idx_desarquivamentos_cpf_cnpj ON desarquivamentos(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_desarquivamentos_status ON desarquivamentos(status);
CREATE INDEX IF NOT EXISTS idx_desarquivamentos_usuario_responsavel ON desarquivamentos(usuario_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_desarquivamentos_data_solicitacao ON desarquivamentos(data_solicitacao);

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_desarquivamentos_updated_at BEFORE UPDATE ON desarquivamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MENSAGEM DE SUCESSO
-- =============================================
SELECT 'Banco de dados SGC-ITEP criado com sucesso!' as status;
SELECT 'Tabelas criadas: roles, usuarios, audit_logs, desarquivamentos' as tabelas;
SELECT 'Usuário admin criado: admin / admin' as login_admin;