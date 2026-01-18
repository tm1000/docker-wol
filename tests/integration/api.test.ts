import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { server } from '../../src/server.js';

describe('Wake API Integration Tests', () => {
  const testApiKey = process.env.API_KEY || 'test-api-key-12345';

  beforeAll(async () => {
    // Ensure server is ready
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /wake', () => {
    describe('Successful wake requests', () => {
      it('should send WoL packet with valid MAC address', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
        expect(body.mac).toBe('AA:BB:CC:DD:EE:FF');
        expect(body.timestamp).toBeDefined();
        expect(body.message).toContain('Wake-on-LAN packet sent successfully');
      });

      it('should accept hyphen-separated MAC address', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA-BB-CC-DD-EE-FF',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
      });

      it('should accept continuous MAC address format', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AABBCCDDEEFF',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
      });

      it('should accept custom broadcast address', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            address: '192.168.1.255',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
      });

      it('should accept custom port', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            port: 7,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
      });

      it('should accept custom interface', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            interface: 'eth0',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
      });

      it('should accept multiple options combined', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            address: '192.168.1.255',
            port: 9,
            interface: 'en0',
            num_packets: 5,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
      });

      it('should accept custom num_packets', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            num_packets: 1,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('success');
      });
    });

    describe('Error handling', () => {
      it('should return 400 for invalid MAC address', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'INVALID-MAC',
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('error');
        expect(body.error.code).toBe('INVALID_MAC_FORMAT');
        expect(body.error.details).toBeDefined();
      });

      it('should return 400 for missing MAC address', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {},
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error.code).toBe('MISSING_MAC');
      });

      it('should return 400 for invalid port', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            port: 99999,
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error.code).toBe('INVALID_PORT');
      });

      it('should return 400 for invalid address', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            address: '999.999.999.999',
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error.code).toBe('INVALID_ADDRESS');
      });

      it('should return 400 for invalid num_packets (too high)', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            num_packets: 99,
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error.code).toBe('INVALID_NUM_PACKETS');
      });

      it('should return 400 for invalid num_packets (zero)', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testApiKey,
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
            num_packets: 0,
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error.code).toBe('INVALID_NUM_PACKETS');
      });

      it('should return 401 without API key', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
          },
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('error');
        expect(body.error.code).toBe('UNAUTHORIZED');
      });

      it('should return 401 with invalid API key', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/wake',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'wrong-key',
          },
          payload: {
            mac: 'AA:BB:CC:DD:EE:FF',
          },
        });

        expect(response.statusCode).toBe(401);
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
      expect(body.timestamp).toBeDefined();
    });

    it('should not require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
