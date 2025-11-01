# Makefile for Korol Group Website
# Provides convenient commands for development and deployment

.PHONY: help build dev serve pdf latex jekyll clean validate test setup install

# Default target - show available commands
help:
	@echo "Korol Group Website - Build Commands"
	@echo "====================================="
	@echo ""
	@echo "Development:"
	@echo "  make dev       - Start Jekyll development server"
	@echo "  make serve     - Same as 'make dev'"
	@echo ""
	@echo "Building:"
	@echo "  make build     - Full build (validate + LaTeX + Jekyll)"
	@echo "  make jekyll    - Build Jekyll site only"
	@echo "  make latex     - Generate LaTeX from YAML data"
	@echo "  make pdf       - Compile LaTeX PDFs (requires pdflatex)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make validate  - Validate YAML data files"
	@echo "  make clean     - Clean Jekyll build artifacts"
	@echo "  make test      - Run full build and validate"
	@echo ""
	@echo "For detailed documentation, see:"
	@echo "  - CLAUDE.md - Complete development guide"
	@echo "  - BUILD_PROCESS.md - Build process details"

# Full build - validate data, generate LaTeX, compile PDFs, build Jekyll site
build:
	@echo "Running full build..."
	python scripts/build_all.py

# Build without PDF compilation (faster for development)
build-fast:
	@echo "Running fast build (skipping PDFs)..."
	python scripts/build_all.py --skip-pdf

# Start Jekyll development server
dev:
	@echo "Starting Jekyll development server..."
	@echo "Visit http://127.0.0.1:4000 in your browser"
	@echo "Press Ctrl+C to stop"
	bundle exec jekyll serve

# Alias for dev
serve: dev

# Build Jekyll site only (no LaTeX/PDF generation)
jekyll:
	@echo "Building Jekyll site..."
	bundle exec jekyll build

# Generate LaTeX files from YAML data (does not compile PDFs)
latex:
	@echo "Generating LaTeX files from YAML data..."
	python scripts/generate_latex.py

# Compile PDFs from LaTeX sources (requires pdflatex)
pdf: latex
	@echo "Compiling PDFs from LaTeX..."
	@if command -v pdflatex >/dev/null 2>&1; then \
		cd pdf && \
		pdflatex -interaction=nonstopmode CV_Korol.tex && \
		pdflatex -interaction=nonstopmode Publist.tex && \
		echo "" && \
		echo "PDFs compiled successfully!" && \
		echo "  - CV_Korol.pdf" && \
		echo "  - Publist.pdf"; \
	else \
		echo "ERROR: pdflatex not found."; \
		echo "Install LaTeX to compile PDFs:"; \
		echo "  - Windows: MiKTeX (https://miktex.org/)"; \
		echo "  - Mac: MacTeX (https://www.tug.org/mactex/)"; \
		echo "  - Linux: sudo apt-get install texlive-full"; \
		exit 1; \
	fi

# Validate YAML data files
validate:
	@echo "Validating YAML data files..."
	python scripts/build_all.py --skip-pdf --skip-jekyll

# Clean Jekyll build artifacts
clean:
	@echo "Cleaning build artifacts..."
	bundle exec jekyll clean
	@echo "Build artifacts cleaned."

# Run tests - full build with validation
test:
	@echo "Running full test build..."
	python scripts/build_all.py
	@echo ""
	@echo "All tests passed!"

# Quick setup for first-time users
setup:
	@echo "Setting up development environment..."
	@echo ""
	@echo "Installing Ruby dependencies (Jekyll)..."
	bundle install
	@echo ""
	@echo "Installing Python dependencies..."
	pip install pyyaml
	@echo ""
	@echo "Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run 'make dev' to start development server"
	@echo "  2. Run 'make build' to do a full build"
	@echo "  3. See 'make help' for all available commands"

# Install dependencies only
install:
	@echo "Installing dependencies..."
	bundle install
	pip install pyyaml
	@echo "Dependencies installed."
