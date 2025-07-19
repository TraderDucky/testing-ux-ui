@echo off
REM Run Flask backend with the correct virtual environment
set PYTHON_PATH=%~dp0venv\Scripts\python.exe
set APP_PATH=%~dp0app.py
"%PYTHON_PATH%" "%APP_PATH%"
pause 