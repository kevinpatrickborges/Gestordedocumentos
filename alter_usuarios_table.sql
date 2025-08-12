-- Script para alterar a tabela usuarios
-- Remover coluna email e adicionar coluna usuario

-- Primeiro, remover a coluna email se existir
ALTER TABLE usuarios DROP COLUMN IF EXISTS email;

-- Adicionar a coluna usuario
ALTER TABLE usuarios ADD COLUMN usuario VARCHAR(100) UNIQUE;

-- Atualizar o usuário admin existente
UPDATE usuarios SET usuario = 'admin' WHERE id = 1;

-- Tornar a coluna usuario obrigatória após inserir os dados
ALTER TABLE usuarios ALTER COLUMN usuario SET NOT NULL;

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- Verificar os dados do usuário admin
SELECT id, nome, usuario, ativo FROM usuarios WHERE id = 1;