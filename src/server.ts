import Fastify from 'fastify';
import { loadConfig } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import { registerWakeRoutes } from './routes/wake.js';

const config = loadConfig();

// Create Fastify instance with Pino logging
export const server = Fastify({
  logger: config.nodeEnv === 'production' 
    ? { level: config.logLevel }
    : {
        level: config.logLevel,
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
});

// Register authentication middleware for /wake endpoint only
server.addHook('preHandler', async (request, reply) => {
  // Skip authentication for /health endpoint
  if (request.url === '/health') {
    return;
  }
  
  // Apply auth middleware to other routes
  await authMiddleware(config.apiKey, request, reply);
});

// Register routes
await registerWakeRoutes(server);

// Global error handler
server.setErrorHandler((error: Error & { statusCode?: number; code?: string }, _request, reply) => {
  server.log.error(error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  reply.status(statusCode).send({
    status: 'error',
    message,
    mac: '',
    timestamp: new Date().toISOString(),
    error: {
      code: error.code || 'INTERNAL_ERROR',
      details: error.message,
    },
  });
});

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await server.close();
      server.log.info('Server closed');
      process.exit(0);
    } catch (err) {
      server.log.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  });
});

// Start server function
export async function start() {
  try {
    await server.listen({ port: config.port, host: '0.0.0.0' });
    server.log.info(`Wake-on-LAN API listening on port ${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Only start if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
