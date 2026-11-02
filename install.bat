@echo off
setlocal enabledelayedexpansion

title CashFlow-Guardian Installer
color 0F

echo ==============================================================================
echo                      CASHFLOW-GUARDIAN INSTALLER
echo        AI-Powered Enterprise Cash Flow ^& Autonomous Liquidity Engine
echo ==============================================================================
echo.

set "FORCE_REINSTALL=0"
if "%1"=="--force" set "FORCE_REINSTALL=1"
if "%1"=="-f" set "FORCE_REINSTALL=1"
if "%1"=="--clean" set "FORCE_REINSTALL=1"

:: 1. Check Java JDK 21+
echo [*] Checking Java Development Kit...
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Java JDK 21+ is not found in your system PATH.
    echo Please install Eclipse Temurin JDK 21 from:
    echo   https://adoptium.net/temurin/releases/?version=21
    echo.
    echo After installation, reopen this installer.
    echo.
    pause
    exit /b 1
)

for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set "JAVA_VER=%%g"
)
echo    Found Java: %JAVA_VER%

:: 2. Check Node.js and NPM
echo [*] Checking Node.js runtime...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Node.js 18+ [LTS] is not found in your system PATH.
    echo Please install Node.js from:
    echo   https://nodejs.org
    echo.
    echo After installation, reopen this installer.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%g in ('node -v') do set "NODE_VER=%%g"
echo    Found Node.js: %NODE_VER%

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] npm is not found in your system PATH!
    echo Please ensure npm is installed with Node.js.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%g in ('npm -v') do set "NPM_VER=%%g"
echo    Found npm: v%NPM_VER%
echo.

:: 3. Setup Project Environment
echo [*] Setting up environment configuration...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo    Created .env from .env.example
    ) else (
        echo # CashFlow-Guardian Environment > .env
        echo GEMINI_API_KEY= >> .env
        echo GEMINI_MODEL=gemini-1.5-flash >> .env
        echo    Created default .env
    )
) else (
    echo    Existing .env detected. Keeping current configuration.
)

:: Create data directory for H2 persistent database
if not exist "backend\data" (
    mkdir "backend\data"
    echo    Created database storage folder: backend\data
)
echo.

:: 4. Check & Build Backend Spring Boot Service
echo ==============================================================================
echo [*] Checking Backend Service [Java 21 / Spring Boot 3.3.5 / Gradle]...
echo ==============================================================================
set "JAR_PATH=backend\build\libs\cashflow-guardian-backend-1.0.0-SNAPSHOT.jar"
if exist "%JAR_PATH%" (
    if "%FORCE_REINSTALL%"=="0" (
        echo    [OK] Backend executable JAR already exists.
        echo         %JAR_PATH%
        echo         Skipping backend build [use install.bat --force to rebuild].
        goto check_frontend
    ) else (
        echo    [!] Force flag detected. Rebuilding backend...
    )
)

cd backend
if not exist "gradlew.bat" (
    echo [ERROR] gradlew.bat not found in backend directory!
    cd ..
    pause
    exit /b 1
)

echo    Downloading dependencies and assembling application jar...
call gradlew.bat bootJar -x test
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend build failed!
    echo Please ensure Java 21 JDK is set as JAVA_HOME and try again.
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Backend build completed successfully.

:check_frontend
echo.

:: 5. Check & Install Frontend Dependencies & Bundle
echo ==============================================================================
echo [*] Checking Frontend Dependencies [React 19 / Vite / Tailwind CSS]...
echo ==============================================================================
set "NODE_MODULES=frontend\node_modules"
set "DIST_FOLDER=frontend\dist"

if exist "%NODE_MODULES%" (
    if "%FORCE_REINSTALL%"=="0" (
        echo    [OK] Frontend dependencies already installed.
        echo         frontend\node_modules exists.
        echo         Skipping npm install [use install.bat --force to reinstall].
        goto check_dist
    ) else (
        echo    [!] Force flag detected. Reinstalling frontend packages...
    )
)

cd frontend
if not exist "package.json" (
    echo [ERROR] package.json not found in frontend directory!
    cd ..
    pause
    exit /b 1
)

echo    Running npm install...
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend npm install failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Frontend dependencies installed successfully.

:check_dist
if exist "%DIST_FOLDER%" (
    if "%FORCE_REINSTALL%"=="0" (
        echo    [OK] Frontend production bundle already built.
        echo         frontend\dist exists.
        echo         Skipping npm run build.
        goto install_finish
    )
)

cd frontend
echo    Building frontend bundle...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend build verification failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Frontend setup completed successfully.

:install_finish
echo.

:: 6. Installation Complete
echo ==============================================================================
echo           CASHFLOW-GUARDIAN INSTALLATION VERIFIED ^& READY!
echo ==============================================================================
echo.
echo All backend and frontend dependencies are verified and ready.
echo Zero unnecessary rebuilds performed.
echo.
echo TO START THE APPLICATION:
echo   Double-click or run: run.bat
echo.
echo OPTIONAL:
echo   If you have a Google Gemini API key, add it to your .env file:
echo   GEMINI_API_KEY=your_key_here
echo.
pause
