@echo off
rem ============================================================
rem  SAST 博客一键启动脚本（Windows）
rem  用法：
rem    start.bat        开发模式：后端(dotnet) + 前端(vite dev)
rem    start.bat prod   生产模式：先 npm run build，再 dotnet + node serve.js
rem ============================================================
setlocal

rem ---------- 可用环境变量覆盖端口 ----------
if "%BACKEND_PORT%"=="" set BACKEND_PORT=5253
if "%FRONTEND_PORT%"=="" set FRONTEND_PORT=8080

rem ---------- 生产模式：先构建前端 ----------
if /i "%1"=="prod" (
    echo [1/3] 构建前端...
    call npm run build || (echo 前端构建失败，请先 npm install & pause & exit /b 1)
)

rem ---------- 启动后端 ----------
echo 启动后端 http://localhost:%BACKEND_PORT% ...
start "SAST-后端(dotnet)" cmd /k "chcp 65001 >nul & set ASPNETCORE_ENVIRONMENT=Development&& dotnet run --urls http://localhost:%BACKEND_PORT%"

rem ---------- 启动前端 ----------
if /i "%1"=="prod" (
    echo 启动生产前端 http://localhost:%FRONTEND_PORT% ...
    start "SAST-前端(serve)" cmd /k "chcp 65001 >nul & set PORT=%FRONTEND_PORT%&& set BACKEND_URL=http://localhost:%BACKEND_PORT%&& node serve.js"
) else (
    echo 启动开发前端 http://localhost:%FRONTEND_PORT% ...
    start "SAST-前端(vite)" cmd /k "chcp 65001 >nul & set BACKEND_URL=http://localhost:%BACKEND_PORT%&& npm run dev -- --port %FRONTEND_PORT% --strictPort"
)

rem ---------- 等服务就绪后打开浏览器 ----------
timeout /t 6 /nobreak >nul
start "" http://localhost:%FRONTEND_PORT%

echo.
echo  已在新窗口启动：
echo    后端  http://localhost:%BACKEND_PORT%   (Swagger: /swagger)
echo    前端  http://localhost:%FRONTEND_PORT%
echo  关闭对应窗口即可停止服务。
endlocal
