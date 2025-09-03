@echo off
setlocal
set PORT=%1
if "%PORT%"=="" set PORT=5173
powershell -ExecutionPolicy Bypass -File "%~dp0run.ps1" -Port %PORT%
endlocal
