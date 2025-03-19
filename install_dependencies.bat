@echo off
echo =====================================
echo 🚀 Đang cài đặt toàn bộ thư viện...
echo =====================================

:: Chuyển vào thư mục server
cd /d %~dp0

:: Cài đặt các thư viện cần thiết
npm install express cors dotenv morgan mongoose pg sequelize jsonwebtoken bcryptjs multer socket.io redis

:: Kiểm tra lỗi
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Đã xảy ra lỗi khi cài đặt các thư viện!
    pause
    exit /b %ERRORLEVEL%
)

echo ✅ Cài đặt hoàn tất!
pause
