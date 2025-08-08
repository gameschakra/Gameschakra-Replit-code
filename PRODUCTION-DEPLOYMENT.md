# Production Deployment Guide

## Prerequisites

1. AWS EC2 instance with Node.js installed
2. AWS RDS PostgreSQL database
3. PM2 installed globally: `npm install -g pm2`

## Deployment Steps

### 1. Clone Repository
```bash
git clone https://github.com/gameschakra/Gameschakra-Replit-code.git
cd Gameschakra-Replit-code
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required Environment Variables:**
- `DATABASE_URL`: Your AWS RDS PostgreSQL connection string
- `SESSION_SECRET`: Generate with `openssl rand -base64 32`
- `CORS_ORIGIN`: Your production domain(s)
- `PORT`: Default 3000

### 4. Database Setup
```bash
# This will generate migrations (if needed) and run them
npm run db:setup:prod
```

### 5. Build and Deploy
```bash
# Build, migrate, and start with PM2
npm run deploy
```

## Migration Commands

- `npm run db:setup:prod` - Generate and run migrations in production
- `npm run db:migrate:prod` - Run existing migrations only
- `npm run db:generate` - Generate new migration files (run locally after schema changes)

## PM2 Management

- `npm run pm2:start` - Start the application
- `npm run pm2:stop` - Stop the application
- `npm run pm2:restart` - Restart the application
- `npm run pm2:logs` - View logs

## File Structure

The following directories contain critical data and should be backed up:
- `migrations/` - Database migration files (committed to git)
- `uploads/` - User uploaded files
- `public/images/` - Game thumbnails and assets

## Troubleshooting

### Migration Errors
- Ensure `.env.production` has correct `DATABASE_URL`
- Check database connectivity: `npm run db:studio`
- Verify migrations exist: `ls migrations/`

### Permission Errors
```bash
# Fix file permissions
chmod -R 755 uploads/
chmod -R 755 public/
```

### SSL/HTTPS Issues
- Update `CORS_ORIGIN` to use https://
- Set `SECURE_COOKIES=true` in production environment