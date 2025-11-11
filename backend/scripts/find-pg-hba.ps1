# Скрипт для поиска файла pg_hba.conf

Write-Host "Поиск файла pg_hba.conf..." -ForegroundColor Yellow

# Возможные расположения
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\data\pg_hba.conf",
    "C:\Program Files (x86)\PostgreSQL\*\data\pg_hba.conf",
    "$env:APPDATA\PostgreSQL\*\data\pg_hba.conf",
    "$env:LOCALAPPDATA\PostgreSQL\*\data\pg_hba.conf"
)

$foundFiles = @()

foreach ($path in $possiblePaths) {
    $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
    if ($files) {
        $foundFiles += $files
    }
}

if ($foundFiles.Count -eq 0) {
    Write-Host "`nФайл pg_hba.conf не найден в стандартных местах." -ForegroundColor Red
    Write-Host "`nПопробуйте найти вручную через:" -ForegroundColor Yellow
    Write-Host "  Get-ChildItem -Path 'C:\Program Files\PostgreSQL' -Recurse -Filter 'pg_hba.conf' -ErrorAction SilentlyContinue"
    exit
}

Write-Host "`nНайдено файлов: $($foundFiles.Count)" -ForegroundColor Green
foreach ($file in $foundFiles) {
    Write-Host "`n  $($file.FullName)" -ForegroundColor Cyan
    Write-Host "  Размер: $([math]::Round($file.Length / 1KB, 2)) KB"
    Write-Host "  Изменен: $($file.LastWriteTime)"
}

Write-Host "`n`nДля редактирования выполните от имени администратора:" -ForegroundColor Yellow
Write-Host "  notepad $($foundFiles[0].FullName)"
Write-Host "`nИли используйте другой редактор с правами администратора."

