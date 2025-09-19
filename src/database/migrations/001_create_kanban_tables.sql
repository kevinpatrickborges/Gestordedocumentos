-- Migração para criar as tabelas do sistema Kanban
-- Data: 2024-01-15
-- Descrição: Criação das tabelas principais do sistema de gerenciamento de tarefas

-- Tabela de projetos
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    criador_id INTEGER NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para projetos
CREATE INDEX idx_projetos_criador ON projetos(criador_id);
CREATE INDEX idx_projetos_ativo ON projetos(ativo);
CREATE INDEX idx_projetos_data_criacao ON projetos(data_criacao);

-- Tabela de membros do projeto
CREATE TABLE membros_projeto (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    papel VARCHAR(20) NOT NULL DEFAULT 'membro',
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(projeto_id, usuario_id),
    CHECK (papel IN ('admin', 'editor', 'visualizador', 'membro'))
);

-- Índices para membros_projeto
CREATE INDEX idx_membros_projeto_projeto ON membros_projeto(projeto_id);
CREATE INDEX idx_membros_projeto_usuario ON membros_projeto(usuario_id);
CREATE INDEX idx_membros_projeto_papel ON membros_projeto(papel);

-- Tabela de colunas
CREATE TABLE colunas (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cor VARCHAR(7) DEFAULT '#6B7280',
    ordem INTEGER NOT NULL DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
);

-- Índices para colunas
CREATE INDEX idx_colunas_projeto ON colunas(projeto_id);
CREATE INDEX idx_colunas_ordem ON colunas(projeto_id, ordem);

-- Tabela de tarefas
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL,
    coluna_id INTEGER NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    responsavel_id INTEGER,
    criador_id INTEGER NOT NULL,
    prazo TIMESTAMP,
    prioridade VARCHAR(10) DEFAULT 'media',
    ordem INTEGER NOT NULL DEFAULT 0,
    tags TEXT[], -- Array de strings para tags
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
    FOREIGN KEY (coluna_id) REFERENCES colunas(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica'))
);

-- Índices para tarefas
CREATE INDEX idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX idx_tarefas_coluna ON tarefas(coluna_id);
CREATE INDEX idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX idx_tarefas_criador ON tarefas(criador_id);
CREATE INDEX idx_tarefas_prioridade ON tarefas(prioridade);
CREATE INDEX idx_tarefas_prazo ON tarefas(prazo);
CREATE INDEX idx_tarefas_ordem ON tarefas(coluna_id, ordem);
CREATE INDEX idx_tarefas_tags ON tarefas USING GIN(tags);

-- Tabela de comentários
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    tarefa_id INTEGER NOT NULL,
    autor_id INTEGER NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para comentários
CREATE INDEX idx_comentarios_tarefa ON comentarios(tarefa_id);
CREATE INDEX idx_comentarios_autor ON comentarios(autor_id);
CREATE INDEX idx_comentarios_data ON comentarios(data_criacao);

-- Tabela de histórico de tarefas
CREATE TABLE historico_tarefas (
    id SERIAL PRIMARY KEY,
    tarefa_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    acao VARCHAR(50) NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para histórico_tarefas
CREATE INDEX idx_historico_tarefa ON historico_tarefas(tarefa_id);
CREATE INDEX idx_historico_usuario ON historico_tarefas(usuario_id);
CREATE INDEX idx_historico_data ON historico_tarefas(data_acao);
CREATE INDEX idx_historico_acao ON historico_tarefas(acao);

-- Triggers para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers nas tabelas
CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colunas_updated_at BEFORE UPDATE ON colunas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comentarios_updated_at BEFORE UPDATE ON comentarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir colunas padrão para novos projetos (será usado pelo service)
-- Esta função será chamada automaticamente quando um projeto for criado
CREATE OR REPLACE FUNCTION criar_colunas_padrao(projeto_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO colunas (projeto_id, nome, cor, ordem) VALUES
        (projeto_id_param, 'A Fazer', '#EF4444', 1),
        (projeto_id_param, 'Em Progresso', '#F59E0B', 2),
        (projeto_id_param, 'Em Revisão', '#8B5CF6', 3),
        (projeto_id_param, 'Concluído', '#10B981', 4);
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas para documentação
COMMENT ON TABLE projetos IS 'Tabela principal de projetos do sistema Kanban';
COMMENT ON TABLE membros_projeto IS 'Relacionamento entre usuários e projetos com papéis específicos';
COMMENT ON TABLE colunas IS 'Colunas do quadro Kanban de cada projeto';
COMMENT ON TABLE tarefas IS 'Tarefas/cards do sistema Kanban';
COMMENT ON TABLE comentarios IS 'Comentários nas tarefas';
COMMENT ON TABLE historico_tarefas IS 'Log de alterações nas tarefas para auditoria';

COMMENT ON COLUMN projetos.cor IS 'Cor do projeto em formato hexadecimal';
COMMENT ON COLUMN colunas.ordem IS 'Ordem de exibição da coluna no quadro';
COMMENT ON COLUMN tarefas.tags IS 'Array de tags para categorização das tarefas';
COMMENT ON COLUMN tarefas.ordem IS 'Ordem da tarefa dentro da coluna';
COMMENT ON COLUMN membros_projeto.papel IS 'Papel do usuário no projeto: admin, editor, visualizador, membro';