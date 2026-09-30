import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

app.listen(config.port, () => {
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

export { app };
