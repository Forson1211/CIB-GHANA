import app from './index.js';
import { config } from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`
=============================================================
  CIB GHANA EVENTS PLATFORM - BACKEND ENGINE
=============================================================
  ⚡ Environment : ${config.nodeEnv}
  🚀 API Server  : http://localhost:${config.port}
  🩺 Health Check: http://localhost:${config.port}/api/health
  🌐 Client CORS : ${config.clientUrl}
=============================================================
`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Backend Server] Port ${config.port} is already in use.`);
  } else {
    console.error('[Backend Server] Server error:', err);
  }
});

export default server;
