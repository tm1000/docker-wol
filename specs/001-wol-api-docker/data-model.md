# Data Model

**Feature**: Wake-on-LAN API Container  
**Branch**: `001-wol-api-docker`  
**Date**: 2026-01-17

## Overview

This document defines the data structures, validation rules, and relationships for the Wake-on-LAN API service. As a stateless API, there is no persistent data storage, but we define request/response models and runtime entities.

---

## 1. Wake Request (Input Entity)

The primary input to the API, representing a command to wake a network device.

### Schema

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `mac` | string | Yes | MAC address format regex | Target device MAC address |
| `address` | string | No | IPv4 format | Custom broadcast address (default: 255.255.255.255) |
| `port` | integer | No | 1-65535 | Custom UDP port (default: 9) |
| `interface` | string | No | Network interface name | Specific network interface to use |

### Validation Rules

**MAC Address Formats (FR-002)**:
- Colon-separated: `AA:BB:CC:DD:EE:FF`
- Hyphen-separated: `AA-BB-CC-DD-EE-FF`
- Continuous: `AABBCCDDEEFF`

**Regex Pattern**:
```regex
^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$
```

**Port Validation**:
- Must be integer between 1 and 65535 (inclusive)
- Default: 9 (standard WoL port)

**Address Validation**:
- Must be valid IPv4 address format
- Typically broadcast address (e.g., 192.168.1.255)
- Default: 255.255.255.255

**Interface Validation**:
- String representing network interface name (e.g., "eth0", "en0")
- Validated against available interfaces at runtime
- Optional parameter

### TypeScript Interface

```typescript
interface WakeRequest {
  mac: string;
  address?: string;
  port?: number;
  interface?: string;
}
```

### JSON Schema (for Fastify validation)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["mac"],
  "properties": {
    "mac": {
      "type": "string",
      "pattern": "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$",
      "description": "Target device MAC address in supported formats"
    },
    "address": {
      "type": "string",
      "format": "ipv4",
      "description": "Custom broadcast address (optional)",
      "default": "255.255.255.255"
    },
    "port": {
      "type": "integer",
      "minimum": 1,
      "maximum": 65535,
      "description": "Custom UDP port (optional)",
      "default": 9
    },
    "interface": {
      "type": "string",
      "description": "Network interface name (optional)",
      "minLength": 1
    }
  },
  "additionalProperties": false
}
```

### Example Requests

**Minimal (MAC only)**:
```json
{
  "mac": "AA:BB:CC:DD:EE:FF"
}
```

**With custom broadcast address**:
```json
{
  "mac": "AA-BB-CC-DD-EE-FF",
  "address": "192.168.1.255"
}
```

**With custom port and interface**:
```json
{
  "mac": "AABBCCDDEEFF",
  "port": 7,
  "interface": "eth0"
}
```

**Full configuration**:
```json
{
  "mac": "AA:BB:CC:DD:EE:FF",
  "address": "192.168.50.255",
  "port": 9,
  "interface": "en0"
}
```

---

## 2. Wake Response (Output Entity)

The API response after processing a wake request.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | "success" or "error" |
| `message` | string | Yes | Human-readable result message |
| `mac` | string | Yes | Echoed MAC address from request |
| `timestamp` | string | Yes | ISO 8601 timestamp of request processing |
| `error` | object | No | Error details (only present if status="error") |

### TypeScript Interface

```typescript
interface WakeResponse {
  status: 'success' | 'error';
  message: string;
  mac: string;
  timestamp: string;
  error?: ErrorDetail;
}

interface ErrorDetail {
  code: string;
  details?: string;
}
```

### Success Response Example

```json
{
  "status": "success",
  "message": "Wake-on-LAN packet sent successfully",
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

### Error Response Examples

**Invalid MAC Address**:
```json
{
  "status": "error",
  "message": "Invalid MAC address format",
  "mac": "INVALID",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "error": {
    "code": "INVALID_MAC_FORMAT",
    "details": "MAC address must be in format AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, or AABBCCDDEEFF"
  }
}
```

**Invalid Port**:
```json
{
  "status": "error",
  "message": "Invalid port number",
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "error": {
    "code": "INVALID_PORT",
    "details": "Port must be between 1 and 65535"
  }
}
```

**Network Interface Not Found**:
```json
{
  "status": "error",
  "message": "Network interface not found",
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "error": {
    "code": "INTERFACE_NOT_FOUND",
    "details": "Network interface 'eth99' does not exist on this host"
  }
}
```

---

## 3. Health Check Response

Response from the `/health` endpoint for container orchestration.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | "healthy" (always if endpoint responds) |
| `uptime` | number | Yes | Process uptime in seconds |
| `timestamp` | string | Yes | ISO 8601 timestamp |

### TypeScript Interface

```typescript
interface HealthResponse {
  status: 'healthy';
  uptime: number;
  timestamp: string;
}
```

### Example Response

```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

## 4. Authentication Entity

API key authentication context (runtime only, not persisted).

### Schema

| Field | Type | Description |
|-------|------|-------------|
| `headerName` | string | "X-API-Key" (constant) |
| `expectedKey` | string | Configured API key from environment variable |
| `providedKey` | string | API key from incoming request header |

### TypeScript Interface

```typescript
interface AuthContext {
  headerName: 'X-API-Key';
  expectedKey: string;
  providedKey: string | undefined;
}
```

### Validation Logic

1. Extract `X-API-Key` header from request
2. Compare with configured `API_KEY` environment variable
3. If missing or mismatch → 401 Unauthorized
4. If match → proceed to route handler

---

## 5. Configuration Entity

Application configuration loaded from environment variables at startup.

### Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `apiKey` | string | Yes | (none) | API key for authentication |
| `port` | number | No | 3000 | HTTP server port |
| `logLevel` | string | No | "info" | Pino log level (trace, debug, info, warn, error, fatal) |
| `nodeEnv` | string | No | "production" | Environment identifier |

### TypeScript Interface

```typescript
interface AppConfig {
  apiKey: string;
  port: number;
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  nodeEnv: string;
}
```

### Validation Rules

- `apiKey`: Must be set (minimum 8 characters recommended for security)
- `port`: Must be valid port number (1-65535)
- `logLevel`: Must be valid Pino log level
- `nodeEnv`: Any string (typically "development", "production", "test")

### Fail-Fast Behavior

If configuration validation fails at startup, the application exits with error code 1 and logs the validation failure.

---

## 6. Error Codes

Standardized error codes for consistent error handling.

| Code | HTTP Status | Description | User Action |
|------|-------------|-------------|-------------|
| `INVALID_MAC_FORMAT` | 400 | MAC address format invalid | Use AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, or AABBCCDDEEFF |
| `INVALID_PORT` | 400 | Port number out of range | Use port between 1 and 65535 |
| `INVALID_ADDRESS` | 400 | IP address format invalid | Use valid IPv4 address (e.g., 192.168.1.255) |
| `INTERFACE_NOT_FOUND` | 400 | Network interface doesn't exist | Check available interfaces on host |
| `MISSING_MAC` | 400 | MAC address not provided | Include "mac" field in request body |
| `INVALID_JSON` | 400 | Request body is not valid JSON | Check JSON syntax |
| `UNAUTHORIZED` | 401 | Missing or invalid API key | Include valid X-API-Key header |
| `WOL_SEND_FAILED` | 500 | Failed to send WoL packet | Check network configuration and logs |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Contact support with timestamp |

---

## 7. State Transitions

While the service is stateless, each request follows a state flow:

```
┌─────────────────┐
│ Request Received│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Authenticate    │────► [FAIL] ──► 401 Unauthorized
└────────┬────────┘
         │ [PASS]
         ▼
┌─────────────────┐
│ Validate JSON   │────► [FAIL] ──► 400 Invalid JSON
└────────┬────────┘
         │ [PASS]
         ▼
┌─────────────────┐
│ Validate MAC    │────► [FAIL] ──► 400 Invalid MAC Format
└────────┬────────┘
         │ [PASS]
         ▼
┌─────────────────┐
│ Validate Options│────► [FAIL] ──► 400 Invalid Options
└────────┬────────┘
         │ [PASS]
         ▼
┌─────────────────┐
│ Send WoL Packet │────► [FAIL] ──► 500 WoL Send Failed
└────────┬────────┘
         │ [SUCCESS]
         ▼
┌─────────────────┐
│ Return Success  │
│  200 OK         │
└─────────────────┘
```

---

## 8. Relationship Diagram

```
┌──────────────────┐
│  HTTP Request    │
│  POST /wake      │
└────────┬─────────┘
         │ contains
         ▼
┌──────────────────┐
│  WakeRequest     │
│  - mac           │
│  - address?      │
│  - port?         │
│  - interface?    │
└────────┬─────────┘
         │ validated against
         ▼
┌──────────────────┐
│  JSON Schema     │
│  (validation)    │
└────────┬─────────┘
         │ passes to
         ▼
┌──────────────────┐
│  WoL Service     │
│  (wake_on_lan)   │
└────────┬─────────┘
         │ generates
         ▼
┌──────────────────┐
│  WakeResponse    │
│  - status        │
│  - message       │
│  - mac           │
│  - timestamp     │
│  - error?        │
└────────┬─────────┘
         │ serialized as
         ▼
┌──────────────────┐
│  HTTP Response   │
│  JSON body       │
└──────────────────┘
```

---

## Summary

The data model is intentionally minimal, reflecting the stateless, single-purpose nature of this microservice:

- **1 input entity** (WakeRequest) with comprehensive validation
- **1 output entity** (WakeResponse) with success/error variants
- **1 health check entity** for orchestration
- **Runtime entities** for auth and configuration (no persistence)
- **Clear error codes** for all failure scenarios
- **Type-safe** TypeScript interfaces throughout
- **Schema-driven** validation with JSON Schema

This design supports all functional requirements while maintaining simplicity and type safety.
