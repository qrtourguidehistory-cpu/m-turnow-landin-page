# Script para seleccionar el repositorio remoto antes de hacer push
# Uso: .\git-push-select.ps1

Write-Host "=== Selección de Repositorio Remoto ===" -ForegroundColor Cyan
Write-Host ""

# Obtener los remotes configurados
$remotes = git remote -v | Select-String "push" | ForEach-Object {
    if ($_ -match "(\S+)\s+(\S+)\s+\(push\)") {
        [PSCustomObject]@{
            Name = $matches[1]
            URL = $matches[2]
        }
    }
}

if ($remotes.Count -eq 0) {
    Write-Host "No se encontraron remotes configurados." -ForegroundColor Red
    Write-Host "¿Deseas agregar un nuevo remote? (s/n)" -ForegroundColor Yellow
    $addRemote = Read-Host
    if ($addRemote -eq "s" -or $addRemote -eq "S") {
        Write-Host "Ingresa el nombre del remote (ej: origin):" -ForegroundColor Yellow
        $remoteName = Read-Host
        Write-Host "Ingresa la URL del repositorio:" -ForegroundColor Yellow
        $remoteURL = Read-Host
        git remote add $remoteName $remoteURL
        Write-Host "Remote agregado exitosamente." -ForegroundColor Green
        $remotes = @([PSCustomObject]@{Name = $remoteName; URL = $remoteURL})
    } else {
        exit
    }
}

# Mostrar remotes disponibles
Write-Host "Repositorios remotos disponibles:" -ForegroundColor Yellow
Write-Host ""
for ($i = 0; $i -lt $remotes.Count; $i++) {
    Write-Host "[$($i + 1)] $($remotes[$i].Name) - $($remotes[$i].URL)" -ForegroundColor White
}

Write-Host ""
Write-Host "Selecciona el número del repositorio al que deseas hacer push:" -ForegroundColor Yellow
$selection = Read-Host

if ($selection -match "^\d+$" -and [int]$selection -ge 1 -and [int]$selection -le $remotes.Count) {
    $selectedRemote = $remotes[[int]$selection - 1]
    Write-Host ""
    Write-Host "Repositorio seleccionado: $($selectedRemote.Name) - $($selectedRemote.URL)" -ForegroundColor Green
    Write-Host ""
    
    # Verificar la rama actual
    $currentBranch = git branch --show-current
    Write-Host "Rama actual: $currentBranch" -ForegroundColor Cyan
    
    # Verificar si hay cambios sin commitear
    $status = git status --porcelain
    if ($status) {
        Write-Host ""
        Write-Host "Hay cambios sin commitear. ¿Deseas hacer commit antes del push? (s/n)" -ForegroundColor Yellow
        $doCommit = Read-Host
        if ($doCommit -eq "s" -or $doCommit -eq "S") {
            Write-Host "Ingresa el mensaje del commit:" -ForegroundColor Yellow
            $commitMessage = Read-Host
            git add .
            git commit -m $commitMessage
            Write-Host "Commit realizado exitosamente." -ForegroundColor Green
        }
    }
    
    # Hacer push
    Write-Host ""
    Write-Host "¿Deseas hacer push a $($selectedRemote.Name)/main? (s/n)" -ForegroundColor Yellow
    $confirmPush = Read-Host
    if ($confirmPush -eq "s" -or $confirmPush -eq "S") {
        Write-Host ""
        Write-Host "Haciendo push a $($selectedRemote.Name)..." -ForegroundColor Cyan
        git push $selectedRemote.Name $currentBranch`:main
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Push exitoso!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Error al hacer push. Verifica los permisos y la conexión." -ForegroundColor Red
        }
    } else {
        Write-Host "Push cancelado." -ForegroundColor Yellow
    }
} else {
    Write-Host "Selección inválida." -ForegroundColor Red
}
