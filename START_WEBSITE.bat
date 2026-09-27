@echo off
cd /d "%~dp0"
set PORT=8789
echo Starting Sariga and Stefano V7.4.2 Media Restore...
start "" "http://localhost:%PORT%/index.html?v=20mediarestore"
py -m http.server %PORT%
if errorlevel 1 python -m http.server %PORT%
