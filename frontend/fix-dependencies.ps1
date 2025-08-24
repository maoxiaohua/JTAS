# Fix Dependencies Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Fixing Node.js Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current Node.js version:" -ForegroundColor Yellow
node -v
Write-Host "Current npm version:" -ForegroundColor Yellow
npm -v
Write-Host ""

# Step 1: Clean everything
Write-Host "[1/5] Cleaning existing installation..." -ForegroundColor Green
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
Remove-Item ".npmrc" -ErrorAction SilentlyContinue

# Step 2: Set npm configuration for compatibility
Write-Host "[2/5] Setting npm configuration..." -ForegroundColor Green
npm config set legacy-peer-deps true
npm config set fund false
npm config set audit-level none

# Step 3: Create .npmrc file
Write-Host "[3/5] Creating .npmrc file..." -ForegroundColor Green
@"
legacy-peer-deps=true
fund=false
audit-level=none
engine-strict=false
"@ | Out-File -FilePath ".npmrc" -Encoding utf8

# Step 4: Clear npm cache
Write-Host "[4/5] Clearing npm cache..." -ForegroundColor Green
npm cache clean --force

# Step 5: Install with compatibility flags
Write-Host "[5/5] Installing dependencies with compatibility fixes..." -ForegroundColor Green
Write-Host "This may take several minutes..." -ForegroundColor Gray

try {
    # Try different installation strategies
    Write-Host "Trying method 1: --legacy-peer-deps..." -ForegroundColor Yellow
    npm install --legacy-peer-deps --no-audit --no-fund
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Method 1 succeeded!" -ForegroundColor Green
    } else {
        Write-Host "❌ Method 1 failed, trying method 2..." -ForegroundColor Red
        
        # Method 2: Force install
        Write-Host "Trying method 2: --force..." -ForegroundColor Yellow
        npm install --force --legacy-peer-deps --no-audit --no-fund
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Method 2 succeeded!" -ForegroundColor Green
        } else {
            Write-Host "❌ Method 2 failed, trying method 3..." -ForegroundColor Red
            
            # Method 3: Install specific versions
            Write-Host "Trying method 3: Installing specific compatible versions..." -ForegroundColor Yellow
            
            # Install React 18 compatible versions
            npm install react@18.2.0 react-dom@18.2.0 --legacy-peer-deps --no-audit
            npm install react-scripts@5.0.1 --legacy-peer-deps --no-audit
            npm install --legacy-peer-deps --no-audit --no-fund
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Method 3 succeeded!" -ForegroundColor Green
            } else {
                Write-Host "❌ All methods failed!" -ForegroundColor Red
                throw "Installation failed"
            }
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Installation failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps to try:" -ForegroundColor Yellow
    Write-Host "1. Install Node.js 18 LTS from nodejs.org" -ForegroundColor White
    Write-Host "2. Or try: npm install --legacy-peer-deps --force" -ForegroundColor White
    Write-Host "3. Or use yarn instead: npm install -g yarn && yarn install" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Green

if (Test-Path "node_modules\react-scripts") {
    Write-Host "✅ react-scripts installed" -ForegroundColor Green
} else {
    Write-Host "❌ react-scripts missing" -ForegroundColor Red
}

if (Test-Path "node_modules\react") {
    Write-Host "✅ react installed" -ForegroundColor Green
} else {
    Write-Host "❌ react missing" -ForegroundColor Red
}

# Try to start
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         Testing Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Attempting to start the development server..." -ForegroundColor Green
Write-Host "If successful, the server will start on http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

# Set environment variables
$env:BROWSER = "none"
$env:GENERATE_SOURCEMAP = "false"
$env:SKIP_PREFLIGHT_CHECK = "true"

try {
    npm start
} catch {
    Write-Host ""
    Write-Host "❌ Startup failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Additional troubleshooting options:" -ForegroundColor Yellow
    Write-Host "1. Try using Yarn: npm install -g yarn && yarn install && yarn start" -ForegroundColor White
    Write-Host "2. Use Node.js 18 LTS instead of Node.js 22" -ForegroundColor White
    Write-Host "3. Try running in Windows Subsystem for Linux (WSL)" -ForegroundColor White
}