module.exports = {
  apps: [{
    name: 'gameschakra',
    script: './dist/index.js',
    cwd: '/var/www/gameschakra',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // Process management
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    
    // Memory management
    max_memory_restart: '1G',
    
    // Logging
    log_file: '/var/log/gameschakra/combined.log',
    out_file: '/var/log/gameschakra/out.log',
    error_file: '/var/log/gameschakra/error.log',
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
      '.git'
    ],
    
    // Advanced options
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true,
    
    // Environment variables file
    env_file: '.env.production'
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-ec2-instance-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/gameschakra.git',
      path: '/var/www/gameschakra',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && npm run build && npx tsx server/migrate.ts && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
};