#!/bin/bash

# Script de backup do banco de dados PostgreSQL no Docker
# Uso: ./scripts/backup-database.sh [nome_do_backup]

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
CONTAINER_NAME="sgc-itep-postgres"
DB_NAME="sgc_itep"
DB_USER="postgres"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME=${1:-"backup_${BACKUP_DATE}"}
BACKUP_FILE="${BACKUP_NAME}.sql"
BACKUP_PATH="./backups/${BACKUP_FILE}"

echo -e "${YELLOW}=== SGC-Itep - Backup Database ===${NC}"
echo -e "${YELLOW}Data/Hora: $(date)${NC}"
echo -e "${YELLOW}Container: ${CONTAINER_NAME}${NC}"
echo -e "${YELLOW}Banco: ${DB_NAME}${NC}"
echo -e "${YELLOW}Arquivo: ${BACKUP_FILE}${NC}"
echo

# Verificar se o container está rodando
if ! docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Erro: Container ${CONTAINER_NAME} não está rodando${NC}"
    echo -e "${YELLOW}💡 Dica: Execute 'docker-compose up -d' primeiro${NC}"
    exit 1
fi

# Criar diretório de backups se não existir
mkdir -p ./backups

echo -e "${YELLOW}🔄 Iniciando backup...${NC}"

# Executar backup usando pg_dump dentro do container
if docker exec ${CONTAINER_NAME} pg_dump \
    -U ${DB_USER} \
    -d ${DB_NAME} \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --verbose > ${BACKUP_PATH} 2>/dev/null; then

    echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
    echo -e "${GREEN}📁 Arquivo: ${BACKUP_PATH}${NC}"

    # Mostrar tamanho do arquivo
    FILE_SIZE=$(ls -lh ${BACKUP_PATH} | awk '{print $5}')
    echo -e "${GREEN}📊 Tamanho: ${FILE_SIZE}${NC}"

    # Mostrar primeiras linhas do arquivo para confirmar
    echo -e "${YELLOW}🔍 Verificação do arquivo:${NC}"
    head -5 ${BACKUP_PATH}

    echo
    echo -e "${GREEN}🎉 Backup concluído com sucesso!${NC}"

else
    echo -e "${RED}❌ Erro durante o backup${NC}"
    rm -f ${BACKUP_PATH} 2>/dev/null || true
    exit 1
fi
