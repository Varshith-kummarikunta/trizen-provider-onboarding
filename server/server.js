require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { bootstrapAdmin } = require('./utils/seedAdmin');

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening
connectDB().then(async () => {
  // Automatically bootstrap/verify admin user from environment variables
  try {
    await bootstrapAdmin();
  } catch (err) {
    console.error(`[Admin Bootstrap Warning] Failed to initialize admin: ${err.message}`);
  }

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`[Server] Trizen Onboarding Server running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] Health Check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] Process terminated.');
    });
  });
});
