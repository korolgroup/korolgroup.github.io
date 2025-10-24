@echo off
echo Testing Jekyll installation...
echo.
echo Ruby version:
ruby --version
echo.
echo Bundler version:
bundle --version
echo.
echo Jekyll version:
jekyll --version
echo.
echo.
echo Press any key to try running Jekyll...
pause
echo.
echo Installing dependencies (this may take a minute)...
bundle install
echo.
echo Starting Jekyll server...
bundle exec jekyll serve --trace
