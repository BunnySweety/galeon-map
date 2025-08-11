@echo off
echo Starting development server with HTTPS for geolocation testing...
echo.
echo Note: You may need to accept the self-signed certificate warning
echo.

set HTTPS=true
npm run dev

pause 