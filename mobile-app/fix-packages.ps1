# PowerShell скрипт для исправления версий пакетов

Write-Host "Удаление lock файлов..." -ForegroundColor Yellow
if (Test-Path package-lock.json) { Remove-Item package-lock.json }
if (Test-Path yarn.lock) { Remove-Item yarn.lock }

Write-Host "Установка Expo..." -ForegroundColor Yellow
npm install expo@~50.0.0 --save

Write-Host "Использование expo install для подбора правильных версий..." -ForegroundColor Yellow
Write-Host "Это может занять несколько минут..." -ForegroundColor Yellow

# Установка всех Expo пакетов через expo install (автоматический подбор версий)
npx expo install expo-local-authentication
npx expo install expo-location
npx expo install expo-task-manager
npx expo install expo-document-picker
npx expo install expo-image-picker
npx expo install expo-image-manipulator
npx expo install expo-file-system
npx expo install expo-camera
npx expo install expo-image
npx expo install expo-crypto
npx expo install expo-av
npx expo install expo-notifications
npx expo install expo-device
npx expo install expo-sqlite
npx expo install expo-updates
npx expo install expo-build-properties

Write-Host "Установка остальных зависимостей..." -ForegroundColor Yellow
npm install

Write-Host "Готово! Теперь можно запустить: npm start" -ForegroundColor Green








