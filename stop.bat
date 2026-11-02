@echo off
title CashFlow-Guardian Shutdown

echo ==============================================================================
echo                   CASHFLOW-GUARDIAN SHUTDOWN UTILITY
echo ==============================================================================
echo.
echo [*] Terminating CashFlow-Guardian processes...

:: Kill processes on port 8080 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo    Stopping Backend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo    Stopping Frontend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [*] All CashFlow-Guardian services have been stopped.
echo ==============================================================================
ping -n 3 127.0.0.1 >nul 2>&1
