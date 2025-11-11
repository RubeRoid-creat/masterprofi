# Скрипт для запуска Backend и Frontend
# Запустите: powershell -ExecutionPolicy Bypass -File START_SERVICES.ps1

Write-Host "Starting MasterProfi Services..." -ForegroundColor Cyan
Write-Host ""

# Получаем текущую директорию
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Проверка и создание .env файла
$backendPath = Join-Path $rootDir "backend"
$webAdminPath = Join-Path $rootDir "web-admin"

if (-not (Test-Path (Join-Path $backendPath ".env"))) {
    Write-Host "Creating .env file from env.example..." -ForegroundColor Yellow
    Copy-Item (Join-Path $backendPath "env.example") (Join-Path $backendPath ".env")
    Write-Host ".env file created" -ForegroundColor Green
}

# Запуск Backend
Write-Host ""
Write-Host "Starting Backend..." -ForegroundColor Cyan
$backendCommand = "cd '$backendPath'; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

Start-Sleep -Seconds 3

# Запуск Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
$frontendCommand = "cd '$webAdminPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ""
Write-Host "Services started!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3000"
Write-Host "   API Docs: http://localhost:3000/api/docs"
Write-Host "   Frontend: http://localhost:5173"
Write-Host ""
Write-Host "Please wait 10-30 seconds for services to fully start..." -ForegroundColor Yellow
Write-Host ""
