@echo off
setlocal enabledelayedexpansion

title CashFlow-Guardian Runner
color 0F

echo ==============================================================================
echo                      CASHFLOW-GUARDIAN LAUNCHER
echo        AI-Powered Enterprise Cash Flow ^& Autonomous Liquidity Engine
echo ==============================================================================
echo.

:: 1. Verify Prerequisites and Built Files
if not exist "backend\build\libs\cashflow-guardian-backend-1.0.0-SNAPSHOT.jar" (
    echo [NOTICE] Application JAR not found. Running installer first...
    echo.
    call install.bat
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Installation failed. Cannot run.
        pause
        exit /b 1
    )
)

if not exist "frontend\node_modules" (
    echo [NOTICE] Frontend node_modules not found. Running npm install...
    cd frontend
    call npm install
    cd ..
)

:: 2. Load Environment Variables (.env)
if exist ".env" (
    echo [*] Loading configuration from .env...
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        set "ENV_KEY=%%A"
        set "ENV_VAL=%%B"
        if not "!ENV_KEY:~0,1!"=="#" (
            if not "!ENV_KEY!"=="" (
                set "!ENV_KEY!=!ENV_VAL!"
            )
        )
    )
)

if "!GEMINI_API_KEY!" neq "" (
    echo    Gemini AI Key: Configured
) else (
    echo    Gemini AI Key: Not provided (Using Autonomous Heuristic Financial Engine)
)

:: Ensure database folder exists
if not exist "backend\data" mkdir "backend\data"

:: 3. Launch Backend Service (Port 8080)
echo.
echo [*] Starting Backend Service on port 8080...
start "CashFlow-Guardian Backend [Port 8080]" cmd /k "title CashFlow-Guardian Backend & echo Starting Spring Boot Service... & java -jar backend\build\libs\cashflow-guardian-backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=h2"

:: 4. Launch Frontend Service (Port 3000)
echo [*] Starting Frontend Dev Server on port 3000...
start "CashFlow-Guardian Frontend [Port 3000]" cmd /k "title CashFlow-Guardian Frontend & echo Starting Vite UI Server... & cd frontend && npm run dev -- --port 3000 --host"

:: 5. Display Information and Clickable Links
echo.
echo ==============================================================================
echo                 CASHFLOW-GUARDIAN IS RUNNING SUCCESSFULLY!
echo ==============================================================================
echo.
echo   [FRONTEND DASHBOARD]
echo   http://localhost:3000
echo.
echo   [BACKEND REST API ^& SWAGGER UI]
echo   http://localhost:8080/swagger-ui/index.html
echo.
echo   [H2 EMBEDDED DATABASE CONSOLE]
echo   http://localhost:8080/h2-console
echo   JDBC URL: jdbc:h2:file:./data/cashflowdb  ^|  User: sa  ^|  Password: (empty)
echo.
echo ==============================================================================
echo   To stop the application, simply close the Backend and Frontend command
echo   windows, or run stop.bat.
echo ==============================================================================
echo.

:: Automatically open default browser after a brief wait for server initialization
echo Opening CashFlow-Guardian in your web browser...
ping -n 4 127.0.0.1 >nul 2>&1
start http://localhost:3000

echo.
echo Press any key to close this launcher window (services will continue running).
pause >nul

