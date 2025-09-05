const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { AppDataSource } = require('./data-source');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration - Must be first to handle preflight requests
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - More permissive for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Much higher limit for development
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for CORS preflight
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints - but still permissive for development
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // Much higher limit for development
  message: {
    error: 'Too many authentication attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for CORS preflight
});
app.use('/api/auth/', authLimiter);

// Body parsing with limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import modular routes
const centrosCostoRoutes = require('./routes/centrosCosto');
const pagosRoutes = require('./routes/pagos');
const cuentasPorPagarRoutes = require('./routes/cuentasPorPagar');
const configuracionRoutes = require('./routes/configuracion');
const usersRoutes = require('./routes/users');
const proyectosRoutes = require('./routes/proyectos');
const authRoutes = require('./routes/auth');

app.use('/api/centros-costo', centrosCostoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/cuentas-por-pagar', cuentasPorPagarRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Cost Control API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    developers: {
      lead: 'Andrés Romero',
      ai_assistant: 'Claude (Anthropic)'
    },
    description: 'Sistema de Control de Costos - Desarrollado por Andrés Romero en colaboración con Claude AI'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connections closed');
  }
  
  process.exit(0);
});

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Cost Control API running on port ${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 Security: Enhanced with Helmet, Rate Limiting, and CORS`);
      console.log(`📋 API Documentation: http://localhost:${port}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  }); 