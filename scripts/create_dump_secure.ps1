param(
  [string]$Container = "sgc-itep-postgres",
  [string]$Database = "sgc_itep",
  [string]$User = "postgres",
  [string]$OutDir = "backups"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$ts = Get-Date -Format "yyyyMMdd_HHmm"
$outFile = Join-Path $OutDir "$($Database)_$ts.sql"

Write-Host "[Backup] Gerando dump em $outFile ..."

try {
  # Redireciona stdout do pg_dump para arquivo UTF-8
  docker exec -t $Container pg_dump -U $User -d $Database |
    Out-File -FilePath $outFile -Encoding utf8

  if (-not (Test-Path $outFile)) { throw "Arquivo de backup não foi criado" }
  $size = (Get-Item $outFile).Length
  Write-Host "[Backup] Concluído ($([math]::Round($size/1KB,2)) KB)"
} catch {
  Write-Error "[Backup] Falhou: $($_.Exception.Message)"
  exit 1
}
