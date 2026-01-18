import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * API Key authentication middleware
 * Validates X-API-Key header against configured API key
 */
export async function authMiddleware(
  expectedApiKey: string,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const providedKey = request.headers['x-api-key'];

  if (!providedKey || providedKey !== expectedApiKey) {
    await reply.code(401).send({
      status: 'error',
      message: 'Unauthorized',
      mac: '',
      timestamp: new Date().toISOString(),
      error: {
        code: 'UNAUTHORIZED',
        details: 'Missing or invalid X-API-Key header',
      },
    });
  }
}
