#!/bin/bash

# FreeFor.Games - Quick Deployment Script for Ubuntu Server
# Run this script as a user with sudo privileges

set -e  # Exit on any error

echo "🚀 Starting FreeFor.Games deployment on Ubuntu..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if sudo is available
if ! command -v sudo &> /dev/null; then
    print_error "sudo is required but not installed. Please install sudo first."
    exit 1
fi

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing essential packages..."
sudo apt install -y curl wget git build-essential software-properties-common

print_status "Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

print_status "Installing MongoDB..."
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt update
    sudo apt install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    print_success "MongoDB installed and started"
else
    print_success "MongoDB already installed"
fi

print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx installed and started"
else
    print_success "Nginx already installed"
fi

print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

print_status "Setting up application directory..."
if [ ! -d "/var/www/freefor.games" ]; then
    cd /var/www
    sudo git clone https://github.com/reshwindblade/freefor.games.git
    sudo chown -R $USER:$USER freefor.games
    print_success "Application cloned to /var/www/freefor.games"
else
    print_warning "Application directory already exists"
fi

cd /var/www/freefor.games

print_status "Installing backend dependencies..."
cd backend
npm install --production

print_status "Setting up backend environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_warning "Please edit backend/.env with your production settings!"
    print_warning "Especially set a secure JWT_SECRET and correct FRONTEND_URL"
else
    print_warning "Backend .env already exists, please verify settings"
fi

print_status "Installing frontend dependencies and building..."
cd ../frontend
npm install

# Create production environment file
if [ ! -f ".env.production" ]; then
    echo "REACT_APP_API_URL=http://localhost/api" > .env.production
    print_warning "Created frontend/.env.production - update REACT_APP_API_URL with your domain"
fi

npm run build
print_success "Frontend built successfully"

print_status "Setting up PM2 configuration..."
cd /var/www/freefor.games

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'freefor-games-api',
    script: './backend/server.js',
    cwd: '/var/www/freefor.games',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/freefor-games-api-error.log',
    out_file: '/var/log/pm2/freefor-games-api-out.log',
    log_file: '/var/log/pm2/freefor-games-api.log',
    time: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

print_status "Creating PM2 log directory..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

print_status "Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/freefor.games > /dev/null << 'EOF'
server {
    listen 80;
    server_name localhost;

    # Frontend - Serve React build files
    location / {
        root /var/www/freefor.games/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API - Proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/freefor.games /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
    sudo systemctl reload nginx
else
    print_error "Nginx configuration test failed"
    exit 1
fi

print_status "Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying FreeFor.Games..."

# Navigate to project directory
cd /var/www/freefor.games

# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm install --production

# Build frontend
cd ../frontend
npm install
npm run build

# Restart backend
pm2 restart freefor-games-api

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Deployment complete!"
EOF

chmod +x deploy.sh

print_status "Starting the application..."
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
PM2_STARTUP_CMD=$(pm2 startup | tail -n 1)
if [[ $PM2_STARTUP_CMD == sudo* ]]; then
    print_status "Setting up PM2 startup script..."
    eval $PM2_STARTUP_CMD
fi

print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

print_success "🎉 FreeFor.Games deployment completed!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_warning "IMPORTANT: Next steps to complete setup:"
echo ""
echo "1. 📝 Edit backend environment file:"
echo "   sudo nano /var/www/freefor.games/backend/.env"
echo "   - Set a secure JWT_SECRET"
echo "   - Update FRONTEND_URL if using a domain"
echo ""
echo "2. 🌐 If using a domain name:"
echo "   - Update server_name in: /etc/nginx/sites-available/freefor.games"
echo "   - Update REACT_APP_API_URL in: /var/www/freefor.games/frontend/.env.production"
echo "   - Rebuild frontend: cd /var/www/freefor.games/frontend && npm run build"
echo ""
echo "3. 🔒 Setup SSL certificate (recommended):"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "4. 🔄 Restart services after configuration changes:"
echo "   pm2 restart freefor-games-api"
echo "   sudo systemctl reload nginx"
echo ""
echo "5. 🧪 Test your application:"
echo "   Open http://your-server-ip in a browser"
echo ""
echo "📊 Management commands:"
echo "   pm2 status              - Check application status"
echo "   pm2 logs                - View application logs"
echo "   pm2 restart all         - Restart application"
echo "   ./deploy.sh             - Deploy updates"
echo ""
echo "📖 For detailed instructions, see: UBUNTU_DEPLOYMENT.md"
echo ""
print_success "Happy gaming! 🎮"
