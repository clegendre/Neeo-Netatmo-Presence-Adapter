'use strict';

/**
 * PM2 ecosystem file to run the bundled adapter.
 * Build first: npm run build
 * Start with: pm2 start scripts/pm2.config.js
 * Save on boot: pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'neeo-ir-blaster',
      script: 'neeo-custom/neeo-adapter-philips-tv/index.js',
      cwd: __dirname + '/..',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      watch: false
    },
    {
      name: 'neeo-netatmo-presence',
      script: 'neeo-custom/neeo-netatmo-presence/index.js',
      cwd: __dirname + '/..',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      watch: false
    }
  ]
};
