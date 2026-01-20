# Script para instalar Git Credential Manager
# Ejecutar: .\install-gcm.ps1

Write-Host "=== Instalador de Git Credential Manager ===" -ForegroundColor Cyan
Write-Host ""

# URL del instalador
$gcmUrl = "https://github.com/GitCredentialManager/git-credential-manager/releases/latest/download/gcmcore-win-x86_64.exe"
$downloadPath = "$env:USERPROFILE\Downloads\gcmcore-installer.exe"

# Verificar si ya esta instalado
Write-Host "Verificando instalacion existente..." -ForegroundColor Yellow
$installedPaths = @(
    "$env:ProgramFiles\Git Credential Manager\gcmcore.exe",
    "${env:ProgramFiles(x86)}\Git Credential Manager\gcmcore.exe",
    "$env:LOCALAPPDATA\Programs\GitCredentialManager\gcmcore.exe"
)

$found = $false
foreach ($path in $installedPaths) {
    if (Test-Path $path) {
        Write-Host "[OK] Git Credential Manager encontrado en: $path" -ForegroundColor Green
        $found = $true
        break
    }
}

if ($found) {
    Write-Host ""
    Write-Host "Git Credential Manager ya esta instalado." -ForegroundColor Green
    Write-Host "Configurando Git para usarlo..." -ForegroundColor Yellow
    
    git config --global credential.helper manager-core
    git config --global credential.https://github.com.useHttpPath true
    git config --global credential.https://github.com.oauthDeviceFlow true
    
    Write-Host ""
    Write-Host "[OK] Configuracion completada!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora cuando hagas 'git push', aparecera el dialogo naranja" -ForegroundColor Cyan
    Write-Host "para seleccionar tu cuenta de GitHub." -ForegroundColor Cyan
    exit 0
}

# Descargar el instalador
Write-Host "Descargando Git Credential Manager..." -ForegroundColor Yellow
Write-Host "URL: $gcmUrl" -ForegroundColor Gray
Write-Host "Destino: $downloadPath" -ForegroundColor Gray
Write-Host ""

try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $gcmUrl -OutFile $downloadPath -UseBasicParsing -ErrorAction Stop
    
    Write-Host "[OK] Descarga completada!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ejecutando instalador..." -ForegroundColor Yellow
    Write-Host "NOTA: El instalador se abrira en una nueva ventana." -ForegroundColor Cyan
    Write-Host "Sigue las instrucciones del instalador." -ForegroundColor Cyan
    Write-Host ""
    
    Start-Process -FilePath $downloadPath -Wait
    
    Write-Host ""
    Write-Host "Esperando 3 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    $installed = $false
    foreach ($path in $installedPaths) {
        if (Test-Path $path) {
            Write-Host "[OK] Instalacion exitosa!" -ForegroundColor Green
            $installed = $true
            break
        }
    }
    
    if ($installed) {
        Write-Host ""
        Write-Host "Configurando Git..." -ForegroundColor Yellow
        
        git config --global credential.helper manager-core
        git config --global credential.https://github.com.useHttpPath true
        git config --global credential.https://github.com.oauthDeviceFlow true
        
        Write-Host ""
        Write-Host "[OK] Configuracion completada!" -ForegroundColor Green
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "Git Credential Manager esta listo!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Ahora cuando hagas 'git push', aparecera automaticamente" -ForegroundColor Yellow
        Write-Host "el dialogo naranja para seleccionar tu cuenta de GitHub." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Prueba con: git push origin main" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "[ADVERTENCIA] La instalacion puede no haberse completado." -ForegroundColor Yellow
        Write-Host "Por favor, verifica manualmente o descarga desde:" -ForegroundColor Yellow
        Write-Host "https://github.com/GitCredentialManager/git-credential-manager/releases/latest" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Error al descargar: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Descarga manual:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://github.com/GitCredentialManager/git-credential-manager/releases/latest" -ForegroundColor White
    Write-Host "2. Descarga: gcmcore-win-x86_64.exe" -ForegroundColor White
    Write-Host "3. Ejecuta el instalador" -ForegroundColor White
    Write-Host "4. Luego ejecuta estos comandos:" -ForegroundColor White
    Write-Host "   git config --global credential.helper manager-core" -ForegroundColor Gray
    Write-Host "   git config --global credential.https://github.com.useHttpPath true" -ForegroundColor Gray
    Write-Host "   git config --global credential.https://github.com.oauthDeviceFlow true" -ForegroundColor Gray
}
