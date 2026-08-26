import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline assets/fonts/images
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://luxurywatch.in',
  'https://luxury-watch.netlify.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or matching origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Origin '${origin}' not allowed by CORS policy.`));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routes
app.use('/api', apiRouter);

// Serve static frontend files if production build exists
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const localDistPath = path.join(__dirname, 'dist');
const distPath = fs.existsSync(frontendDistPath) ? frontendDistPath : localDistPath;
app.use(express.static(distPath));

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

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║   LUXURY WATCH | HAUTE HORLOGERIE PRODUCTION ENGINE           ║
  ║   Port: ${PORT}                                                ║
  ║   API Root: http://localhost:${PORT}/api                         ║
  ║   Health: http://localhost:${PORT}/api/health                    ║
  ║   Razorpay Integration: Active                                ║
  ║   Email OTP System: Ready                                     ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
