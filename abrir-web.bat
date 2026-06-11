@echo off
REM Abre la web de BIRA en el navegador y arranca un servidor local.
REM Doble clic aqui y se abre en http://localhost:4317
echo Iniciando servidor de BIRA en http://localhost:4317 ...
start "" http://localhost:4317
node "%~dp0server.js"
pause
