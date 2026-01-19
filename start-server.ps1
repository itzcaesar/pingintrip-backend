param(
    [switch]$Prod,
    [switch]$Migrate,
    [switch]$Seed,
    [switch]$BackendOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "Pingintrip System Launcher" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

Set-Location $ProjectRoot

# Check backend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma
if (-not (Test-Path "node_modules\.prisma\client")) {
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
}

# Migrations
if ($Migrate) {
    Write-Host "Running migrations..." -ForegroundColor Yellow
    npx prisma migrate dev
}

# Seed
if ($Seed) {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    npx prisma db seed
}

# Dashboard dependencies
if (-not $BackendOnly -and -not (Test-Path "dashboard\node_modules")) {
    Write-Host "Installing Dashboard dependencies..." -ForegroundColor Yellow
    Set-Location "$ProjectRoot\dashboard"
    npm install
    Set-Location $ProjectRoot
}

Write-Host "Starting Services..." -ForegroundColor Green

if ($Prod) {
    Write-Host "Production mode not supported in this script." -ForegroundColor Red
}
else {
    # Backend
    Write-Host "Starting Backend (Port 3000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "npm run start:dev"

    if (-not $BackendOnly) {
        # Dashboard
        Write-Host "Starting Dashboard (Port 3001)..." -ForegroundColor Magenta
        Set-Location "$ProjectRoot\dashboard"
        Start-Process powershell -ArgumentList "npm run dev"
        Set-Location $ProjectRoot
    }

    Write-Host ""
    Write-Host "Services Launched!" -ForegroundColor Green
    Write-Host "Backend: http://localhost:3000/api"
    if (-not $BackendOnly) {
        Write-Host "Dashboard: http://localhost:3001"
    }

    Read-Host "Press Enter to exit launcher..."
}
