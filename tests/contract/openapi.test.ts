import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

describe('OpenAPI Contract Compliance', () => {
  let openApiSpec: any;

  beforeAll(() => {
    const specPath = join(process.cwd(), 'specs', '001-wol-api-docker', 'contracts', 'openapi.yaml');
    const specContent = readFileSync(specPath, 'utf8');
    openApiSpec = parse(specContent);
  });

  describe('API Specification Structure', () => {
    it('should have valid OpenAPI 3.1.0 structure', () => {
      expect(openApiSpec.openapi).toBe('3.1.0');
      expect(openApiSpec.info).toBeDefined();
      expect(openApiSpec.info.title).toBe('Wake-on-LAN API');
      expect(openApiSpec.info.version).toBe('1.0.0');
    });

    it('should define both required endpoints', () => {
      expect(openApiSpec.paths['/wake']).toBeDefined();
      expect(openApiSpec.paths['/health']).toBeDefined();
    });

    it('should define security scheme for API key', () => {
      expect(openApiSpec.components.securitySchemes.ApiKeyAuth).toBeDefined();
      expect(openApiSpec.components.securitySchemes.ApiKeyAuth.type).toBe('apiKey');
      expect(openApiSpec.components.securitySchemes.ApiKeyAuth.in).toBe('header');
      expect(openApiSpec.components.securitySchemes.ApiKeyAuth.name).toBe('X-API-Key');
    });
  });

  describe('Schema Definitions', () => {
    it('should define WakeRequest schema with required mac field', () => {
      const wakeRequest = openApiSpec.components.schemas.WakeRequest;
      expect(wakeRequest).toBeDefined();
      expect(wakeRequest.required).toContain('mac');
      expect(wakeRequest.properties.mac).toBeDefined();
      expect(wakeRequest.properties.address).toBeDefined();
      expect(wakeRequest.properties.port).toBeDefined();
      expect(wakeRequest.properties.interface).toBeDefined();
    });

    it('should define WakeResponse schema', () => {
      const wakeResponse = openApiSpec.components.schemas.WakeResponse;
      expect(wakeResponse).toBeDefined();
      expect(wakeResponse.required).toContain('status');
      expect(wakeResponse.required).toContain('message');
      expect(wakeResponse.required).toContain('mac');
      expect(wakeResponse.required).toContain('timestamp');
    });

    it('should define ErrorResponse schema', () => {
      const errorResponse = openApiSpec.components.schemas.ErrorResponse;
      expect(errorResponse).toBeDefined();
      expect(errorResponse.properties.error).toBeDefined();
      expect(errorResponse.properties.error.properties.code).toBeDefined();
    });

    it('should define HealthResponse schema', () => {
      const healthResponse = openApiSpec.components.schemas.HealthResponse;
      expect(healthResponse).toBeDefined();
      expect(healthResponse.required).toContain('status');
      expect(healthResponse.required).toContain('uptime');
      expect(healthResponse.required).toContain('timestamp');
    });
  });

  describe('Endpoint Specifications', () => {
    it('should specify POST /wake with correct request body', () => {
      const wakeEndpoint = openApiSpec.paths['/wake'].post;
      expect(wakeEndpoint).toBeDefined();
      expect(wakeEndpoint.requestBody.required).toBe(true);
      expect(wakeEndpoint.requestBody.content['application/json']).toBeDefined();
    });

    it('should specify POST /wake with correct responses', () => {
      const wakeEndpoint = openApiSpec.paths['/wake'].post;
      expect(wakeEndpoint.responses['200']).toBeDefined();
      expect(wakeEndpoint.responses['400']).toBeDefined();
      expect(wakeEndpoint.responses['401']).toBeDefined();
      expect(wakeEndpoint.responses['500']).toBeDefined();
    });

    it('should specify GET /health with correct responses', () => {
      const healthEndpoint = openApiSpec.paths['/health'].get;
      expect(healthEndpoint).toBeDefined();
      expect(healthEndpoint.responses['200']).toBeDefined();
    });

    it('should specify GET /health without authentication', () => {
      const healthEndpoint = openApiSpec.paths['/health'].get;
      expect(healthEndpoint.security).toEqual([]);
    });
  });

  describe('Error Code Definitions', () => {
    it('should define all error codes in ErrorResponse schema', () => {
      const errorResponse = openApiSpec.components.schemas.ErrorResponse;
      const errorCodes = errorResponse.properties.error.properties.code.enum;
      
      const expectedCodes = [
        'INVALID_MAC_FORMAT',
        'INVALID_PORT',
        'INVALID_ADDRESS',
        'INTERFACE_NOT_FOUND',
        'MISSING_MAC',
        'INVALID_JSON',
        'UNAUTHORIZED',
        'WOL_SEND_FAILED',
        'INTERNAL_ERROR'
      ];

      expectedCodes.forEach(code => {
        expect(errorCodes).toContain(code);
      });
    });
  });
});
