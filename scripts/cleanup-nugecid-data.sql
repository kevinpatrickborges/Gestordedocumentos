-- Script para limpeza completa dos dados do módulo NUGECID
-- Este script remove TODOS os registros da tabela desarquivamentos
-- incluindo registros com soft delete (deleted_at não nulo)

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Limpar TODOS os registros da tabela desarquivamentos
-- Incluindo registros com soft delete
DELETE FROM desarquivamentos;

-- Resetar a sequência do ID (se existir)
-- Para PostgreSQL com SERIAL ou IDENTITY
ALTER SEQUENCE IF EXISTS desarquivamentos_id_seq RESTART WITH 1;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- Verificar se a limpeza foi bem-sucedida
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as registros_ativos,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as registros_excluidos
FROM desarquivamentos;

-- Verificar o próximo valor da sequência
SELECT nextval('desarquivamentos_id_seq') as proximo_id;
SELECT setval('desarquivamentos_id_seq', 1, false); -- Reset para começar do 1

-- Log da operação
SELECT 
    'Limpeza completa da tabela desarquivamentos executada em: ' || NOW() as log_operacao;