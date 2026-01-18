import wol from 'wake_on_lan';
import type { WakeRequest } from '../types/index.js';

/**
 * Send Wake-on-LAN magic packet
 * Wraps the wake_on_lan npm package with Promise-based API
 */
export function sendWakePacket(request: WakeRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    const options: {
      address?: string;
      port?: number;
      interface?: string;
      num_packets?: number;
      interval?: number;
    } = {};

    if (request.address) {
      options.address = request.address;
    }

    if (request.port) {
      options.port = request.port;
    }

    if (request.interface) {
      options.interface = request.interface;
    }

    if (request.num_packets) {
      options.num_packets = request.num_packets;
    }

    if (request.interval) {
      options.interval = request.interval;
    }

    // Send WoL packet
    wol.wake(request.mac, options, (error: Error | null) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
