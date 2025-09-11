# SGC‑ITEP — Backup e Sincronização entre Máquinas (Dev)

Este guia mostra como você trabalha no projeto em duas máquinas (ex.: casa e trabalho), usando Docker para o PostgreSQL, migrations do TypeORM e arquivos de backup na pasta `backups/`.

> Observação: O container do banco usado nos exemplos é `sgc-itep-postgres` e o database é `sgc_itep` (mesmos nomes que você já usa). Ajuste se estiver diferente no seu ambiente.

---

## Pré‑requisitos

- Git
- Node.js 18+ e npm
- Docker Desktop (ou Docker Engine + Compose)

## Primeira vez na máquina

1. Clone o repositório
   ```bash
   git clone <repo-url>
   cd SGC-ITEP-NESTJS
   ```

2. Crie seu `.env` a partir do exemplo
   ```bash
   cp .env.example .env
   # Edite senhas/porta se necessário (DATABASE_* e JWT_*)
   ```

3. Suba o Postgres (Docker)
   ```bash
   # Se você tem docker-compose.yml que define o serviço "db", use:
   docker compose up -d db
   # Se você já tem o container criado como "sgc-itep-postgres", basta garantir que está rodando:
   docker start sgc-itep-postgres
   ```

4. Instale dependências e rode migrations
   ```bash
   npm ci
   npm run migration:run
   # (opcional) seeds, se existirem
   npm run seed
   ```

5. Rode a aplicação
   ```bash
   npm run start:dev      # backend
   # frontend (em ./frontend) se aplicável
   ```

---

## Fluxo diário de sincronização (casa ↔ trabalho)

1. Na máquina A (ex.: casa):
   - Trabalhe normalmente
   - (Opcional) gere um backup de dados
   - `git add . && git commit -m "..." && git push`

2. Na máquina B (ex.: trabalho):
   - `git pull`
   - Suba o Postgres (Docker) se necessário
   - `npm run migration:run`
   - (Opcional) restaure o backup gerado na máquina A

> Importante: migrations são versionadas no git e reconstroem o schema. Os dados do banco não viajam pelo git — use backup/restore quando quiser os mesmos dados nas duas máquinas.

---

## Backup e Restore (PostgreSQL via Docker)

- Crie a pasta `backups/` (já existe no repo com um exemplo):
  ```bash
  mkdir -p backups
  ```

### Com um comando (prático)

- Backup (PowerShell/Windows):
  ```bash
  npm run docker:backup
  ```
  Gera `backups/sgc_itep_YYYYMMDD_HHmm.sql` automaticamente.

- Restore (PowerShell/Windows) — mais recente da pasta `backups/`:
  ```bash
  npm run docker:restore
  ```
  Também aceita arquivo específico:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/restore_dump_local.ps1 -File backups\meu_backup.sql
  ```

> Dica: mantenha a pasta `backups/` sincronizada no seu Drive pessoal. Na máquina B, é só rodar `npm run docker:restore` que ele usa o arquivo mais recente.

### Backup (arquivo .sql) manual

- Linux/macOS (Bash):
  ```bash
  TS=$(date +%Y%m%d_%H%M)
  docker exec -t sgc-itep-postgres \
    pg_dump -U postgres -d sgc_itep > backups/sgc_itep_$TS.sql
  ```

- Windows PowerShell:
  ```powershell
  $ts = Get-Date -Format "yyyyMMdd_HHmm"
  docker exec -t sgc-itep-postgres pg_dump -U postgres -d sgc_itep > "backups/sgc_itep_$ts.sql"
  ```

### Backup comprimido (opcional)

- Linux/macOS:
  ```bash
  TS=$(date +%Y%m%d_%H%M)
  docker exec -t sgc-itep-postgres pg_dump -U postgres -d sgc_itep | gzip > backups/sgc_itep_$TS.sql.gz
  ```

### Restore (arquivo .sql)

- Linux/macOS:
  ```bash
  docker exec -i sgc-itep-postgres \
    psql -U postgres -d sgc_itep < backups/SGC_ARQUIVO.sql
  ```

- Windows PowerShell:
  ```powershell
  docker exec -i sgc-itep-postgres psql -U postgres -d sgc_itep < "backups\SGC_ARQUIVO.sql"
  ```

### Restore de .sql.gz

- Linux/macOS:
  ```bash
  gunzip -c backups/SGC_ARQUIVO.sql.gz | docker exec -i sgc-itep-postgres psql -U postgres -d sgc_itep
  ```

> Dica: Se precisar “zerar” o banco antes do restore:
> ```bash
> docker exec -it sgc-itep-postgres psql -U postgres -c "DROP DATABASE IF EXISTS sgc_itep; CREATE DATABASE sgc_itep;"
> npm run migration:run
> # (opcional) npm run seed
> ```

---

## Migrations (TypeORM)

- Aplicar migrations pendentes:
  ```bash
  npm run migration:run
  ```

- Reverter a última migration:
  ```bash
  npm run migration:revert
  ```

- Gerar nova migration a partir das entidades (ajuste o data-source conforme seu projeto):
  ```bash
  npm run migration:generate
  # ou explicitando
  npx typeorm-ts-node-commonjs migration:generate -d src/config/data-source.ts src/database/migrations/NomeDaMigration
  ```

> Regra de ouro: em time/produção, NUNCA apague migrations antigas; crie incrementais. Para testes locais, se quiser realmente reiniciar tudo, faça backup antes.

---

## Sobre a pasta `backups/`

- Existe um arquivo de exemplo `backups/backup_exemplo_sync.sql` apenas para referência de estrutura.
- Recomendo adicionar `backups/` ao seu armazenamento pessoal (Drive/OneDrive) e deixar no `.gitignore` — dumps podem conter dados sensíveis.

---

## Perguntas rápidas

- “Puxo tudo ao clonar?”
  - Sim: código, config e migrations. Dados do banco: use backup/restore.
- “Posso trabalhar em duas máquinas?”
  - Sim: commit/push na máquina A; na B: pull + `migration:run` (+ restore se quiser os mesmos dados).
- “E se der erro de permissão/roles no update?”
  - Já habilitamos ADMIN/COORDENADOR/OPERADOR a forçar transição de status. Se precisar afinar regras, me avise.
