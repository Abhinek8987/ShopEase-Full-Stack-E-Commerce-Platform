@echo off
title Ecommerce - Backend
echo Starting Ecommerce Backend on port 8081...
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause
