import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectMongoDB } from './config/db.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MongoDB Connection
connectMongoDB().catch(err => {
  console.error('[Startup DB Error]:', err.message);
});

const app = express();
const PORT = env.PORT || 5000;

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline assets/fonts/images
  crossOriginEmbedderPolicy: false
}));

// Explicit CORS Configuration
const parseAllowedOrigins = () => {
  const origins = [
    'https://luxurywatch2020.netlify.app'
  ];
  if (env.FRONTEND_URL) {
    origins.push(env.FRONTEND_URL.trim().replace(/\/$/, ''));
  }
  if (env.FRONTEND_URLS) {
    env.FRONTEND_URLS.split(',').forEach(u => {
      if (u.trim()) origins.push(u.trim().replace(/\/$/, ''));
    });
  }

  // Allow local development ports only in development mode
  if (env.NODE_ENV !== 'production') {
    origins.push(
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    );
  }

  return [...new Set(origins.filter(Boolean))];
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, server-to-server, curl, tests)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin '${origin}' not permitted by CORS policy.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lightweight External Uptime Monitor Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Luxury Watch API',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api', apiRouter);

// Serve static frontend files if production build exists
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const localDistPath = path.join(__dirname, 'dist');
const distPath = fs.existsSync(frontendDistPath) ? frontendDistPath : localDistPath;
app.use(express.static(distPath));

// Backward-compatible static uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Fallback for frontend SPA routing or missing API endpoints
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Haute Horlogerie API endpoint '${req.originalUrl}' not found.`
    });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send(`LUXURY WATCH — Haute Horlogerie Engine Live on port ${PORT}`);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Process-level safety handlers
process.on('uncaughtException', (err) => {
  console.error('⚠️ [Process Uncaught Exception]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('⚠️ [Process Unhandled Rejection]:', reason);
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║   LUXURY WATCH | HAUTE HORLOGERIE PRODUCTION ENGINE           ║
  ║   Port: ${PORT}                                                ║
  ║   API Root: http://localhost:${PORT}/api                         ║
  ║   Health: http://localhost:${PORT}/health                        ║
  ║   Razorpay Integration: Active                                ║
  ║   Media Storage: Persistent Object Storage                    ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
