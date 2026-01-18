import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '../../src/config.js';

describe('Configuration Loader', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Valid configuration', () => {
    it('should load configuration with all required values', () => {
      process.env.API_KEY = 'test-api-key-12345';
      process.env.PORT = '3000';
      process.env.LOG_LEVEL = 'info';
      process.env.NODE_ENV = 'production';

      const config = loadConfig();

      expect(config.apiKey).toBe('test-api-key-12345');
      expect(config.port).toBe(3000);
      expect(config.logLevel).toBe('info');
      expect(config.nodeEnv).toBe('production');
    });

    it('should use default values when optional env vars are missing', () => {
      process.env.API_KEY = 'test-api-key-12345';
      delete process.env.PORT;
      delete process.env.LOG_LEVEL;
      delete process.env.NODE_ENV;

      const config = loadConfig();

      expect(config.apiKey).toBe('test-api-key-12345');
      expect(config.port).toBe(3000); // default
      expect(config.logLevel).toBe('info'); // default
      expect(config.nodeEnv).toBe('production'); // default
    });

    it('should accept all valid log levels', () => {
      const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

      validLevels.forEach((level) => {
        process.env.API_KEY = 'test-key';
        process.env.LOG_LEVEL = level;

        const config = loadConfig();
        expect(config.logLevel).toBe(level);
      });
    });

    it('should parse port number correctly', () => {
      process.env.API_KEY = 'test-key';
      process.env.PORT = '8080';

      const config = loadConfig();
      expect(config.port).toBe(8080);
      expect(typeof config.port).toBe('number');
    });
  });

  describe('Invalid configuration', () => {
    it('should exit if API_KEY is missing', () => {
      delete process.env.API_KEY;
      
      // Mock process.exit to prevent actual exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      expect(() => loadConfig()).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
      
      exitSpy.mockRestore();
    });

    it('should exit if PORT is invalid', () => {
      process.env.API_KEY = 'test-key';
      process.env.PORT = 'invalid';

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      expect(() => loadConfig()).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
      
      exitSpy.mockRestore();
    });

    it('should exit if PORT is out of range', () => {
      process.env.API_KEY = 'test-key';
      
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      process.env.PORT = '0';
      expect(() => loadConfig()).toThrow('process.exit called');

      process.env.PORT = '99999';
      expect(() => loadConfig()).toThrow('process.exit called');

      exitSpy.mockRestore();
    });

    it('should exit if LOG_LEVEL is invalid', () => {
      process.env.API_KEY = 'test-key';
      process.env.LOG_LEVEL = 'invalid';

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      expect(() => loadConfig()).toThrow('process.exit called');
      expect(exitSpy).toHaveBeenCalledWith(1);
      
      exitSpy.mockRestore();
    });
  });
});
