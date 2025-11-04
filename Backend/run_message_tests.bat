@echo off
echo ====================================
echo Running Message System Tests
echo ====================================
echo.

cd /d "%~dp0.."

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else if exist env\Scripts\activate.bat (
    call env\Scripts\activate.bat
)

REM Run the tests with verbose output
pytest tests/test_messages.py -v -s --tb=short

echo.
echo ====================================
echo Tests Complete!
echo ====================================
pause
