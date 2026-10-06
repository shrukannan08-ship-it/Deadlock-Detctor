@echo off
setlocal

echo =======================================================
echo Building NEXUS OS Deadlock Detection and Prevention (C)
echo =======================================================

set GCC_PATH=gcc
where gcc >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\msys64\ucrt64\bin\gcc.exe" (
        set "PATH=C:\msys64\ucrt64\bin;%PATH%"
    ) else if exist "C:\msys64\mingw64\bin\gcc.exe" (
        set "PATH=C:\msys64\mingw64\bin;%PATH%"
    ) else (
        echo Error: GCC compiler not found in PATH or standard MSYS2 directories.
        echo Please ensure gcc is installed and in your PATH.
        exit /b 1
    )
)

echo Using compiler: gcc

%GCC_PATH% -Wall -Wextra -std=c11 -O2 -I. main.c simulator.c deadlock.c prevention.c display.c graph.c trace.c -o simulator.exe
if %errorlevel% neq 0 (
    echo.
    echo Build failed!
    exit /b %errorlevel%
)

echo.
echo Build successful: simulator.exe created!
echo.
echo Running self-test suite...
simulator.exe --test-all

endlocal
