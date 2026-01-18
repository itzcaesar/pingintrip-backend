# Pingintrip Backend - Start Server Script
# Usage: .\start-server.ps1 [-Dev] [-Prod] [-Migrate] [-Seed]

param(
    [switch]$Dev,
    [switch]$Prod,
    [switch]$Migrate,
    [switch]$Seed
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "🚀 Pingintrip Backend Server" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Navigate to project root
Set-Location $ProjectRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma client if needed
if (-not (Test-Path "node_modules\.prisma\client")) {
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
}

# Run migrations if requested
if ($Migrate) {
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev
}

# Run seed if requested
if ($Seed) {
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    npx prisma db seed
}

# Start the server
if ($Prod) {
    Write-Host "`n🏭 Starting PRODUCTION server..." -ForegroundColor Green
    npm run build
    npm run start:prod
} else {
    Write-Host "`n🔥 Starting DEVELOPMENT server..." -ForegroundColor Green
    Write-Host "   API: http://localhost:3000/api" -ForegroundColor Gray
    Write-Host "   WebSocket: ws://localhost:3000/dashboard" -ForegroundColor Gray
    Write-Host "   Frontend: Run 'cd frontend; npm run dev' in a new terminal" -ForegroundColor Cyan
    Write-Host ""
    npm run start:dev
}
