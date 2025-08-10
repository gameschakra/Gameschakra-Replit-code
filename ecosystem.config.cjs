module.exports = {
  apps: [{
    name: 'gameschakra',
    script: './dist/index.js',
    cwd: '/var/www/gameschakra',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Process management
    instances: 1, // Start with single instance, can scale later
    exec_mode: 'fork', // Use fork mode for better compatibility
    
    // Memory management
    max_memory_restart: '512M',
    
    // Logging - Use relative paths, PM2 will handle creation
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart strategy
    autorestart: true,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    watch: false, // Don't watch files in production
    ignore_watch: [
      'node_modules',
      'logs',
      'uploads',
      '.git',
      'dist'
    ],
    
    // Advanced options
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true,
    
    // Source map support for better error reporting
    source_map_support: true,
    
    // Environment variables file
    env_file: '.env.production'
  }],

  // Deployment configuration for AWS EC2
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['gameschakra.com'],
      ref: 'origin/main',
      repo: 'https://github.com/gameschakra/Website.git',
      path: '/var/www/gameschakra',
      'pre-deploy-local': '',
      'post-deploy': 'cp .env.production.aws .env.production && npm ci --production=false && npm run build && npm run db:setup:prod && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': 'mkdir -p /var/www/gameschakra/logs /var/www/gameschakra/uploads'
    }
  }
};