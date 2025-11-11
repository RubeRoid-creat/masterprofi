$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

Write-Host "=== Changing pg_hba.conf ===" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $pgHbaPath)) {
    Write-Host "File not found: $pgHbaPath" -ForegroundColor Red
    exit 1
}

Write-Host "File found: $pgHbaPath" -ForegroundColor Green

$backupPath = "$pgHbaPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $pgHbaPath $backupPath
Write-Host "Backup created: $backupPath" -ForegroundColor Green

$content = Get-Content $pgHbaPath -Raw
$originalContent = $content

$content = $content -replace '127\.0\.0\.1/32\s+(md5|scram-sha-256)', '127.0.0.1/32            trust'
$content = $content -replace '::1/128\s+(md5|scram-sha-256)', '::1/128                 trust'

if ($content -eq $originalContent) {
    Write-Host "No changes made. File may already be set to trust." -ForegroundColor Yellow
    exit 1
}

Set-Content -Path $pgHbaPath -Value $content -NoNewline
Write-Host "File changed: md5 replaced with trust" -ForegroundColor Green

Write-Host ""
Write-Host "Restarting PostgreSQL service..." -ForegroundColor Yellow
Restart-Service postgresql-x64-18 -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done! Now run: node scripts/auto-reset-password.js" -ForegroundColor Green
