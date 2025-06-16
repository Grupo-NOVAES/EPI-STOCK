@echo off
echo ==================================
echo    INICIANDO PROJETO EPI-STOCK
echo ==================================

echo.
echo [1/2] Iniciando o Back-end (API)...
start "Backend" /D "back-end" initBackEnd.bat

echo.
echo [2/2] Iniciando o Front-end (React App)...
start "Frontend" /D "stock-app" initFrontEnd.bat

echo.
echo Scripts de inicializacao foram chamados.
echo Duas novas janelas (Backend e Frontend) devem ter sido abertas.