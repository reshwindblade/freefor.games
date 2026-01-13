#!/bin/bash

# FreeFor.Games - Linux Debian Development Setup Script
# This script sets up and starts the complete development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Banner
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    FreeFor.Games                             ║${NC}"
echo -e "${PURPLE}║              Linux Debian Development Setup                  ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "backend/package.json" ]; then
    print_error "Please run this script from the freefor.games root directory"
    exit 1
fi

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. It will use sudo when needed."
    exit 1
fi

print_header "🔍 Checking System Requirements..."

# Update package list
print_step "Updating package list..."
sudo apt update

# Install curl and wget if not present
print_step "Installing essential tools..."
sudo apt install -y curl wget gnupg2 apt-transport-https ca-certificates lsb-release

# Check for Node.js
if ! command -v node &> /dev/null; then
    print_step "Installing Node.js LTS..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt install -y nodejs
    
    print_success "Node.js installed: $(node --version)"
else
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_warning "Node.js version is too old ($(node --version)). Updating to latest LTS..."
        
        # Install NodeSource repository
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    print_success "Node.js is ready: $(node --version)"
fi

# Check for MongoDB
if ! command -v mongod &> /dev/null; then
    print_step "Installing MongoDB Community Edition..."
    
    # Import MongoDB public GPG key
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package list and install MongoDB
    sudo apt update
    sudo apt install -y mongodb-org
    
    print_success "MongoDB installed successfully"
else
    print_success "MongoDB is already installed"
fi

# Install mongosh if not available
if ! command -v mongosh &> /dev/null; then
    print_step "Installing MongoDB Shell (mongosh)..."
    
    # Download and install mongosh
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    sudo apt install -y mongodb-mongosh
    
    print_success "mongosh installed successfully"
else
    print_success "mongosh is already installed"
fi

print_header "🗄️  Setting up MongoDB..."

# Create MongoDB data directory
MONGO_DATA_DIR="/var/lib/mongodb"
if [ ! -d "$MONGO_DATA_DIR" ]; then
    print_step "Creating MongoDB data directory at $MONGO_DATA_DIR"
    sudo mkdir -p "$MONGO_DATA_DIR"
    sudo chown mongodb:mongodb "$MONGO_DATA_DIR"
fi

# Start MongoDB service
print_step "Starting MongoDB service..."
if systemctl is-active --quiet mongod; then
    print_success "MongoDB is already running"
else
    sudo systemctl start mongod
    sudo systemctl enable mongod
    print_success "MongoDB service started and enabled"
fi

# Wait for MongoDB to be ready
print_step "Waiting for MongoDB to be ready..."
for i in {1..30}; do
    if mongosh --quiet --eval "db.getSiblingDB('admin').runCommand({ ping: 1 }).ok" > /dev/null 2>&1; then
        print_success "MongoDB is ready"
        break
    fi

    if [ $i -eq 30 ]; then
        print_error "MongoDB failed to start after 30 seconds"
        exit 1
    fi

    sleep 1
done

print_header "📦 Installing Dependencies..."

# Install backend dependencies
print_step "Installing backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install
    print_success "Backend dependencies installed"
else
    print_error "Backend package.json not found"
    exit 1
fi

# Install frontend dependencies
cd ../frontend
print_step "Installing frontend dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_success "Frontend dependencies installed"
else
    print_error "Frontend package.json not found"
    exit 1
fi

cd ..

print_header "⚙️  Setting up Environment Configuration..."

# Setup backend environment
if [ ! -f "backend/.env" ]; then
    print_step "Creating backend environment file..."
    
    # Generate a secure JWT secret
    JWT_SECRET=$(openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    cat > backend/.env << EOF
# Development Environment Configuration
# Generated on $(date)

# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/freefor_games_dev

# Authentication
JWT_SECRET=${JWT_SECRET}
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
EOF
    
    print_success "Backend .env file created"
else
    print_success "Backend .env file already exists"
fi

# Setup frontend environment for development
if [ ! -f "frontend/.env.development" ]; then
    print_step "Creating frontend environment file..."
    
    cat > frontend/.env.development << EOF
# Frontend Development Configuration
REACT_APP_API_URL=http://localhost:5001/api
EOF
    
    print_success "Frontend .env.development file created"
else
    print_success "Frontend .env.development file already exists"
fi

print_header "🗃️  Setting up Database..."

# Initialize database with some sample data (optional)
print_step "Initializing development database..."

# Run database initialization using mongoose script
cd backend
if [ -f "scripts/init_db.js" ]; then
    node scripts/init_db.js
    print_success "Database initialized"
else
    print_warning "Database initialization script not found, skipping..."
fi
cd ..

print_header "🚀 Starting Development Servers..."

# Kill any existing processes on the ports we need
print_step "Checking for existing processes on ports 3000 and 5001..."

# Kill process on port 5001 (backend)
if ss -tuln | grep :5001 > /dev/null 2>&1; then
    print_warning "Killing existing process on port 5001..."
    sudo fuser -k 5001/tcp 2>/dev/null || true
fi

# Kill process on port 3000 (frontend)
if ss -tuln | grep :3000 > /dev/null 2>&1; then
    print_warning "Killing existing process on port 3000..."
    sudo fuser -k 3000/tcp 2>/dev/null || true
fi

# Create a process management script
cat > start_servers.sh << 'EOF'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting FreeFor.Games Development Servers...${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${GREEN}📡 Starting Backend Server (Port 5001)...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo -e "${GREEN}🌐 Starting Frontend Server (Port 3000)...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for user to stop servers
echo -e "${BLUE}✅ Both servers are starting up...${NC}"
echo -e "${YELLOW}📱 Frontend will open at: http://localhost:3000${NC}"
echo -e "${YELLOW}🔗 Backend API at: http://localhost:5001${NC}"
echo -e "${YELLOW}🗄️  MongoDB running on: mongodb://localhost:27017${NC}"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for all background jobs
wait
EOF

chmod +x start_servers.sh

print_success "Server startup script created"

print_header "🎉 Setup Complete!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "🎮 FreeFor.Games development environment is ready!"
echo ""
echo -e "${CYAN}📋 What's been set up:${NC}"
echo "   ✅ Node.js and npm"
echo "   ✅ MongoDB Community Edition"
echo "   ✅ Backend dependencies installed"
echo "   ✅ Frontend dependencies installed"
echo "   ✅ Environment configuration files"
echo "   ✅ Development database initialized"
echo ""
echo -e "${CYAN}🌐 Services:${NC}"
echo "   📡 Backend API: http://localhost:5001"
echo "   🌐 Frontend App: http://localhost:3000"
echo "   🗄️  Database: mongodb://localhost:27017/freefor_games_dev"
echo ""
echo -e "${CYAN}🚀 Starting servers now...${NC}"
echo ""

# Start the development servers
./start_servers.sh

# Cleanup
rm start_servers.sh