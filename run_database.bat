@echo off
title Ecommerce - Database (PostgreSQL)
echo Starting PostgreSQL via Docker...
cd /d "%~dp0"
docker start ecommerce_postgres 2>nul || docker run -d ^
  --name ecommerce_postgres ^
  -e POSTGRES_DB=ecommerce_db ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_PASSWORD=1234 ^
  -p 5432:5432 ^
  postgres:15-alpine
echo.
echo PostgreSQL is running on port 5432
echo DB: ecommerce_db  |  User: postgres  |  Password: 1234
echo.
pause
