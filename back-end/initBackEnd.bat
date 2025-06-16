@echo off
title Backend - EPI Stock

echo Instalando dependencias do Back-end (npm install)...
call npm install

echo Inicializando dados no banco (db:init)...
call npm run db:init

echo.
echo Iniciando o servidor do Back-end (npm start)...
call npm run start