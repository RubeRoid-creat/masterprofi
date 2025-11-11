# MasterProfi Database Setup Script
# PowerShell script to setup PostgreSQL database

Write-Host "MasterProfi Database Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if PostgreSQL is installed and running
$pgService = Get-Service -Name PostgreSQL -ErrorAction SilentlyContinue

if ($pgService) {
    Write-Host "✓ PostgreSQL service found" -ForegroundColor Green
    
    if ($pgService.Status -eq 'Running') {
        Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "⚠ PostgreSQL is not running. Starting..." -ForegroundColor Yellow
        Start-Service PostgreSQL
        Start-Sleep -Seconds 3
    }
} else {
    Write-Host "✗ PostgreSQL not found as service" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or use Docker:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

# Try to find psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

$psql = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psql = $path
        Write-Host "✓ Found psql at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psql) {
    Write-Host "⚠ Could not find psql.exe" -ForegroundColor Yellow
    Write-Host "Please run these SQL commands manually in pgAdmin or psql:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "CREATE DATABASE masterprofi;" -ForegroundColor Cyan
    Write-Host "CREATE USER masterprofi WITH PASSWORD 'masterprofi_pass';" -ForegroundColor Cyan
    Write-Host "GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then create backend/.env file with:" -ForegroundColor Yellow
    Write-Host "DB_HOST=localhost" -ForegroundColor Cyan
    Write-Host "DB_PORT=5432" -ForegroundColor Cyan
    Write-Host "DB_USERNAME=masterprofi" -ForegroundColor Cyan
    Write-Host "DB_PASSWORD=masterprofi_pass" -ForegroundColor Cyan
    Write-Host "DB_NAME=masterprofi" -ForegroundColor Cyan
    exit 1
}

# Create database and user
Write-Host "`nCreating database and user..." -ForegroundColor Cyan

$env:PGPASSWORD = "postgres"
& $psql -U postgres -c "CREATE DATABASE masterprofi;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database 'masterprofi' created" -ForegroundColor Green
} else {
    Write-Host "⚠ Database may already exist (continuing...)" -ForegroundColor Yellow
}

& $psql -U postgres -c "CREATE USER masterprofi WITH PASSWORD 'masterprofi_pass';" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ User 'masterprofi' created" -ForegroundColor Green
} else {
    Write-Host "⚠ User may already exist (continuing...)" -ForegroundColor Yellow
}

& $psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Permissions granted" -ForegroundColor Green
}

# Create .env file if it doesn't exist
$envPath = "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "`nCreating backend\.env file..." -ForegroundColor Cyan
    @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=masterprofi
DB_PASSWORD=masterprofi_pass
DB_NAME=masterprofi

# JWT Configuration
JWT_SECRET=dev-secret-key-$(Get-Random -Minimum 100000 -Maximum 999999)
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=dev-refresh-secret-$(Get-Random -Minimum 100000 -Maximum 999999)

# Server Configuration
PORT=3000
NODE_ENV=development

# Redis
REDIS_URL=redis://localhost:6379

# Frontend
FRONTEND_URL=http://localhost:5173
"@ | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "✓ Created backend\.env file" -ForegroundColor Green
} else {
    Write-Host "✓ backend\.env already exists" -ForegroundColor Green
}

Write-Host "`n✓ Database setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. cd backend" -ForegroundColor Yellow
Write-Host "  2. npm install" -ForegroundColor Yellow
Write-Host "  3. npm run start:dev" -ForegroundColor Yellow
Write-Host ""

