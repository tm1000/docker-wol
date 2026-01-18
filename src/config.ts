import type { AppConfig } from './types/index.js';

/**
 * Load and validate application configuration from environment variables
 * Exits process with code 1 if required configuration is missing
 */
export function loadConfig(): AppConfig {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error('FATAL: API_KEY environment variable is required');
    process.exit(1);
  }

  if (apiKey.length < 8) {
    console.warn('WARNING: API_KEY is less than 8 characters. Consider using a stronger key.');
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('FATAL: PORT must be a valid port number (1-65535)');
    process.exit(1);
  }

  const logLevel = process.env.LOG_LEVEL || 'info';
  const validLogLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  if (!validLogLevels.includes(logLevel)) {
    console.error(`FATAL: LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`);
    process.exit(1);
  }

  const nodeEnv = process.env.NODE_ENV || 'production';

  return {
    apiKey,
    port,
    logLevel: logLevel as AppConfig['logLevel'],
    nodeEnv,
  };
}
