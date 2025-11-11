$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

Write-Host "=== Restoring pg_hba.conf security ===" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $pgHbaPath)) {
    Write-Host "File not found: $pgHbaPath" -ForegroundColor Red
    exit 1
}

$content = Get-Content $pgHbaPath -Raw
$originalContent = $content

$content = $content -replace '127\.0\.0\.1/32\s+trust', '127.0.0.1/32            scram-sha-256'
$content = $content -replace '::1/128\s+trust', '::1/128                 scram-sha-256'

if ($content -eq $originalContent) {
    Write-Host "No changes made. File may already be secure." -ForegroundColor Yellow
    exit 0
}

Set-Content -Path $pgHbaPath -Value $content -NoNewline
Write-Host "Security restored: trust replaced with scram-sha-256" -ForegroundColor Green

Write-Host ""
Write-Host "Restarting PostgreSQL service..." -ForegroundColor Yellow
Restart-Service postgresql-x64-18 -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done! PostgreSQL is now secure." -ForegroundColor Green

