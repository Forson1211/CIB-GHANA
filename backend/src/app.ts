import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { config } from './config/index.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import speakerRoutes from './routes/speakerRoutes.js';
import { RegistrationController } from './controllers/registrationController.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health and System Diagnostics
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'UP',
      service: 'CIB Ghana Events API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: config.nodeEnv,
    });
  });

  // REST API Routes
  app.use('/api/events', eventRoutes);
  app.use('/api/registrations', registrationRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/speakers', speakerRoutes);
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

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
