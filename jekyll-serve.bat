@echo off
echo Installing Jekyll dependencies...
bundle install
echo.
echo Starting Jekyll server...
echo Visit http://localhost:4000 in your browser
echo Press Ctrl+C to stop the server
echo.
bundle exec jekyll serve
