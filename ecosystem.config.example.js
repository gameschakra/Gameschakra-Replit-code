// PM2 Ecosystem Configuration Example
// Copy this file to ecosystem.config.js and customize as needed

module.exports = {
  apps: [
    {
      name: 'your-app-backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_file: '../logs/backend-combined.log',
      time: true
    }
  ]
};