@echo off
cd D:\ISEKAI\victorflix2.0
git pull origin main
python -m http.server 8000
"C:\Users\vecto\Downloads\ngrok.exe" http 8000
