@echo off
echo ========================================
echo   TienGame - Mua Ban Tai Khoan Game
echo ========================================
echo.

echo [0/2] Giai phong port 5000 (neu dang bi chiem)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 1 /nobreak > nul

echo [1/2] Khoi dong Backend (port 5000)...
start "TienGame Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Khoi dong Frontend (port 5173)...
start "TienGame Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ Da khoi dong thanh cong!
echo.
echo    Frontend:   http://localhost:5173
echo    Backend:    http://localhost:5000/api
echo    Admin:      http://localhost:5173/admin
echo.
echo    Admin:    admin@tiengame.vn / admin123
echo    Staff:    nhanvien@tiengame.vn / staff123
echo    User:     user@tiengame.vn / user123
echo.
pause
