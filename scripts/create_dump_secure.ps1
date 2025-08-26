<#
Script: create_dump_secure.ps1
Descrição: gera um dump PostgreSQL (formato custom) usando as configurações do arquivo .env (se existir) ou valores embutidos. Opcionalmente encripta o dump com 7-Zip.
Uso:
  .\create_dump_secure.ps1 [-Encrypt] [-EncryptPassword <string>] [-OutDir <path>]
Exemplos:
  .\create_dump_secure.ps1
  .\create_dump_secure.ps1 -Encrypt -EncryptPassword "MinhaSenhaForte"
#>

param(
    [switch]$Encrypt,
    [System.Security.SecureString]$EncryptPassword,
    [string]$OutDir = "$PSScriptRoot\\backups"
)

function Get-EnvFile {
    param([string]$Path)
    $dict = @{}
    if (-not (Test-Path $Path)) { return $dict }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq '' -or $line.StartsWith('#')) { return }
        $parts = $line -split '=',2
        if ($parts.Count -ge 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"')
            $dict[$key] = $value
        }
    }
    return $dict
}

# Valores padrão - usados se .env não estiver presente
$DB_HOST = 'localhost'
$DB_PORT = '5432'
$DB_USER = 'postgres'
$DB_PASS = '@Sanfona1'
$DB_NAME = 'sgc_itep'

# Tentar ler .env na raiz do projeto
 $envPath = Join-Path $PSScriptRoot '..\.env' | Resolve-Path -ErrorAction SilentlyContinue
if ($envPath) {
     $envDict = Get-EnvFile -Path $envPath
    if ($envDict.ContainsKey('DATABASE_HOST')) { $DB_HOST = $envDict['DATABASE_HOST'] }
    if ($envDict.ContainsKey('DATABASE_PORT')) { $DB_PORT = $envDict['DATABASE_PORT'] }
    if ($envDict.ContainsKey('DATABASE_USERNAME')) { $DB_USER = $envDict['DATABASE_USERNAME'] }
    if ($envDict.ContainsKey('DATABASE_PASSWORD')) { $DB_PASS = $envDict['DATABASE_PASSWORD'] }
    if ($envDict.ContainsKey('DATABASE_NAME')) { $DB_NAME = $envDict['DATABASE_NAME'] }
}

# Criar diretório de saída
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

# Nome do arquivo com timestamp
$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$dumpFile = Join-Path $OutDir ("${DB_NAME}_$timestamp.dump")

Write-Host "Destino do dump: $dumpFile"

# Verificar pg_dump
$pgDumpCmd = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDumpCmd) {
    Write-Error "pg_dump não foi encontrado no PATH. Instale o cliente PostgreSQL ou adicione 'C:\\Program Files\\PostgreSQL\\<versao>\\bin' ao PATH."
    exit 2
}

# Executar pg_dump
Write-Host "Iniciando pg_dump para $DB_NAME em ${DB_HOST}:${DB_PORT} como usuário $DB_USER..."
$env:PGPASSWORD = $DB_PASS

try {
    $pgArgs = @('-h', $DB_HOST, '-p', $DB_PORT, '-U', $DB_USER, '-Fc', '-d', $DB_NAME, '-f', $dumpFile)
    $proc = Start-Process -FilePath $pgDumpCmd.Path -ArgumentList $pgArgs -NoNewWindow -Wait -PassThru
    if ($proc.ExitCode -ne 0) {
        Write-Error "pg_dump terminou com código $($proc.ExitCode). Verifique logs e credenciais."
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        exit $proc.ExitCode
    }
    Write-Host "pg_dump finalizado com sucesso: $dumpFile"
}
catch {
    Write-Error "Falha ao executar pg_dump: $_"
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 3
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

# Opcional: encriptar com 7-Zip se solicitado
if ($Encrypt) {
    $sevenZip = Get-Command 7z.exe -ErrorAction SilentlyContinue
    if (-not $sevenZip) {
        Write-Warning "7z.exe não encontrado no PATH. Instale o 7-Zip (adicionar 'C:\\Program Files\\7-Zip' ao PATH) ou execute sem -Encrypt."
    }
    else {
        if (-not $EncryptPassword) {
            # solicitar senha se não fornecida (retorna SecureString)
            $EncryptPassword = Read-Host -Prompt "Senha de encriptação (será solicitada sem eco)" -AsSecureString
        }
        $archive = "$dumpFile.7z"
        Write-Host "Encriptando com 7-Zip: $archive"
        # Converter SecureString para texto por tempo limitado
        $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($EncryptPassword)
        $plainPwd = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) | Out-Null
        $sevenArgs = @('a','-t7z',"-p$plainPwd",'-mhe=on',$archive,$dumpFile)
        $proc7 = Start-Process -FilePath $sevenZip.Path -ArgumentList $sevenArgs -NoNewWindow -Wait -PassThru
        if ($proc7.ExitCode -eq 0) {
            Write-Host "Arquivo encriptado: $archive"
            Write-Host "Removendo dump original (opcional)..."
            # comentado por segurança — descomente se quiser remover o .dump original
            # Remove-Item -Path $dumpFile -Force
        }
        else {
            Write-Warning "7-Zip retornou código $($proc7.ExitCode). Arquivo não encriptado."
        }
    }
}

Write-Host "Concluído. Arquivo gerado em: $OutDir"
Write-Host "Próximo passo sugerido: copie o arquivo para um dispositivo seguro ou faça upload para o Google Drive (preferencialmente encriptado)."
