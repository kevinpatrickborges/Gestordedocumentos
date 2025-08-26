<#
Script: restore_dump_local.ps1
Descrição: Restaura um arquivo .dump gerado pelo create_dump_secure.ps1 em uma instância Postgres local.
Suporta:
 - Restauração direta com pg_restore (se o cliente estiver instalado)
 - Restauração via container Docker (se não houver pg_restore local)

Uso:
  .\restore_dump_local.ps1 -DumpPath C:\caminho\para\sgc_itep_20250825_121211.dump

O script tenta ler as configurações do `.env` (na raiz do repo) para obter DB_NAME e DB_USER.
Ele pedirá a senha do usuário local do Postgres (não a senha do dump).
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$DumpPath,

    [string]$TargetDbName,

    [string]$PgUser,

    [int]$PgPort = 5432,

    [string]$PgHost = 'localhost'
)

function Get-EnvFileValues {
    param([string]$Path)
    $result = @{}
    if (-not (Test-Path $Path)) { return $result }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq '' -or $line.StartsWith('#')) { return }
        $parts = $line -split '=',2
        if ($parts.Count -ge 2) {
            $k = $parts[0].Trim()
            $v = $parts[1].Trim().Trim('"')
            $result[$k] = $v
        }
    }
    return $result
}

# Ler .env (um nível acima do script)
$envPath = Join-Path $PSScriptRoot '..\.env'
$envVals = Get-EnvFileValues -Path $envPath
if (-not $PgUser -and $envVals.ContainsKey('DATABASE_USERNAME')) { $PgUser = $envVals['DATABASE_USERNAME'] }
if (-not $TargetDbName -and $envVals.ContainsKey('DATABASE_NAME')) { $TargetDbName = $envVals['DATABASE_NAME'] }
if ($envVals.ContainsKey('DATABASE_HOST')) { $PgHost = $envVals['DATABASE_HOST'] }
if ($envVals.ContainsKey('DATABASE_PORT')) { [int]$PgPort = [int]$envVals['DATABASE_PORT'] }

if (-not (Test-Path $DumpPath)) {
    Write-Error "Arquivo de dump não encontrado: $DumpPath"
    exit 1
}

if (-not $TargetDbName) {
    Write-Error "Nome do database alvo não definido e não encontrado no .env. Use -TargetDbName para especificar.";
    exit 2
}

# Solicitar senha do usuário do Postgres local
$pgPass = Read-Host -Prompt "Senha do usuário '$PgUser' no Postgres local (não será exibida)" -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPass)
$plainPgPass = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) | Out-Null

# Verificar se pg_restore está disponível
$pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
$createdb = Get-Command createdb -ErrorAction SilentlyContinue

if ($pgRestore -and $createdb) {
    Write-Host "pg_restore encontrado. Restaurando diretamente no host..."
    $env:PGPASSWORD = $plainPgPass
    # Criar database alvo (pode falhar se já existir)
    & $createdb -h $PgHost -p $PgPort -U $PgUser $TargetDbName 2>$null
    # Restaurar (no formato custom)
    $args = @('-h', $PgHost, '-p', $PgPort.ToString(), '-U', $PgUser, '-d', $TargetDbName, '-v', $DumpPath)
    $proc = Start-Process -FilePath $pgRestore.Path -ArgumentList $args -NoNewWindow -Wait -PassThru
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    if ($proc.ExitCode -eq 0) { Write-Host "Restauração concluída com sucesso." } else { Write-Error "pg_restore retornou código $($proc.ExitCode)" }
    exit $proc.ExitCode
}

# Fallback: usar Docker se instalado
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Error "Nem pg_restore nem Docker foram encontrados. Instale pg_dump/pg_restore ou o Docker e tente novamente."
    exit 3
}

Write-Host "pg_restore não encontrado; usaremos um container Docker para restaurar.";

# Garantir pasta de backups montada
$hostBackupDir = Split-Path -Path $DumpPath -Parent
$basename = Split-Path -Path $DumpPath -Leaf

# Escolher imagem compatível: usar postgres:17 como padrão
$image = 'postgres:17'

Write-Host "Iniciando container temporário para restaurar o arquivo $basename no DB $TargetDbName..."

# Comando de restauração dentro do container
$cmd = @(
    'sh', '-c',
    "pg_restore -h host.docker.internal -p $PgPort -U $PgUser -d $TargetDbName -v /backups/$basename"
)

# Executar docker run
$dockerArgs = @('run','--rm', '-e', "PGPASSWORD=$plainPgPass", '-v', "'${hostBackupDir}:/backups'", $image) + $cmd

# Como Start-Process no Windows com docker e argumentos pode ser problemático, usaremos & docker ...
$runCmd = "docker run --rm -e PGPASSWORD=$plainPgPass -v `"$hostBackupDir`":/backups $image pg_restore -h host.docker.internal -p $PgPort -U $PgUser -d $TargetDbName -v /backups/$basename"

Write-Host "Executando: $runCmd"
Invoke-Expression $runCmd

Write-Host "Se houve erro, verifique versões do Postgres e extensões necessárias (ex: postgis)."

# Recomendações finais
Write-Host "Pronto. Verifique o banco restaurado localmente e atualize o .env se necessário."
