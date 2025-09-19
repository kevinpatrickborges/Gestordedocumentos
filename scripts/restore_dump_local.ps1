param(
  [string]$File = "",
  [switch]$UseLatest,
  [string]$Container = "sgc-itep-postgres",
  [string]$Database = "sgc_itep",
  [string]$User = "postgres",
  [string]$Dir = "backups"
)

$ErrorActionPreference = 'Stop'

function Get-LatestSqlFile([string]$dir){
  if (-not (Test-Path $dir)) { throw "Diretório de backups não existe: $dir" }
  $files = Get-ChildItem -Path $dir -Filter *.sql -File | Sort-Object LastWriteTime -Descending
  if ($files.Count -eq 0) { throw "Nenhum arquivo .sql encontrado em $dir" }
  return $files[0].FullName
}

if ([string]::IsNullOrWhiteSpace($File)) {
  if ($UseLatest) {
    $File = Get-LatestSqlFile -dir $Dir
  } else {
    throw "Informe -File <caminho.sql> ou use -UseLatest"
  }
}

if (-not (Test-Path $File)) { throw "Arquivo não encontrado: $File" }

Write-Host "[Restore] Restaurando $File para $Database ..."

try {
  $tmp = "/tmp/restore.sql"
  docker cp $File "$Container:$tmp" | Out-Null
  docker exec -i $Container psql -U $User -d $Database -f $tmp | Out-Null
  docker exec -i $Container bash -lc "rm -f $tmp" | Out-Null
  Write-Host "[Restore] Concluído com sucesso"
} catch {
  Write-Error "[Restore] Falhou: $($_.Exception.Message)"
  exit 1
}
