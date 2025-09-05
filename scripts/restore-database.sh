#!/bin/bash

# Script de restauração do banco de dados PostgreSQL no Docker
# Uso: ./scripts/restore-database.sh arquivo_backup.sql

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se um arquivo foi passado como parâmetro
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Erro: Arquivo de backup não especificado${NC}"
    echo -e "${YELLOW}💡 Uso: $0 <arquivo_backup.sql>${NC}"
    echo -e "${YELLOW}📁 Arquivos disponíveis em ./backups/:${NC}"
    ls -la ./backups/*.sql 2>/dev/null || echo -e "${RED}Nenhum arquivo encontrado${NC}"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="sgc-itep-postgres"
DB_NAME="sgc_itep"
DB_USER="postgres"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    # Procurar na pasta backups se não encontrou no caminho absoluto
    if [ -f "./backups/$BACKUP_FILE" ]; then
        BACKUP_FILE="./backups/$BACKUP_FILE"
    else
        echo -e "${RED}❌ Erro: Arquivo $BACKUP_FILE não encontrado${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}=== SGC-Itep - Restore Database ===${NC}"
echo -e "${YELLOW}Data/Hora: $(date)${NC}"
echo -e "${YELLOW}Container: ${CONTAINER_NAME}${NC}"
echo -e "${YELLOW}Arquivo: ${BACKUP_FILE}${NC}"

# Verificar se o container está rodando
if ! docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Erro: Container ${CONTAINER_NAME} não está rodando${NC}"
    echo -e "${YELLOW}💡 Dica: Execute 'docker-compose up -d' primeiro${NC}"
    exit 1
fi

# Mostrar informações do arquivo
FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo -e "${YELLOW}📊 Tamanho: ${FILE_SIZE}${NC}"

# Mostrar primeiras linhas para confirmação
echo -e "${YELLOW}🔍 Conteúdo do arquivo (primeiras linhas):${NC}"
head -3 "$BACKUP_FILE"

echo
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação irá:${NC}"
echo -e "${YELLOW}   • Apagar o banco de dados atual${NC}"
echo -e "${YELLOW}   • Restaurar do backup${NC}"
echo -e "${YELLOW}   • Todos os dados atuais serão perdidos${NC}"
echo

read -p "Continuar? (Digite 'SIM' para confirmar): " confirm
if [ "$confirm" != "SIM" ]; then
    echo -e "${RED}Operação cancelada pelo usuário${NC}"
    exit 0
fi

echo -e "${YELLOW}🔄 Iniciando restauração...${NC}"

# Executar restauração usando psql dentro do container
echo -e "${YELLOW}📝 Executando comandos SQL...${NC}"

if docker exec -i ${CONTAINER_NAME} psql \
    -U ${DB_USER} \
    -d ${DB_NAME} \
    -v ON_ERROR_STOP=1 < "$BACKUP_FILE" 2>/dev/null; then

    echo -e "${GREEN}✅ Restauração concluída com sucesso!${NC}"
    echo -e "${GREEN}🎯 Arquivo: ${BACKUP_FILE}${NC}"

    # Verificar se a restauração foi bem-sucedida
    echo -e "${YELLOW}🔍 Verificando tabelas restauradas...${NC}"
    TABLES_COUNT=$(docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null)
    echo -e "${GREEN}📊 Tabelas encontradas: ${TABLES_COUNT}${NC}"

    echo
    echo -e "${GREEN}🎉 Database restaurado com sucesso!${NC}"
    echo -e "${GREEN}💡 Execute 'npm run dev' para iniciar a aplicação${NC}"

else
    echo -e "${RED}❌ Erro durante a restauração${NC}"
    echo -e "${YELLOW}💡 Verifique:${NC}"
    echo -e "${YELLOW}   • Arquivo de backup está válido${NC}"
    echo -e "${YELLOW}   • Container do PostgreSQL está funcionando${NC}"
    exit 1
fi
