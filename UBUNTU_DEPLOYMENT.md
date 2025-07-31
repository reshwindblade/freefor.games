# FreeFor.Games - Ubuntu Server Deployment Guide

This guide will help you deploy the freefor.games application on an Ubuntu server using Nginx as a reverse proxy, PM2 for process management, and MongoDB.

## 🖥️ **Server Requirements**

- Ubuntu 20.04 LTS or newer
- At least 2GB RAM
- 20GB disk space
- Root or sudo access
- Domain name (optional but recommended)

## 🚀 **Step-by-Step Deployment**

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential software-properties-common
```

### 2. Install Node.js

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### 3. Install MongoDB

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list and install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 4. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### 5. Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown (run the command it displays)
```

### 6. Clone and Setup Application

```bash
# Navigate to web directory
cd /var/www

# Clone the repository
sudo git clone https://github.com/reshwindblade/freefor.games.git
sudo chown -R $USER:$USER freefor.games
cd freefor.games
```

### 7. Setup Backend

```bash
# Navigate to backend directory
cd /var/www/freefor.games/backend

# Install dependencies
npm install --production

# Create production environment file
sudo cp .env.example .env
```

Edit the production environment file:
```bash
sudo nano .env
```

Add these production settings:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/freefor_games_prod
JWT_SECRET=your_super_secure_jwt_secret_make_it_very_long_and_random_for_production
JWT_EXPIRES_IN=7d

# Optional: Google Calendar integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Cloudinary for avatar uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (replace with your domain)
FRONTEND_URL=https://yourdomain.com
```

**Important**: Generate a secure JWT secret:
```bash
# Generate a random 64-character string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 8. Setup Frontend

```bash
# Navigate to frontend directory
cd /var/www/freefor.games/frontend

# Install dependencies
npm install

# Create production environment file
echo "REACT_APP_API_URL=https://yourdomain.com/api" > .env.production

# Build for production
npm run build
```

### 9. Configure PM2 for Backend

Create PM2 ecosystem file:
```bash
cd /var/www/freefor.games
sudo nano ecosystem.config.js
```

Add this configuration:
```javascript
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
```

Create log directory and start the application:
```bash
# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### 10. Configure Nginx

Create Nginx configuration for your site:
```bash
sudo nano /etc/nginx/sites-available/freefor.games
```

Add this configuration (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate max-age=0;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

Enable the site and test configuration:
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/freefor.games /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 11. Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

Certbot will automatically update your Nginx configuration to include SSL.

### 12. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### 13. Setup MongoDB Security (Recommended)

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "your_secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application user
use freefor_games_prod
db.createUser({
  user: "freefor_app",
  pwd: "your_app_password", 
  roles: ["readWrite"]
})

# Exit MongoDB
exit
```

Enable MongoDB authentication:
```bash
sudo nano /etc/mongod.conf
```

Add these lines:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

Update your backend `.env` file:
```bash
sudo nano /var/www/freefor.games/backend/.env
```

Update MongoDB URI:
```env
MONGODB_URI=mongodb://freefor_app:your_app_password@localhost:27017/freefor_games_prod
```

Restart the application:
```bash
pm2 restart freefor-games-api
```

## 🔧 **Management Commands**

### Application Management
```bash
# View application status
pm2 status

# View logs
pm2 logs freefor-games-api

# Restart application
pm2 restart freefor-games-api

# Stop application
pm2 stop freefor-games-api

# View detailed monitoring
pm2 monit
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### MongoDB Management
```bash
# Check status
sudo systemctl status mongod

# View logs
sudo tail -f /var/log/mongodb/mongod.log

# Connect to database
mongosh -u freefor_app -p your_app_password freefor_games_prod
```

## 🔄 **Deployment Updates**

Create a deployment script for easy updates:
```bash
sudo nano /var/www/freefor.games/deploy.sh
```

Add this script:
```bash
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
```

Make it executable:
```bash
sudo chmod +x /var/www/freefor.games/deploy.sh
```

## 📊 **Monitoring & Maintenance**

### Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/freefor-games
```

Add:
```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Setup System Monitoring
```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install MongoDB tools
sudo apt install -y mongodb-database-tools
```

### Backup Script
```bash
sudo nano /var/www/freefor.games/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/freefor-games"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://freefor_app:your_app_password@localhost:27017/freefor_games_prod" --out="$BACKUP_DIR/mongo_$DATE"

# Backup application files
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" -C /var/www freefor.games

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Backup completed: $DATE"
```

Setup daily backup cron:
```bash
sudo crontab -e
```

Add:
```
0 2 * * * /var/www/freefor.games/backup.sh >> /var/log/backup.log 2>&1
```

## 🔍 **Troubleshooting**

### Common Issues

**1. Application won't start:**
```bash
# Check PM2 logs
pm2 logs freefor-games-api

# Check if port is in use
sudo netstat -tlnp | grep :5000
```

**2. Nginx errors:**
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

**3. MongoDB connection issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

**4. SSL certificate issues:**
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Performance Optimization

**1. Enable Nginx caching:**
```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m inactive=60m use_temp_path=off;
```

**2. Optimize MongoDB:**
```bash
# Connect to MongoDB
mongosh -u admin -p

# Create indexes for better performance
use freefor_games_prod
db.users.createIndex({ "username": 1 })
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "profile.isPublic": 1 })
db.availabilities.createIndex({ "userId": 1, "startTime": 1, "endTime": 1 })
```

## 🌐 **Domain Configuration**

If you're using a domain name:

1. **Point your domain to your server IP:**
   - Add an A record pointing to your server's IP
   - Add a CNAME record for `www` pointing to your domain

2. **Update configuration files:**
   - Update Nginx server_name
   - Update frontend `.env.production`
   - Update backend `FRONTEND_URL`

3. **Restart services:**
   ```bash
   pm2 restart freefor-games-api
   sudo systemctl reload nginx
   ```

## ✅ **Final Verification**

1. **Check all services are running:**
   ```bash
   sudo systemctl status nginx mongod
   pm2 status
   ```

2. **Test the application:**
   - Visit your domain/IP in a browser
   - Register a new user account
   - Create a profile and set availability
   - Test the explore page
   - Verify API endpoints work

3. **Check SSL (if configured):**
   ```bash
   curl -I https://yourdomain.com
   ```

Your freefor.games application should now be live and accessible! 🎉

## 📞 **Support**

If you encounter issues during deployment:
1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Ensure all services are running and accessible
4. Check firewall settings if external access is blocked

The application is now production-ready with proper security, monitoring, and backup procedures in place!
