import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import speakerRoutes from './routes/speakerRoutes.js';
import sponsorRoutes from './routes/sponsorRoutes.js';
import { RegistrationController } from './controllers/registrationController.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin === config.clientUrl ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.endsWith('.vercel.app') ||
          origin.includes('cibgh.org') ||
          origin.includes('cibghana.org')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health and System Diagnostics
  const healthHandler = (req: Request, res: Response) => {
    res.json({
      status: 'UP',
      service: 'CIB Ghana Events API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: config.nodeEnv,
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/api', healthHandler);

  // REST API Routes
  app.use('/api/events', eventRoutes);
  app.use('/api/registrations', registrationRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/webpay', paymentRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/speakers', speakerRoutes);
  app.use('/api/sponsors', sponsorRoutes);
  app.post('/api/send-email', (req: Request, res: Response, next) => RegistrationController.sendEmailDirect(req, res, next));

  // Email Preview Route (allows instant browser preview of dispatched payment receipt & pass)
  app.get('/api/emails/preview/:regNumber', (req: Request, res: Response) => {
    const { regNumber } = req.params;
    const previewDir = path.resolve(process.cwd(), 'scratch', 'email_previews');
    const filePath = path.join(previewDir, `receipt_${regNumber}.html`);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(fs.readFileSync(filePath, 'utf-8'));
    }
    res.status(404).send(`
      <div style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2>Email Preview Not Found</h2>
        <p>No preview generated yet for registration number: <strong>${regNumber}</strong></p>
      </div>
    `);
  });

  // 404 Handler for API endpoints specifically
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Frontend Static Hosting & SPA Routing (for Hostinger, VPS, and standalone deployments)
  const possibleClientPaths = [
    path.resolve(process.cwd(), 'frontend', 'dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../../../frontend/dist'),
    path.resolve(__dirname, '../../dist'),
  ];
  const clientDistPath = possibleClientPaths.find(
    (p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))
  );

  if (clientDistPath) {
    app.use(express.static(clientDistPath));

    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    app.get('/', (req: Request, res: Response) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>CIB Ghana Events Platform</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; text-align: center; color: #1e293b; background: #f8fafc; }
              .card { max-width: 520px; margin: 40px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
              .badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #047857; font-weight: 600; border-radius: 999px; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="card">
              <span class="badge">API Engine Active</span>
              <h2 style="margin: 16px 0 8px;">CIB Ghana Events Platform</h2>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5;">The backend service is running successfully. To view the web interface, compile the frontend with <code>npm run build</code>.</p>
              <div style="margin-top: 24px;">
                <a href="/api/health" style="color: #047857; text-decoration: none; font-weight: 600;">Check API Health &rarr;</a>
              </div>
            </div>
          </body>
        </html>
      `);
    });
  }

  // Generic 404 Handler for unmatched non-GET routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
