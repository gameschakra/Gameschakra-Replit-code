#!/bin/bash

# GameHub Pro Production Readiness Check Script

echo "🔍 Checking production readiness for GameHub Pro..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print error
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to print warning  
print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo ""
echo "📋 Checking system requirements..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
    if [[ "$NODE_VERSION" < "v18" ]]; then
        print_warning "Node.js version is below v18. Consider upgrading for better performance."
    fi
else
    print_error "Node.js is not installed"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm is not installed"
fi

# Check PM2
if command_exists pm2; then
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 installed: $PM2_VERSION"
else
    print_error "PM2 is not installed (run: npm install -g pm2)"
fi

# Check Nginx
if command_exists nginx; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d' ' -f3)
    print_success "Nginx installed: $NGINX_VERSION"
else
    print_error "Nginx is not installed"
fi

echo ""
echo "📁 Checking project structure..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

# Check critical files
CRITICAL_FILES=(
    "server/index.ts"
    "server/db.ts"
    "server/routes.ts"
    "shared/schema.ts"
    "drizzle.config.ts"
    "ecosystem.config.cjs"
    "migrations/meta/_journal.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing critical file: $file"
    fi
done

echo ""
echo "🔧 Checking configuration files..."

# Check environment files
if [ -f ".env.production" ]; then
    print_success "Production environment file exists"
    
    # Check for required environment variables
    REQUIRED_VARS=("NODE_ENV" "PORT" "DATABASE_URL" "SESSION_SECRET" "CORS_ORIGIN")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env.production; then
            print_success "Environment variable set: $var"
        else
            print_error "Missing environment variable: $var"
        fi
    done
    
    # Check for insecure defaults
    if grep -q "your-super-secure-session-secret-here" .env.production; then
        print_error "SESSION_SECRET is still using default value"
    fi
    
    if grep -q "CHANGE_THIS" .env.production; then
        print_warning "Some environment variables still have placeholder values"
    fi
    
elif [ -f ".env.production.example" ]; then
    print_warning "No .env.production found, but example exists. Copy and configure it."
else
    print_error "No production environment configuration found"
fi

echo ""
echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_success "Dependencies installed"
else
    print_warning "Dependencies not installed. Run 'npm install'"
fi

# Check build output
if [ -d "dist" ]; then
    print_success "Build directory exists"
    if [ -d "dist/public" ]; then
        print_success "Frontend build found"
    else
        print_warning "Frontend build not found. Run 'npm run build'"
    fi
    
    if [ -f "dist/index.js" ]; then
        print_success "Backend build found"
    else
        print_warning "Backend build not found. Run 'npm run build'"
    fi
else
    print_warning "No build directory found. Run 'npm run build'"
fi

echo ""
echo "🗄️  Checking database configuration..."

# Check migrations
if [ -d "migrations" ] && [ -f "migrations/meta/_journal.json" ]; then
    print_success "Database migrations found"
    MIGRATION_COUNT=$(ls migrations/*.sql 2>/dev/null | wc -l)
    print_success "Migration files: $MIGRATION_COUNT"
else
    print_error "Database migrations not found. Run 'npm run db:generate'"
fi

echo ""
echo "🌐 Checking AWS deployment readiness..."

# Check directory structure for AWS
REQUIRED_DIRS=("uploads" "public" "logs")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ] || [ "$dir" = "logs" ]; then
        print_success "Directory ready: $dir"
    else
        print_warning "Directory missing (will be created during deployment): $dir"
    fi
done

# Check port configuration
if grep -q "PORT=3000" .env.production 2>/dev/null; then
    print_success "Port configured for AWS (3000)"
elif grep -q "PORT=" .env.production 2>/dev/null; then
    PORT_VALUE=$(grep "PORT=" .env.production | cut -d'=' -f2)
    print_warning "Port set to $PORT_VALUE (recommended: 3000 for AWS)"
else
    print_warning "PORT not explicitly set (will default to 3000)"
fi

echo ""
echo "📊 Production readiness summary:"
echo "================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "🎉 All checks passed! Your project is production-ready."
    echo ""
    echo "Next steps:"
    echo "1. Deploy to AWS EC2: ./deploy-to-aws.sh"
    echo "2. Configure DNS: Point gameschakra.com to your EC2 IP"
    echo "3. Set up SSL: sudo certbot --nginx -d gameschakra.com"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Project is mostly ready but consider fixing warnings.${NC}"
    echo ""
    echo "You can proceed with deployment, but review the warnings above."
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found. Please fix errors before deployment.${NC}"
    exit 1
fi