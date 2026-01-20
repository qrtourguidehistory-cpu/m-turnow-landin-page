# Script para configurar Git Credential Manager despues de la instalacion
# Ejecutar: .\configurar-gcm.ps1

Write-Host "=== Configurando Git Credential Manager ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si Git Credential Manager esta instalado
Write-Host "Verificando instalacion..." -ForegroundColor Yellow
$installedPaths = @(
    "$env:ProgramFiles\Git Credential Manager\gcmcore.exe",
    "${env:ProgramFiles(x86)}\Git Credential Manager\gcmcore.exe",
    "$env:LOCALAPPDATA\Programs\GitCredentialManager\gcmcore.exe",
    "$env:ProgramFiles\Git\mingw64\libexec\git-core\git-credential-manager-core.exe"
)

$found = $false
$gcmPath = $null

foreach ($path in $installedPaths) {
    if (Test-Path $path) {
        Write-Host "[OK] Git Credential Manager encontrado en: $path" -ForegroundColor Green
        $found = $true
        $gcmPath = $path
        break
    }
}

if (-not $found) {
    Write-Host "[ADVERTENCIA] Git Credential Manager no encontrado en las rutas comunes." -ForegroundColor Yellow
    Write-Host "Por favor, asegurate de haber ejecutado el instalador." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Si acabas de instalar, cierra y vuelve a abrir PowerShell y ejecuta este script de nuevo." -ForegroundColor Cyan
    Write-Host ""
    
    $continue = Read-Host "¿Deseas continuar con la configuracion de todas formas? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit
    }
}

Write-Host ""
Write-Host "Configurando Git..." -ForegroundColor Yellow

# Configurar Git Credential Manager
Write-Host "  - Configurando credential.helper..." -ForegroundColor Gray
git config --global credential.helper manager-core

if ($LASTEXITCODE -ne 0) {
    Write-Host "    Intentando con 'manager'..." -ForegroundColor Yellow
    git config --global credential.helper manager
}

# Configurar para GitHub
Write-Host "  - Configurando GitHub..." -ForegroundColor Gray
git config --global credential.https://github.com.useHttpPath true
git config --global credential.https://github.com.oauthDeviceFlow true
git config --global credential.https://gist.github.com.useHttpPath true

Write-Host ""
Write-Host "[OK] Configuracion completada!" -ForegroundColor Green
Write-Host ""

# Verificar la configuracion
Write-Host "Verificando configuracion..." -ForegroundColor Yellow
$helper = git config --global credential.helper
Write-Host "  credential.helper = $helper" -ForegroundColor Gray

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Git Credential Manager esta configurado!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora cuando hagas 'git push', aparecera automaticamente" -ForegroundColor Yellow
Write-Host "el dialogo naranja para seleccionar tu cuenta de GitHub." -ForegroundColor Yellow
Write-Host ""
Write-Host "Prueba con:" -ForegroundColor Cyan
Write-Host "  cd `"C:\Users\laptop\Desktop\Mi Turnow Landing page`"" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
Write-Host ""

