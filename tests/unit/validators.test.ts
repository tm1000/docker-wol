import { describe, it, expect } from 'vitest';
import { validateMacAddress, validatePort, validateIPv4, validateNumPackets, validateInterval } from '../../src/validators/request.js';

describe('MAC Address Validator', () => {
  describe('Valid MAC address formats', () => {
    it('should accept colon-separated format (AA:BB:CC:DD:EE:FF)', () => {
      expect(validateMacAddress('AA:BB:CC:DD:EE:FF')).toBe(true);
      expect(validateMacAddress('00:11:22:33:44:55')).toBe(true);
      expect(validateMacAddress('aa:bb:cc:dd:ee:ff')).toBe(true);
    });

    it('should accept hyphen-separated format (AA-BB-CC-DD-EE-FF)', () => {
      expect(validateMacAddress('AA-BB-CC-DD-EE-FF')).toBe(true);
      expect(validateMacAddress('00-11-22-33-44-55')).toBe(true);
      expect(validateMacAddress('aa-bb-cc-dd-ee-ff')).toBe(true);
    });

    it('should accept continuous format (AABBCCDDEEFF)', () => {
      expect(validateMacAddress('AABBCCDDEEFF')).toBe(true);
      expect(validateMacAddress('001122334455')).toBe(true);
      expect(validateMacAddress('aabbccddeeff')).toBe(true);
    });

    it('should accept mixed case', () => {
      expect(validateMacAddress('Aa:Bb:Cc:Dd:Ee:Ff')).toBe(true);
      expect(validateMacAddress('aA-bB-cC-dD-eE-fF')).toBe(true);
    });
  });

  describe('Invalid MAC address formats', () => {
    it('should reject invalid characters', () => {
      expect(validateMacAddress('GG:HH:II:JJ:KK:LL')).toBe(false);
      expect(validateMacAddress('XX:YY:ZZ:00:11:22')).toBe(false);
    });

    it('should reject wrong segment count', () => {
      expect(validateMacAddress('AA:BB:CC:DD:EE')).toBe(false);
      expect(validateMacAddress('AA:BB:CC:DD:EE:FF:GG')).toBe(false);
    });

    it('should reject wrong segment length', () => {
      expect(validateMacAddress('A:B:C:D:E:F')).toBe(false);
      expect(validateMacAddress('AAA:BBB:CCC:DDD:EEE:FFF')).toBe(false);
    });

    it('should reject mixed separators', () => {
      expect(validateMacAddress('AA:BB-CC:DD-EE:FF')).toBe(false);
    });

    it('should reject wrong continuous length', () => {
      expect(validateMacAddress('AABBCCDDEE')).toBe(false);
      expect(validateMacAddress('AABBCCDDEEFFGG')).toBe(false);
    });

    it('should reject empty or null input', () => {
      expect(validateMacAddress('')).toBe(false);
      expect(validateMacAddress('   ')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(validateMacAddress('AA:BB:CC:DD:EE:FF!')).toBe(false);
      expect(validateMacAddress('AA@BB#CC$DD%EE^FF')).toBe(false);
    });
  });
});

describe('Port Validator', () => {
  describe('Valid ports', () => {
    it('should accept valid port numbers', () => {
      expect(validatePort(1)).toBe(true);
      expect(validatePort(80)).toBe(true);
      expect(validatePort(3000)).toBe(true);
      expect(validatePort(8080)).toBe(true);
      expect(validatePort(65535)).toBe(true);
    });
  });

  describe('Invalid ports', () => {
    it('should reject port 0', () => {
      expect(validatePort(0)).toBe(false);
    });

    it('should reject ports above 65535', () => {
      expect(validatePort(65536)).toBe(false);
      expect(validatePort(99999)).toBe(false);
    });

    it('should reject negative ports', () => {
      expect(validatePort(-1)).toBe(false);
      expect(validatePort(-100)).toBe(false);
    });

    it('should reject non-integer values', () => {
      expect(validatePort(3.14)).toBe(false);
      expect(validatePort(80.5)).toBe(false);
    });
  });
});

describe('IPv4 Validator', () => {
  describe('Valid IPv4 addresses', () => {
    it('should accept valid IPv4 addresses', () => {
      expect(validateIPv4('192.168.1.1')).toBe(true);
      expect(validateIPv4('10.0.0.1')).toBe(true);
      expect(validateIPv4('255.255.255.255')).toBe(true);
      expect(validateIPv4('0.0.0.0')).toBe(true);
      expect(validateIPv4('127.0.0.1')).toBe(true);
    });
  });

  describe('Invalid IPv4 addresses', () => {
    it('should reject addresses with octets > 255', () => {
      expect(validateIPv4('256.1.1.1')).toBe(false);
      expect(validateIPv4('192.256.1.1')).toBe(false);
      expect(validateIPv4('192.168.256.1')).toBe(false);
      expect(validateIPv4('192.168.1.256')).toBe(false);
    });

    it('should reject addresses with wrong format', () => {
      expect(validateIPv4('192.168.1')).toBe(false);
      expect(validateIPv4('192.168.1.1.1')).toBe(false);
      expect(validateIPv4('abc.def.ghi.jkl')).toBe(false);
    });

    it('should reject empty or null input', () => {
      expect(validateIPv4('')).toBe(false);
      expect(validateIPv4('   ')).toBe(false);
    });

    it('should reject invalid separators', () => {
      expect(validateIPv4('192:168:1:1')).toBe(false);
      expect(validateIPv4('192-168-1-1')).toBe(false);
    });
  });
});

describe('NumPackets Validator', () => {
  describe('Valid num_packets values', () => {
    it('should accept valid packet counts', () => {
      expect(validateNumPackets(1)).toBe(true);
      expect(validateNumPackets(3)).toBe(true);
      expect(validateNumPackets(5)).toBe(true);
      expect(validateNumPackets(10)).toBe(true);
    });
  });

  describe('Invalid num_packets values', () => {
    it('should reject 0 and negative numbers', () => {
      expect(validateNumPackets(0)).toBe(false);
      expect(validateNumPackets(-1)).toBe(false);
      expect(validateNumPackets(-10)).toBe(false);
    });

    it('should reject numbers above 10', () => {
      expect(validateNumPackets(11)).toBe(false);
      expect(validateNumPackets(100)).toBe(false);
      expect(validateNumPackets(1000)).toBe(false);
    });

    it('should reject non-integer values', () => {
      expect(validateNumPackets(3.5)).toBe(false);
      expect(validateNumPackets(1.1)).toBe(false);
    });
  });
});

describe('Interval Validator', () => {
  describe('Valid interval values', () => {
    it('should accept valid intervals in milliseconds', () => {
      expect(validateInterval(10)).toBe(true);
      expect(validateInterval(50)).toBe(true);
      expect(validateInterval(100)).toBe(true);
      expect(validateInterval(500)).toBe(true);
      expect(validateInterval(1000)).toBe(true);
    });
  });

  describe('Invalid interval values', () => {
    it('should reject intervals below 10ms', () => {
      expect(validateInterval(0)).toBe(false);
      expect(validateInterval(5)).toBe(false);
      expect(validateInterval(9)).toBe(false);
      expect(validateInterval(-1)).toBe(false);
    });

    it('should reject intervals above 1000ms', () => {
      expect(validateInterval(1001)).toBe(false);
      expect(validateInterval(2000)).toBe(false);
      expect(validateInterval(10000)).toBe(false);
    });

    it('should reject non-integer values', () => {
      expect(validateInterval(100.5)).toBe(false);
      expect(validateInterval(50.1)).toBe(false);
    });
  });
});

