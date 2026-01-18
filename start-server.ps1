# Pingintrip System Launcher
# Usage: .\start-server.ps1 [-Prod] [-Migrate] [-Seed] [-BackendOnly]

param(
    [switch]$Prod,
    [switch]$Migrate,
    [switch]$Seed,
    [switch]$BackendOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "🚀 Pingintrip System Launcher" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Navigate to project root
Set-Location $ProjectRoot

# Check backend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing Backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma client
if (-not (Test-Path "node_modules\.prisma\client")) {
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
}

# Run migrations
if ($Migrate) {
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev
}

# Run seed
if ($Seed) {
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    npx prisma db seed
}

# Check frontend dependencies
if (-not $BackendOnly -and -not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing Frontend dependencies..." -ForegroundColor Yellow
    Set-Location "$ProjectRoot\frontend"
    npm install
    Set-Location $ProjectRoot
}

Write-Host "`n🚦 Starting Services..." -ForegroundColor Green

if ($Prod) {
    # Production Mode
    Write-Host "🏭 Production build not fully configured for easy local launch." -ForegroundColor Red
    Write-Host "Please build components manually."
} else {
    # Development Mode
    
    # Start Backend
    Write-Host "🔌 Starting Backend (Port 3000)..." -ForegroundColor Cyan
    $BackendProcess = Start-Process powershell -ArgumentList "npm run start:dev" -PassThru
    
    if (-not $BackendOnly) {
        # Start Frontend
        Write-Host "🎨 Starting Frontend (Port 3001)..." -ForegroundColor Magenta
        Set-Location "$ProjectRoot\frontend"
        $FrontendProcess = Start-Process powershell -ArgumentList "npm run dev" -PassThru
        Set-Location $ProjectRoot
    }

    Write-Host "`n✅ Systems Launched!" -ForegroundColor Green
    Write-Host "   Backend API: http://localhost:3000/api"
    if (-not $BackendOnly) {
        Write-Host "   Dashboard:   http://localhost:3001"
    }
    Write-Host "`nPress any key to exit launcher (Services will keep running)..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
