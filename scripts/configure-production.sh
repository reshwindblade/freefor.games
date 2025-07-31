#!/bin/bash

# Production Environment Configuration Helper
# This script helps you configure environment variables for production

set -e

echo "🔧 FreeFor.Games Production Configuration Helper"
echo "=================================================="

# Function to generate secure random string
generate_secret() {
    openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(64))" 2>/dev/null || echo "PLEASE_CHANGE_THIS_TO_A_SECURE_RANDOM_STRING"
}

# Check if we're in the right directory
if [ ! -f "backend/.env.example" ]; then
    echo "❌ Error: Please run this script from the freefor.games root directory"
    exit 1
fi

# Backup existing .env if it exists
if [ -f "backend/.env" ]; then
    echo "📋 Backing up existing .env file..."
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(generate_secret)

echo "📝 Please provide the following information:"
echo ""

# Get domain/IP
read -p "🌐 Enter your domain name or server IP (e.g., yourdomain.com or 123.456.789.0): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
fi

# Get MongoDB settings
echo ""
echo "📊 MongoDB Configuration:"
read -p "   MongoDB URI (press Enter for local): " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    MONGODB_URI="mongodb://localhost:27017/freefor_games_prod"
fi

# Optional Google Calendar
echo ""
echo "📅 Google Calendar Integration (optional - press Enter to skip):"
read -p "   Google Client ID: " GOOGLE_CLIENT_ID
read -p "   Google Client Secret: " GOOGLE_CLIENT_SECRET

# Optional Cloudinary
echo ""
echo "☁️  Cloudinary Configuration (optional - press Enter to skip):"
read -p "   Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
read -p "   Cloudinary API Key: " CLOUDINARY_API_KEY
read -p "   Cloudinary API Secret: " CLOUDINARY_API_SECRET

echo ""
echo "🔧 Creating production environment file..."

# Create backend .env
cat > backend/.env << EOF
# Production Environment Configuration
# Generated on $(date)

# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=${MONGODB_URI}

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://${DOMAIN}

# Google Calendar Integration (optional)
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Cloudinary for Image Uploads (optional)
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
EOF

# Create frontend production env
cat > frontend/.env.production << EOF
# Frontend Production Configuration
REACT_APP_API_URL=https://${DOMAIN}/api
EOF

echo ""
echo "✅ Configuration files created successfully!"
echo ""
echo "📁 Files created/updated:"
echo "   - backend/.env"
echo "   - frontend/.env.production"
if [ -f "backend/.env.backup."* ]; then
    echo "   - backend/.env.backup.* (backup of previous config)"
fi

echo ""
echo "🔒 Security Notes:"
echo "   - JWT secret has been generated automatically"
echo "   - Keep your .env files secure and never commit them to git"
echo "   - Consider using environment variables on your hosting platform"

echo ""
echo "🚀 Next Steps:"
if [ "$DOMAIN" != "localhost" ]; then
    echo "   1. Update your DNS to point ${DOMAIN} to your server IP"
    echo "   2. Setup SSL certificate with: sudo certbot --nginx -d ${DOMAIN}"
fi
echo "   3. Restart your application: pm2 restart all"
echo "   4. Reload Nginx: sudo systemctl reload nginx"
echo "   5. Test your application at: https://${DOMAIN}"

echo ""
echo "🎮 Happy gaming!"
