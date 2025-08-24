# Frontend Setup and Start Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     JTAS Frontend Setup & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Make sure you're in the frontend directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "📁 node_modules directory exists" -ForegroundColor Yellow
    
    # Check if react-scripts exists
    if (Test-Path "node_modules\.bin\react-scripts.cmd") {
        Write-Host "✅ react-scripts found" -ForegroundColor Green
        $installNeeded = $false
    } else {
        Write-Host "❌ react-scripts not found in node_modules" -ForegroundColor Red
        $installNeeded = $true
    }
} else {
    Write-Host "📁 node_modules directory not found" -ForegroundColor Yellow
    $installNeeded = $true
}

# Install dependencies if needed
if ($installNeeded) {
    Write-Host ""
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    
    try {
        # Clear npm cache first
        npm cache clean --force
        Write-Host "✅ npm cache cleared" -ForegroundColor Green
        
        # Install dependencies
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ npm install failed with exit code $LASTEXITCODE" -ForegroundColor Red
            
            Write-Host ""
            Write-Host "Trying alternative installation methods..." -ForegroundColor Yellow
            
            # Try with --legacy-peer-deps
            npm install --legacy-peer-deps
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Dependencies installed with --legacy-peer-deps" -ForegroundColor Green
            } else {
                Write-Host "❌ Installation failed. Trying manual approach..." -ForegroundColor Red
                
                # Try installing react-scripts separately
                npm install react-scripts@5.0.1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ react-scripts installed separately" -ForegroundColor Green
                    npm install
                } else {
                    Write-Host "❌ All installation methods failed" -ForegroundColor Red
                    Write-Host ""
                    Write-Host "Manual troubleshooting steps:" -ForegroundColor Yellow
                    Write-Host "1. Delete node_modules: Remove-Item -Recurse -Force node_modules" -ForegroundColor White
                    Write-Host "2. Delete package-lock.json: Remove-Item package-lock.json" -ForegroundColor White
                    Write-Host "3. Clear npm cache: npm cache clean --force" -ForegroundColor White
                    Write-Host "4. Try again: npm install" -ForegroundColor White
                    Read-Host "Press Enter to exit"
                    exit 1
                }
            }
        }
        
    } catch {
        Write-Host "❌ Error during installation: $_" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Verify react-scripts installation
Write-Host ""
Write-Host "🔍 Verifying react-scripts installation..." -ForegroundColor Yellow

if (Test-Path "node_modules\.bin\react-scripts.cmd") {
    Write-Host "✅ react-scripts found at node_modules\.bin\react-scripts.cmd" -ForegroundColor Green
} elseif (Test-Path "node_modules\react-scripts\bin\react-scripts.js") {
    Write-Host "✅ react-scripts found at node_modules\react-scripts\bin\react-scripts.js" -ForegroundColor Green
} else {
    Write-Host "❌ react-scripts still not found after installation" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying to install react-scripts globally..." -ForegroundColor Yellow
    npm install -g react-scripts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ react-scripts installed globally" -ForegroundColor Green
    } else {
        Write-Host "❌ Global installation also failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start the development server
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         Starting Frontend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Starting React development server..." -ForegroundColor Green
Write-Host "📡 Frontend will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "🔄 Hot reload is enabled for development" -ForegroundColor Green
Write-Host ""
Write-Host "💡 The browser should open automatically" -ForegroundColor Yellow
Write-Host "   If not, manually navigate to http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Note: Backend API should be running at http://localhost:8080" -ForegroundColor Yellow
Write-Host "   Some features may not work without the backend" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

# Start the server
try {
    npm start
} catch {
    Write-Host "❌ Failed to start the development server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}