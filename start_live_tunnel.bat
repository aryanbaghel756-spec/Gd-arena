@echo off
title GD Arena - Live Cloudflare Tunnel
echo ========================================================
echo   GD ARENA - LIVE PUBLIC INTERNET TUNNEL
echo   Exposing http://localhost:8000 to the Web
echo ========================================================
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8000
pause
