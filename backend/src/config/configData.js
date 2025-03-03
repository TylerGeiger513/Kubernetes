// backend/src/config/config.js
// Loads configuration from environment variables (populated by Kubernetes or Docker Compose)

module.exports = {
    host: process.env.HOST || '0.0.0.0',
    domain: process.env.DOMAIN || 'localhost',
    backendPort: parseInt(process.env.BACKEND_PORT, 10) || 3000,
    mongoURI: process.env.MONGO_URI,
    redisURI: process.env.REDIS_URI,
    sessionSecret: process.env.SESSION_SECRET,
    logLevel: process.env.LOG_LEVEL || 'info',
    ws: {
      port: parseInt(process.env.WS_PORT, 10) || 3001,
      path: process.env.WS_PATH || '/ws'
    }
  };
  