import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { WakeRequest, WakeResponse, ErrorResponse, HealthResponse } from '../types/index.js';
import { validateMacAddress, validatePort, validateIPv4, validateNumPackets, validateInterval } from '../validators/request.js';
import { sendWakePacket } from '../services/wol.js';

/**
 * Register Wake-on-LAN routes
 */
export async function registerWakeRoutes(server: FastifyInstance) {
  /**
   * POST /wake - Send Wake-on-LAN packet
   */
  server.post<{ Body: WakeRequest }>(
    '/wake',
    async (request: FastifyRequest<{ Body: WakeRequest }>, reply: FastifyReply) => {
      const { mac, address, port, interface: networkInterface, num_packets, interval } = request.body || {};
      const timestamp = new Date().toISOString();

      // Validate MAC address
      if (!mac) {
        const errorResponse: ErrorResponse = {
          status: 'error',
          message: 'MAC address is required',
          mac: '',
          timestamp,
          error: {
            code: 'MISSING_MAC',
            details: "The 'mac' field is required in the request body",
          },
        };
        return reply.code(400).send(errorResponse);
      }

      if (!validateMacAddress(mac)) {
        const errorResponse: ErrorResponse = {
          status: 'error',
          message: 'Invalid MAC address format',
          mac,
          timestamp,
          error: {
            code: 'INVALID_MAC_FORMAT',
            details:
              'MAC address must be in format AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, or AABBCCDDEEFF',
          },
        };
        return reply.code(400).send(errorResponse);
      }

      // Validate optional port
      if (port !== undefined && !validatePort(port)) {
        const errorResponse: ErrorResponse = {
          status: 'error',
          message: 'Invalid port number',
          mac,
          timestamp,
          error: {
            code: 'INVALID_PORT',
            details: 'Port must be between 1 and 65535',
          },
        };
        return reply.code(400).send(errorResponse);
      }

      // Validate optional address
      if (address !== undefined && !validateIPv4(address)) {
        const errorResponse: ErrorResponse = {
          status: 'error',
          message: 'Invalid IP address format',
          mac,
          timestamp,
          error: {
            code: 'INVALID_ADDRESS',
            details: 'Address must be a valid IPv4 address (e.g., 192.168.1.255)',
          },
        };
        return reply.code(400).send(errorResponse);
      }

      // Validate optional num_packets
      if (num_packets !== undefined && !validateNumPackets(num_packets)) {
        const errorResponse: ErrorResponse = {
          status: 'error',
          message: 'Invalid number of packets',
          mac,
          timestamp,
          error: {
            code: 'INVALID_NUM_PACKETS',
            details: 'Number of packets must be between 1 and 10',
          },
        };
        return reply.code(400).send(errorResponse);
      }

      // Validate optional interval
      if (interval !== undefined && !validateInterval(interval)) {
        const errorResponse: ErrorResponse = {
          status: 'error',
          message: 'Invalid interval',
          mac,
          timestamp,
          error: {
            code: 'INVALID_INTERVAL',
            details: 'Interval must be between 10 and 1000 milliseconds',
          },
        };
        return reply.code(400).send(errorResponse);
      }

      // Send Wake-on-LAN packet
      try {
        const wakeRequest: WakeRequest = {
          mac,
          ...(address && { address }),
          ...(port && { port }),
          ...(networkInterface && { interface: networkInterface }),
          ...(num_packets && { num_packets }),
          ...(interval && { interval }),
        };

        await sendWakePacket(wakeRequest);

        // Log successful wake request
        server.log.info(
          {
            mac,
            address,
            port,
            interface: networkInterface,
            num_packets,
            interval,
            result: 'success',
          },
          'Wake-on-LAN packet sent successfully'
        );

        const successResponse: WakeResponse = {
          status: 'success',
          message: 'Wake-on-LAN packet sent successfully',
          mac,
          timestamp,
        };

        return reply.code(200).send(successResponse);
      } catch (error) {
        // Log failed wake request
        server.log.error(
          {
            mac,
            address,
            port,
            interface: networkInterface,
            result: 'failure',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to send Wake-on-LAN packet'
        );

        const errorResponse: ErrorResponse = {
          status: 'error',
          message: 'Failed to send Wake-on-LAN packet',
          mac,
          timestamp,
          error: {
            code: 'WOL_SEND_FAILED',
            details: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        };

        return reply.code(500).send(errorResponse);
      }
    }
  );

  /**
   * GET /health - Health check endpoint
   */
  server.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    const healthResponse: HealthResponse = {
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    return reply.code(200).send(healthResponse);
  });
}

