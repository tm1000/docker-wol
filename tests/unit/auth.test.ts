import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../src/middleware/auth.js';

describe('API Key Authentication Middleware', () => {
  let server: FastifyInstance;
  const testApiKey = 'test-api-key-12345';

  beforeEach(async () => {
    server = Fastify({ logger: false });
    
    // Register middleware
    server.addHook('preHandler', async (request, reply) => {
      await authMiddleware(testApiKey, request, reply);
    });
    
    // Test route
    server.get('/test', async () => {
      return { message: 'authenticated' };
    });

    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('Valid authentication', () => {
    it('should accept request with valid X-API-Key header', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'X-API-Key': testApiKey,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ message: 'authenticated' });
    });

    it('should be case-insensitive for header name', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'x-api-key': testApiKey,
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Invalid authentication', () => {
    it('should reject request without X-API-Key header', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('error');
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with wrong API key', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'X-API-Key': 'wrong-key',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('error');
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with empty API key', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
        headers: {
          'X-API-Key': '',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should include clear error message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
      });

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Unauthorized');
      expect(body.error.details).toContain('X-API-Key');
    });
  });
});
