@echo off
REM Abre la web de BIRA en el navegador y arranca un servidor local.
REM Doble clic aqui y luego abre http://localhost:4317
echo Iniciando servidor de BIRA en http://localhost:4317 ...
start "" http://localhost:4317
node "%~dp0..\.claude\preview-server.js"
pause
