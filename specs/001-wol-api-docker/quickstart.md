# Quick Start Guide

**Feature**: Wake-on-LAN API Container  
**Version**: 1.0.0

## What is This?

A containerized HTTP API that sends Wake-on-LAN (WoL) magic packets to wake up network devices. Designed for Docker Compose stacks where only this service needs host network access, keeping other containers isolated.

---

## Prerequisites

- Docker installed (version 20.10 or later)
- A network device with Wake-on-LAN enabled
- The device's MAC address
- (Optional) Docker Compose for multi-container setups

---

## Quick Start (5 minutes)

### 1. Pull the Image

```bash
# From Docker Hub
docker pull [dockerhub-username]/wake-on-lan-api:latest

# OR from GitHub Container Registry
docker pull ghcr.io/[github-org]/wake-on-lan-api:latest
```

### 2. Run the Container

```bash
docker run -d \
  --name wol-api \
  --network host \
  -e API_KEY=your-secret-api-key-here \
  [dockerhub-username]/wake-on-lan-api:latest
```

**Important**: The `--network host` flag is required for the container to access your physical network and send WoL packets.

### 3. Send a Wake Request

```bash
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF"}'
```

**Response (Success)**:
```json
{
  "status": "success",
  "message": "Wake-on-LAN packet sent successfully",
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

### 4. Check Health

```bash
curl http://localhost:3000/health
```

**Response**:
```json
{
  "status": "healthy",
  "uptime": 123,
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

## Docker Compose Setup

This is the **recommended way** to use the WoL API in multi-container applications.

### Example `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Wake-on-LAN API (requires host network)
  wol-api:
    image: [dockerhub-username]/wake-on-lan-api:latest
    container_name: wol-api
    network_mode: host
    environment:
      - API_KEY=your-secret-api-key-here
      - PORT=3000
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

  # Example application that uses the WoL API
  my-app:
    image: my-application:latest
    container_name: my-app
    # Regular bridge networking (isolated from host)
    networks:
      - app-network
    environment:
      - WOL_API_URL=http://localhost:3000
      - WOL_API_KEY=your-secret-api-key-here
    depends_on:
      wol-api:
        condition: service_healthy

networks:
  app-network:
    driver: bridge
```

### Key Points

- **WoL API**: Uses `network_mode: host` to access physical network
- **Other Services**: Use standard bridge networking for isolation
- **Communication**: Other containers access WoL API via `http://localhost:3000` (since WoL API is on host network)
- **Health Check**: Ensures WoL API is ready before dependent services start

---

## Configuration Options

Configure the container via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_KEY` | **Yes** | (none) | API key for authentication (min 8 chars recommended) |
| `PORT` | No | `3000` | HTTP server port |
| `LOG_LEVEL` | No | `info` | Log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `NODE_ENV` | No | `production` | Environment identifier |

### Example with Custom Configuration

```bash
docker run -d \
  --name wol-api \
  --network host \
  -e API_KEY=my-super-secret-key-12345 \
  -e PORT=8080 \
  -e LOG_LEVEL=debug \
  [dockerhub-username]/wake-on-lan-api:latest
```

---

## API Usage

### Endpoint: `POST /wake`

Send a Wake-on-LAN packet to a network device.

**Headers**:
- `Content-Type: application/json` (required)
- `X-API-Key: your-api-key` (required)

**Request Body**:

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `mac` | **Yes** | string | MAC address (formats: `AA:BB:CC:DD:EE:FF`, `AA-BB-CC-DD-EE-FF`, or `AABBCCDDEEFF`) |
| `address` | No | string | Custom broadcast address (default: `255.255.255.255`) |
| `port` | No | integer | Custom UDP port (default: `9`) |
| `interface` | No | string | Specific network interface (e.g., `eth0`, `en0`) |

### Examples

**Basic Wake Request**:
```bash
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF"}'
```

**Custom Broadcast Address**:
```bash
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "mac": "AA:BB:CC:DD:EE:FF",
    "address": "192.168.1.255"
  }'
```

**Custom Port and Interface**:
```bash
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "mac": "AA:BB:CC:DD:EE:FF",
    "port": 7,
    "interface": "eth0"
  }'
```

**Full Configuration**:
```bash
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "mac": "AA:BB:CC:DD:EE:FF",
    "address": "192.168.50.255",
    "port": 9,
    "interface": "en0"
  }'
```

---

## Error Handling

### Common Error Responses

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

**Missing/Invalid API Key**:
```json
{
  "status": "error",
  "message": "Unauthorized",
  "mac": "",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "error": {
    "code": "UNAUTHORIZED",
    "details": "Missing or invalid X-API-Key header"
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

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `INVALID_MAC_FORMAT` | 400 | MAC address format is invalid |
| `INVALID_PORT` | 400 | Port number out of valid range (1-65535) |
| `INVALID_ADDRESS` | 400 | IP address format is invalid |
| `INTERFACE_NOT_FOUND` | 400 | Specified network interface doesn't exist |
| `MISSING_MAC` | 400 | MAC address field is missing |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `WOL_SEND_FAILED` | 500 | Failed to send WoL packet |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Troubleshooting

### Device Doesn't Wake Up

1. **Verify WoL is enabled** on the target device (BIOS/UEFI and OS settings)
2. **Check MAC address** is correct (use `ip addr` or `ifconfig` on target device)
3. **Test broadcast address** - try subnet broadcast instead of `255.255.255.255`:
   ```bash
   # Example for 192.168.1.x network
   curl -X POST http://localhost:3000/wake \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-api-key" \
     -d '{"mac": "AA:BB:CC:DD:EE:FF", "address": "192.168.1.255"}'
   ```
4. **Try specific interface** if multiple network interfaces exist:
   ```bash
   curl -X POST http://localhost:3000/wake \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-api-key" \
     -d '{"mac": "AA:BB:CC:DD:EE:FF", "interface": "eth0"}'
   ```

### Container Network Issues

**Problem**: Container can't send packets on physical network

**Solution**: Ensure `--network host` or `network_mode: host` is configured:
```bash
# Check container network mode
docker inspect wol-api | grep NetworkMode

# Should show: "NetworkMode": "host"
```

### Authentication Errors

**Problem**: Getting 401 Unauthorized errors

**Solutions**:
1. Verify `API_KEY` environment variable is set correctly
2. Ensure `X-API-Key` header matches the configured API key
3. Check for typos (header name is case-sensitive: `X-API-Key`)

---

## Development & Testing

### Build from Source

```bash
# Clone repository
git clone https://github.com/[org]/docker-wol.git
cd docker-wol

# Build Docker image
docker build -t wake-on-lan-api:dev .

# Run locally
docker run -d \
  --name wol-api-dev \
  --network host \
  -e API_KEY=dev-key-12345 \
  wake-on-lan-api:dev
```

### View Logs

```bash
# Follow logs
docker logs -f wol-api

# View last 100 lines
docker logs --tail 100 wol-api

# View logs with timestamps
docker logs -t wol-api
```

### Interactive Testing

Use a tool like [HTTPie](https://httpie.io/) for easier testing:

```bash
# Install HTTPie
pip install httpie

# Send wake request
http POST localhost:3000/wake \
  X-API-Key:your-api-key \
  mac=AA:BB:CC:DD:EE:FF

# With custom options
http POST localhost:3000/wake \
  X-API-Key:your-api-key \
  mac=AA:BB:CC:DD:EE:FF \
  address=192.168.1.255 \
  port:=9 \
  interface=eth0
```

---

## Security Best Practices

1. **Use strong API keys**: Minimum 16 characters, random alphanumeric
2. **Rotate keys regularly**: Change API key periodically
3. **Limit exposure**: Don't expose port 3000 publicly (use reverse proxy with TLS if needed)
4. **Monitor logs**: Watch for unauthorized access attempts
5. **Use secrets management**: Store API keys in Docker secrets or environment secrets, not in plain text

### Example with Docker Secrets

```yaml
version: '3.8'

services:
  wol-api:
    image: [dockerhub-username]/wake-on-lan-api:latest
    network_mode: host
    secrets:
      - wol_api_key
    environment:
      - API_KEY_FILE=/run/secrets/wol_api_key
    # ... rest of config

secrets:
  wol_api_key:
    file: ./secrets/api_key.txt
```

---

## Support & Documentation

- **API Contract**: See `contracts/openapi.yaml` for full OpenAPI 3.1 specification
- **Data Model**: See `data-model.md` for detailed entity schemas
- **Issue Tracker**: [GitHub Issues](https://github.com/[org]/docker-wol/issues)
- **wake_on_lan package**: [npm package documentation](https://www.npmjs.com/package/wake_on_lan)

---

## Next Steps

1. ✅ Pull and run the container
2. ✅ Test basic wake functionality
3. ✅ Integrate into your Docker Compose stack
4. 📖 Read the OpenAPI spec for advanced usage
5. 🔧 Customize configuration for your network
6. 🚀 Deploy to production

Happy waking! 🌅
