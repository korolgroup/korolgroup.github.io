# Makefile for Roman Korol's Website
# Provides convenient commands for development and deployment

.PHONY: help install dev build test clean deploy lint format

# Default target
help:
	@echo "Available commands:"
	@echo "  install    - Install all dependencies"
	@echo "  dev        - Start development server with live reload"
	@echo "  build      - Build production-ready assets"
	@echo "  test       - Run all tests (HTML, CSS, JS, accessibility)"
	@echo "  lint       - Run linting on CSS and JavaScript"
	@echo "  format     - Format all code with Prettier"
	@echo "  clean      - Clean build artifacts"
	@echo "  deploy     - Build and deploy to production"
	@echo "  pdf        - Generate PDF documents from LaTeX sources"

# Install dependencies
install:
	npm install

# Development server
dev:
	npm run dev

# Production build
build:
	npm run build

# Run all tests
test:
	npm run test

# Linting
lint:
	npm run lint

# Code formatting
format:
	npm run format

# Clean build artifacts
clean:
	npm run clean

# Deploy to production
deploy:
	npm run deploy

# Generate PDFs from LaTeX (if available)
pdf:
	@if command -v pdflatex >/dev/null 2>&1; then \
		cd make_pdf && \
		pdflatex CV_Korol.tex && \
		pdflatex Publist.tex && \
		pdflatex Research.tex && \
		cp *.pdf ../pdf/; \
		echo "PDFs generated successfully"; \
	else \
		echo "pdflatex not found. Please install LaTeX to generate PDFs."; \
	fi

# Quick development setup
setup: install
	@echo "Development environment set up successfully!"
	@echo "Run 'make dev' to start the development server."

# Production deployment
production: clean build test
	@echo "Production build completed and tested successfully!"
	@echo "Ready for deployment."