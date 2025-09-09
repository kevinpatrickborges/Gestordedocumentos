# Sincronização de Banco de Dados - Docker

## Problema Identificado

Quando você clona o repositório em outra máquina, o **banco de dados do Docker não vai junto** porque:

- ✅ **Código fonte**: Vá com o Git
- ✅ **Configurações**: Vão com o Git
- ❌ **Dados do banco Docker**: Ficam apenas na máquina original

## Por que isso acontece?

O Docker usa **volumes nomeados** (`postgres_data`) que permanecem na máquina local mesmo após remover containers.

## Soluções para sincronização:

### 🚀 Solução 1: Backup e Restore (Recomendado)

#### 1. Na máquina original (antes de mudar):

```bash
# Garantir que o Docker está rodando
npm run docker:up

# Criar backup do banco
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh meu_backup

# Arquivo será criado em ./backups/meu_backup.sql
```

#### 2. No Git - Adicionar backup ao repositório:

```bash
git add backups/meu_backup.sql
git commit -m "feat: Adicionar backup do banco de dados para sincronização"
git push origin master
```

#### 3. Na nova máquina:

```bash
# Clonar repositório
git clone https://github.com/kevinpatrickborges/Gestordedocumentos.git
cd Gestordedocumentos

# Instalar dependências
npm install
cd frontend && npm install && cd ..

# Subir containers Docker
npm run docker:up

# Aguardar PostgreSQL inicializar (cerca de 1 minuto)
sleep 30

# Executar migrations e seeds
npm run migration:run
npm run seed

# Fazer restore do backup
chmod +x scripts/restore-database.sh
./scripts/restore-database.sh meu_backup.sql

# Iniciar aplicação
npm run dev
```

### 💡 Solução 2: Dump SQL no código (Alternativa)

#### Adicionar arquivo SQL ao repositório:

```bash
# Na máquina original
docker exec sgc-itep-postgres pg_dump -U postgres -d sgc_itep > database_dump.sql

# Adicionar ao git
git add database_dump.sql
git commit -m "feat: Adicionar dump completo do banco de dados"
```

#### Na nova máquina:

```sql
-- Conectar ao banco e executar o dump
psql -h localhost -p 5433 -U postgres -d sgc_itep < database_dump.sql
```

### 🔧 Solução 3: Script de Setup Completo

Criar um script que faz tudo automaticamente na nova máquina:

```bash
#!/bin/bash
# setup-database.sh

echo "🔄 Configurando banco de dados..."

# Verificar backup
if [ ! -f "./backups/meu_backup.sql" ]; then
    echo "❌ Backup não encontrado!"
    exit 1
fi

# Subir Docker
npm run docker:up
sleep 30

# Setup inicial
npm run migration:run
npm run seed

# Restore backup
./scripts/restore-database.sh meu_backup.sql

echo "✅ Setup completo!"
```

## ❌ O que NÃO funciona:

### Volumes nomeados não sincronizam:
- `docker-compose.yml` define volumes nomeados
- Esses volumes ficam apenas na máquina original
- Mesmo que copie volume, nomes conflitam

### Bind mounts locais:
```yaml
# NÃO use isso para dados persistentes
volumes:
  - ./meu_banco:/var/lib/postgresql/data  # ❌ Dados ficam na máquina
```

## ✅ Prática Recomendada:

1. **Sempre faça backup antes de alterações importantes**
2. **Inclua backup no repositório para novos desenvolvedores**
3. **Documente o processo de setup**
4. **Use scripts automatizados para repetibilidade**

## 📝 Checklist para Máquinas Novas:

- [ ] Clonou repositório
- [ ] Instalou dependências (`npm install` e `cd frontend && npm install`)
- [ ] Subiu containers (`npm run docker:up`)
- [ ] Executou migrations (`npm run migration:run`)
- [ ] Executou seeds (`npm run seed`)
- [ ] Restaurou backup (`./scripts/restore-database.sh backup_file.sql`)
- [ ] Testou aplicação (`npm run dev`)

---

**Dica**: Para desenvolvimento em equipe, considere usar o backup mais recente sempre no repositório!
