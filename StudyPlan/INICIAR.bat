@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Instala Node.js 24 LTS desde https://nodejs.org/
 pause
 exit /b 1
)
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
start "" http://localhost:3000
call npm start
exit /b
:error
echo No se pudo iniciar StudyPlan. Revisa el mensaje anterior.
pause
exit /b 1
