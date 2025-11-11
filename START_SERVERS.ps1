# MasterProfi Server Startup Script

Write-Host "🚀 Starting MasterProfi Servers..." -ForegroundColor Green

# Navigate to project root
Set-Location "Z:\App RBT"

# Kill existing Node processes
Write-Host "`n🛑 Stopping existing servers..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend
Write-Host "`n🔧 Starting Backend on port 3000..." -ForegroundColor Cyan
$backendPath = Join-Path $PWD "backend"
$backendCmd = "cd '$backendPath'; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal
Start-Sleep -Seconds 8

# Start Frontend
Write-Host "`n🎨 Starting Frontend on port 5173..." -ForegroundColor Cyan
$frontendPath = Join-Path $PWD "web-admin"
$frontendCmd = "cd '$frontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal
Start-Sleep -Seconds 5

# Wait and check
Start-Sleep -Seconds 5
Write-Host "`n✅ Servers should be running!" -ForegroundColor Green
Write-Host "`n📍 Backend: http://localhost:3000" -ForegroundColor White
Write-Host "📍 API Docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor White

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "`n🎉 Done! Check your browser." -ForegroundColor Green

Set-Location ..

