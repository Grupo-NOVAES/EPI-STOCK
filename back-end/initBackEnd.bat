@echo off
title Backend
echo [Backend] Instalando dependencias...
call npm install

echo.
echo [Backend] Iniciando o servidor...
call npm run db:init
call npm run start