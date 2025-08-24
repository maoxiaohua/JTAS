# JTAS Quick Setup Script for Windows PowerShell
# Run this script in PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     JTAS Quick Setup for Windows" -ForegroundColor Cyan  
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

# Check and install Java
Write-Host "[1/4] Checking Java..." -ForegroundColor Green
if (Test-Command "java") {
    Write-Host "✅ Java is installed" -ForegroundColor Green
    java -version
} else {
    Write-Host "❌ Java not found. Installing..." -ForegroundColor Red
    try {
        winget install Microsoft.OpenJDK.17
        Write-Host "✅ Java installed successfully" -ForegroundColor Green
        Write-Host "⚠️  Please restart your terminal" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Failed to install Java. Please install manually from https://adoptium.net/" -ForegroundColor Red
    }
}

Write-Host ""

# Check and install Maven
Write-Host "[2/4] Checking Maven..." -ForegroundColor Green
if (Test-Command "mvn") {
    Write-Host "✅ Maven is installed" -ForegroundColor Green
    mvn -version
} else {
    Write-Host "❌ Maven not found. Installing..." -ForegroundColor Red
    try {
        winget install Apache.Maven
        Write-Host "✅ Maven installed successfully" -ForegroundColor Green
        Write-Host "⚠️  Please restart your terminal" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Failed to install Maven. Please install manually" -ForegroundColor Red
    }
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
Write-Host "2. Run: .\start-services.ps1" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"