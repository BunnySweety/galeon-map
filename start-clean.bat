@echo off
echo ========================================
echo   Démarrage propre de l'application
echo ========================================

echo.
echo [1/4] Nettoyage des caches...
if exist .next (
    rmdir /s /q .next
    echo   - Cache .next supprimé
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo   - Cache node_modules supprimé
)
if exist .swc (
    rmdir /s /q .swc
    echo   - Cache .swc supprimé
)

echo.
echo [2/4] Arrêt des processus Node existants...
taskkill /F /IM node.exe 2>nul && echo   - Processus Node arrêtés || echo   - Aucun processus Node à arrêter

echo.
echo [3/4] Vérification de la configuration...
if exist next.config.mjs (
    echo   - Configuration Next.js trouvée (next.config.mjs)
) else (
    echo   - ATTENTION: Aucune configuration Next.js trouvée
)

echo.
echo [4/4] Démarrage du serveur de développement...
echo   - Ouverture automatique: http://localhost:3000
echo   - Appuyez sur Ctrl+C pour arrêter
echo.
npm run dev 