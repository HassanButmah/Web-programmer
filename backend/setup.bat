@echo off
cd /d "%~dp0"
echo BaladVerse backend setup...
if not exist .env copy .env.example .env

echo Stopping stray Node processes (ignore errors)...
taskkill /F /IM node.exe 2>nul

echo Removing old Prisma engine cache...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"

call npx prisma generate
if errorlevel 1 (
  echo.
  echo Prisma generate failed. Close Cursor/VS Code and antivirus scans on this folder, then run this file again as Administrator.
  pause
  exit /b 1
)

call npx prisma db push
call npx ts-node --transpile-only prisma/seed.ts
echo.
echo Done. Start API with: npm run dev
pause
