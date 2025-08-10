#!/bin/bash
# GamesChakra AWS EC2 Deployment Setup Script
# Run this on your AWS EC2 instance

set -e # Exit on any error

echo "🚀 Starting GamesChakra AWS EC2 Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
print_info "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_info "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx
print_info "Installing Nginx..."
sudo apt install -y nginx

# Install curl and other utilities
sudo apt install -y curl git htop

# Create application directory
print_info "Creating application directory..."
sudo mkdir -p /var/www/gameschakra
sudo chown -R $USER:$USER /var/www/gameschakra

# Clone repository from GitHub
print_info "Cloning GamesChakra repository..."
cd /var/www
if [ -d "gameschakra" ]; then
    print_warn "Directory exists, pulling latest changes..."
    cd gameschakra
    git pull origin main
else
    git clone https://github.com/gameschakra/Website.git gameschakra
    cd gameschakra
fi

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p logs uploads public

# Install dependencies
print_info "Installing Node.js dependencies..."
npm ci --production=false

# Copy production environment configuration
if [ -f ".env.production.aws" ]; then
    print_info "Setting up production environment..."
    cp .env.production.aws .env.production
    print_info "✅ Environment configuration ready"
else
    print_warn "⚠️  .env.production.aws not found. You'll need to create .env.production manually."
fi

# Build the application
print_info "Building application for production..."
npm run build

# Set up database migrations
print_info "Running database migrations..."
npm run db:setup:prod

# Configure Nginx
print_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/gameschakra > /dev/null <<EOF
server {
    listen 80;
    server_name gameschakra.com www.gameschakra.com;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # Handle CORS preflight
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '\$http_origin';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            return 204;
        }
    }

    # Static files with longer cache
    location /assets {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }

    # File uploads - increase max body size
    client_max_body_size 50M;
    client_body_timeout 300s;
    client_header_timeout 300s;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/gameschakra /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_info "Testing Nginx configuration..."
sudo nginx -t

# Start Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# Start application with PM2
print_info "Starting application with PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

# Set up PM2 to start on boot
print_info "Configuring PM2 to start on boot..."
sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u \$USER --hp \$(eval echo ~\$USER)

# Configure firewall
print_info "Configuring UFW firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create health check script
print_info "Creating health check script..."
cat > /var/www/gameschakra/health-check.sh << 'EOF'
#!/bin/bash
# Health check script for GamesChakra

# Check if PM2 process is running
if ! pm2 show gameschakra > /dev/null 2>&1; then
    echo "❌ PM2 process not running"
    exit 1
fi

# Check if application responds
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Application health check failed"
    exit 1
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "❌ Nginx is not running"
    exit 1
fi

echo "✅ All services healthy"
EOF

chmod +x /var/www/gameschakra/health-check.sh

# Final status check
print_info "Performing final health checks..."
sleep 5

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📊 Service Status:"
echo "   PM2: $(pm2 show gameschakra > /dev/null 2>&1 && echo '✅ Running' || echo '❌ Not Running')"
echo "   Nginx: $(systemctl is-active --quiet nginx && echo '✅ Running' || echo '❌ Not Running')"
echo "   Application: $(curl -f http://localhost:3000/api/health > /dev/null 2>&1 && echo '✅ Healthy' || echo '❌ Unhealthy')"
echo ""
echo "🌐 Your GamesChakra application should now be accessible at:"
echo "   http://$(curl -s http://checkip.amazonaws.com/)"
echo ""
echo "📋 Next Steps:"
echo "   1. Point your domain DNS to this server's IP address"
echo "   2. Set up SSL certificate: sudo certbot --nginx -d gameschakra.com -d www.gameschakra.com"
echo "   3. Monitor logs: pm2 logs gameschakra"
echo "   4. Check health: ./health-check.sh"
echo ""
print_info "Deployment completed successfully! 🚀"