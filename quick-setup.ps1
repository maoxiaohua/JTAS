# JTAS Quick Setup Script for Windows PowerShell
# JIRA Task Automation System - Python Flask + React

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     JTAS Quick Setup for Windows" -ForegroundColor Cyan  
Write-Host "  Python Flask + React Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check execution policy
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Host "Setting PowerShell execution policy..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
}

# Function to check if command exists
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Check and install Python
Write-Host "[1/4] Checking Python..." -ForegroundColor Green
if (Test-Command "python") {
    Write-Host "✅ Python is installed" -ForegroundColor Green
    python --version
} else {
    Write-Host "❌ Python not found. Installing..." -ForegroundColor Red
    try {
        winget install Python.Python.3.11
        Write-Host "✅ Python installed successfully" -ForegroundColor Green
        Write-Host "⚠️  Please restart your terminal" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Failed to install Python. Please install manually from https://python.org/" -ForegroundColor Red
    }
}

Write-Host ""

# Check pip
Write-Host "[2/4] Checking pip..." -ForegroundColor Green
if (Test-Command "pip") {
    Write-Host "✅ pip is installed" -ForegroundColor Green
    pip --version
} else {
    Write-Host "❌ pip not found" -ForegroundColor Red
}

Write-Host ""

# Check and install Node.js
Write-Host "[3/4] Checking Node.js..." -ForegroundColor Green
if (Test-Command "node") {
    Write-Host "✅ Node.js is installed" -ForegroundColor Green
    Write-Host "Node version: $(node -v)"
    Write-Host "npm version: $(npm -v)"
} else {
    Write-Host "❌ Node.js not found. Installing..." -ForegroundColor Red
    try {
        winget install OpenJS.Node.js
        Write-Host "✅ Node.js installed successfully" -ForegroundColor Green
        Write-Host "⚠️  Please restart your terminal" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Failed to install Node.js. Please install manually from https://nodejs.org/" -ForegroundColor Red
    }
}

Write-Host ""

# Check Docker (optional)
Write-Host "[4/4] Checking Docker..." -ForegroundColor Green
if (Test-Command "docker") {
    Write-Host "✅ Docker is installed" -ForegroundColor Green
    docker --version
} else {
    Write-Host "⚠️  Docker not found (optional)" -ForegroundColor Yellow
    Write-Host "   You can install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If any tools were installed, restart your terminal" -ForegroundColor White
Write-Host "2. Run: python start.py" -ForegroundColor White
Write-Host "3. Access frontend at: http://localhost:3000" -ForegroundColor White
Write-Host "4. Access backend API at: http://localhost:5000" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"