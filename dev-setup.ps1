# FreeFor.Games - Windows PowerShell Development Setup Script
# This script sets up and starts the complete development environment on Windows

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($msg)    { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Err($msg)     { Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Header($msg)  { Write-Host $msg -ForegroundColor Magenta }
function Write-Step($msg)    { Write-Host "[STEP] $msg" -ForegroundColor DarkCyan }

Write-Host ""
Write-Header "╔══════════════════════════════════════════════════════════════╗"
Write-Header "║                    FreeFor.Games                             ║"
Write-Header "║                Windows Development Setup                     ║"
Write-Header "╚══════════════════════════════════════════════════════════════╝"
Write-Host ""

# Ensure we run from the repository root (directory of this script)
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptRoot

if (!(Test-Path -Path (Join-Path $ScriptRoot 'backend\package.json'))) {
    Write-Err "Please run this script from the freefor.games root directory"
    exit 1
}

Write-Header "🔍 Checking System Requirements..."

function Command-Exists([string]$cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Ensure-WingetOrChoco() {
    if (Command-Exists 'winget') { return 'winget' }
    if (Command-Exists 'choco')  { return 'choco' }
    Write-Err "Neither winget nor choco was found. Please install 'App Installer' from the Microsoft Store (provides winget) or Chocolatey, then re-run."
    exit 1
}

function Install-Node() {
    $mgr = Ensure-WingetOrChoco
    Write-Step "Installing Node.js (LTS) via $mgr..."
    if ($mgr -eq 'winget') {
        winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements | Out-Null
    } else {
        choco install nodejs-lts -y --no-progress | Out-Null
    }
    Write-Success ("Node.js installed: " + (node --version))
}

function Install-MongoDB() {
    $mgr = Ensure-WingetOrChoco
    Write-Step "Installing MongoDB Community Server via $mgr..."
    if ($mgr -eq 'winget') {
        # MongoDB Community Server package
        winget install --id MongoDB.DatabaseServer --silent --accept-package-agreements --accept-source-agreements | Out-Null
    } else {
        choco install mongodb --params '"/InstallForAllUsers /ServiceName:MongoDB"' -y --no-progress | Out-Null
    }
    Write-Success "MongoDB installed successfully"
}

# Check Node.js
if (!(Command-Exists 'node')) {
    Install-Node
} else {
    $nodeVersion = (node --version) -replace '^v',''
    $major = [int]($nodeVersion.Split('.')[0])
    if ($major -lt 16) {
        Write-Warn "Node.js version is too old ($(node --version)). Updating to latest LTS..."
        Install-Node
    }
    Write-Success ("Node.js is ready: " + (node --version))
}

# Check MongoDB (service or mongod presence)
$mongoService = Get-Service -Name 'MongoDB' -ErrorAction SilentlyContinue
if (-not $mongoService -and -not (Command-Exists 'mongod')) {
    Install-MongoDB
}
else {
    Write-Success "MongoDB is already installed"
}

Write-Header "🗄️  Setting up MongoDB..."

# Start MongoDB service if present
try {
    $mongoService = Get-Service -Name 'MongoDB' -ErrorAction SilentlyContinue
    if ($mongoService) {
        if ($mongoService.Status -ne 'Running') {
            Write-Step "Starting MongoDB Windows service..."
            Start-Service -Name 'MongoDB'
            $mongoService.WaitForStatus('Running','00:00:20') | Out-Null
        }
        Write-Success "MongoDB service is running"
    } else {
        Write-Warn "MongoDB service not found. Assuming mongod is available on PATH."
    }
}
catch {
    Write-Warn "Could not start MongoDB service: $($_.Exception.Message)"
}

# Wait for MongoDB to be ready (port 27017)
Write-Step "Waiting for MongoDB to be ready on localhost:27017..."
$ready = $false
for ($i=1; $i -le 30; $i++) {
    try {
        $ok = Test-NetConnection -ComputerName 'localhost' -Port 27017 -InformationLevel Quiet
        if ($ok) { $ready = $true; break }
    } catch {}
    Start-Sleep -Seconds 1
}
if (-not $ready) {
    Write-Err "MongoDB failed to start after 30 seconds"
    exit 1
}
Write-Success "MongoDB is ready"

Write-Header "📦 Installing Dependencies..."

# Install backend dependencies
Write-Step "Installing backend dependencies..."
Push-Location (Join-Path $ScriptRoot 'backend')
if (Test-Path 'package.json') {
    npm install
    Write-Success "Backend dependencies installed"
} else {
    Write-Err "Backend package.json not found"
    exit 1
}
Pop-Location

# Install frontend dependencies
Write-Step "Installing frontend dependencies..."
Push-Location (Join-Path $ScriptRoot 'frontend')
if (Test-Path 'package.json') {
    npm install
    Write-Success "Frontend dependencies installed"
} else {
    Write-Err "Frontend package.json not found"
    exit 1
}
Pop-Location

Write-Header "⚙️  Setting up Environment Configuration..."

# Backend .env
$backendEnvPath = Join-Path $ScriptRoot 'backend\.env'
if (-not (Test-Path $backendEnvPath)) {
    Write-Step "Creating backend environment file..."
    $jwtSecret = & node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" | Select-Object -First 1
    $backendEnv = @"
# Development Environment Configuration
# Generated on $(Get-Date)

# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/freefor_games_dev

# Authentication
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional: Google Calendar Integration (for testing)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Optional: Cloudinary for Image Uploads (for testing)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
"@
    $backendEnv | Out-File -FilePath $backendEnvPath -Encoding utf8 -Force
    Write-Success "Backend .env file created"
} else {
    Write-Success "Backend .env file already exists"
}

# Frontend .env.development
$frontendEnvPath = Join-Path $ScriptRoot 'frontend\.env.development'
if (-not (Test-Path $frontendEnvPath)) {
    Write-Step "Creating frontend environment file..."
    $frontendEnv = @"
# Frontend Development Configuration
REACT_APP_API_URL=http://localhost:5000/api
"@
    $frontendEnv | Out-File -FilePath $frontendEnvPath -Encoding utf8 -Force
    Write-Success "Frontend .env.development file created"
} else {
    Write-Success "Frontend .env.development file already exists"
}

Write-Header "🗃️  Setting up Database..."
Write-Step "Initializing development database..."

Push-Location (Join-Path $ScriptRoot 'backend')
node .\scripts\init_db.js
Pop-Location
Write-Success "Database initialized"

Write-Header "🚀 Starting Development Servers..."

function Stop-ProcessOnPort([int]$port) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            $pids = $conns.OwningProcess | Select-Object -Unique
            foreach ($pid in $pids) {
                try {
                    Write-Warn "Killing existing process on port $port (PID $pid)..."
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                } catch {}
            }
        }
    } catch {}
}

Write-Step "Checking for existing processes on ports 3000 and 5000..."
Stop-ProcessOnPort -port 5000
Stop-ProcessOnPort -port 3000

# Create a process management script and run it
$startScript = Join-Path $ScriptRoot 'start_servers.ps1'
@"
Set-StrictMode -Version Latest

function Cleanup {
  Write-Host "`n🛑 Shutting down servers..." -ForegroundColor Yellow
  Get-Job | Stop-Job -Force -ErrorAction SilentlyContinue | Out-Null
}

Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

Write-Host "📡 Starting Backend Server (Port 5000)..." -ForegroundColor Green
$backendJob = Start-Job -Name 'backend' -ScriptBlock { Set-Location "$PSScriptRoot\backend"; npm run dev }
Start-Sleep -Seconds 3

Write-Host "🌐 Starting Frontend Server (Port 3000)..." -ForegroundColor Green
$frontendJob = Start-Job -Name 'frontend' -ScriptBlock { Set-Location "$PSScriptRoot\frontend"; npm start }

Write-Host "✅ Both servers are starting up..." -ForegroundColor Cyan
Write-Host "📱 Frontend will open at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🔗 Backend API at: http://localhost:5000" -ForegroundColor Yellow
Write-Host "🗄️  MongoDB running on: mongodb://localhost:27017" -ForegroundColor Yellow
Write-Host ""; Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Green; Write-Host ""

Start-Process "http://localhost:3000" | Out-Null

Wait-Job -Job $backendJob, $frontendJob | Out-Null
Receive-Job -Job $backendJob -Keep -ErrorAction SilentlyContinue | Out-Host
Receive-Job -Job $frontendJob -Keep -ErrorAction SilentlyContinue | Out-Host
"@ | Out-File -FilePath $startScript -Encoding utf8 -Force

Write-Success "Server startup script created"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Success "🎮 FreeFor.Games development environment is ready!"
Write-Host ""
Write-Host "📋 What's been set up:" -ForegroundColor Cyan
Write-Host "   ✅ Node.js and npm"
Write-Host "   ✅ MongoDB Community Server"
Write-Host "   ✅ Backend dependencies installed"
Write-Host "   ✅ Frontend dependencies installed"
Write-Host "   ✅ Environment configuration files"
Write-Host "   ✅ Development database initialized"
Write-Host ""
Write-Host "🌐 Services:" -ForegroundColor Cyan
Write-Host "   📡 Backend API: http://localhost:5000"
Write-Host "   🌐 Frontend App: http://localhost:3000"
Write-Host "   🗄️  Database: mongodb://localhost:27017/freefor_games_dev"
Write-Host ""
Write-Host "🚀 Starting servers now..." -ForegroundColor Cyan
Write-Host ""

powershell -NoProfile -ExecutionPolicy Bypass -File $startScript

# Cleanup start script after it exits
Remove-Item $startScript -Force -ErrorAction SilentlyContinue


