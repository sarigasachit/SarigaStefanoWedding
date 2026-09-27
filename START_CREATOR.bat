@echo off
cd /d "%~dp0"
set PORT=8789
start "" "http://localhost:%PORT%/creator.html?v=20mediarestore"
