@echo off
REM ================================================================
REM  Abre la web de BIRA en un servidor local: http://localhost:4317
REM  Doble clic en este archivo. Intenta con Node y, si no esta,
REM  usa Python automaticamente.
REM ================================================================
setlocal
set PORT=4317
set URL=http://localhost:%PORT%

echo.
echo   Iniciando servidor de BIRA en %URL%
echo.

REM --- Intento 1: Node.js ---
where node >nul 2>nul
if %errorlevel%==0 (
    echo   Usando Node.js...
    REM Abre el navegador tras 2 segundos, sin bloquear el servidor
    start "" cmd /c "timeout /t 2 >nul & start %URL%"
    node "%~dp0server.js"
    goto fin
)

REM --- Intento 2: Python (comando python) ---
where python >nul 2>nul
if %errorlevel%==0 (
    echo   Node no encontrado. Usando Python...
    start "" cmd /c "timeout /t 2 >nul & start %URL%"
    python -m http.server %PORT% --directory "%~dp0"
    goto fin
)

REM --- Intento 3: Python (comando py) ---
where py >nul 2>nul
if %errorlevel%==0 (
    echo   Node no encontrado. Usando Python (py)...
    start "" cmd /c "timeout /t 2 >nul & start %URL%"
    py -m http.server %PORT% --directory "%~dp0"
    goto fin
)

REM --- Nada instalado ---
echo.
echo   No se encontro Node.js ni Python en tu equipo.
echo   Instala uno de los dos:
echo     - Node.js:  https://nodejs.org  (boton LTS)
echo     - Python:   https://www.python.org/downloads/
echo.

:fin
pause
endlocal
