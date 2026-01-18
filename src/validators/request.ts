/**
 * Validate MAC address format
 * Supports three formats:
 * - Colon-separated: AA:BB:CC:DD:EE:FF
 * - Hyphen-separated: AA-BB-CC-DD-EE-FF
 * - Continuous: AABBCCDDEEFF
 */
export function validateMacAddress(mac: string): boolean {
  if (!mac || typeof mac !== 'string') {
    return false;
  }

  const trimmed = mac.trim();
  
  // Three separate patterns to prevent mixed separators
  const colonPattern = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
  const hyphenPattern = /^([0-9A-Fa-f]{2}-){5}[0-9A-Fa-f]{2}$/;
  const continuousPattern = /^[0-9A-Fa-f]{12}$/;
  
  return colonPattern.test(trimmed) || hyphenPattern.test(trimmed) || continuousPattern.test(trimmed);
}

/**
 * Validate port number (1-65535)
 */
export function validatePort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * Validate IPv4 address format
 */
export function validateIPv4(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  if (!ipv4Regex.test(address)) {
    return false;
  }

  // Check each octet is 0-255
  const octets = address.split('.');
  return octets.every((octet) => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}
