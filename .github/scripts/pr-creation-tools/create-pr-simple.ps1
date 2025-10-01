Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Creation du Pull Request Sprint 1 & 2" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour creer un token GitHub:" -ForegroundColor Yellow
Write-Host "1. https://github.com/settings/tokens/new" -ForegroundColor Green
Write-Host "2. Nom: 'galeon-pr-creation'" -ForegroundColor Green
Write-Host "3. Permission: cochez 'repo'" -ForegroundColor Green
Write-Host "4. Generate token" -ForegroundColor Green
Write-Host ""
$token = Read-Host "Collez votre GitHub token"
Write-Host ""
Write-Host "Creation du PR..." -ForegroundColor Yellow

$env:GITHUB_TOKEN = $token

# Ouvrir la page GitHub pour créer le PR manuellement avec description pré-remplie
Write-Host "Ouverture de GitHub..." -ForegroundColor Green
Start-Process "https://github.com/galeon-community/hospital-map/compare/main...feature/accessibility-aria-labels?expand=1&title=Sprint%201%20%26%202%3A%20Accessibility%2C%20Performance%20%26%20Testing%20%287.0%20%E2%86%92%209.7%2F10%29"

Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. La page GitHub s'est ouverte dans votre navigateur" -ForegroundColor White
Write-Host "2. Copiez la description depuis CREATE_PR.md" -ForegroundColor White
Write-Host "3. Cliquez sur 'Create pull request'" -ForegroundColor White
