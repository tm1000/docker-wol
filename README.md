# Wake-on-LAN API Container

[![Docker Build](https://img.shields.io/docker/automated/your-username/wake-on-lan-api)](https://hub.docker.com/r/tm99899/wol)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple, containerized HTTP API for sending Wake-on-LAN (WoL) magic packets to network devices. Designed for Docker Compose stacks where only this service needs host network access, keeping other containers isolated.

**NOTE** This is 100% "vibe"-coded utilizing claude-sonnet-4.5. I have no qualms about this but needed a way to run [https://www.npmjs.com/package/wake_on_lan](https://www.npmjs.com/package/wake_on_lan) in a docker-compose setup as a standalone container that has a `network_mode` of `host` so that I could use [companion](https://bitfocus.io/companion-pi) in another container without exposing it to the host 

## Features

- ✅ **Simple HTTP API** - Single POST endpoint for sending WoL packets
- ✅ **Multiple MAC formats** - Supports colon, hyphen, and continuous MAC address formats
- ✅ **Custom options** - Configure broadcast address, port, and network interface
- ✅ **API Key Auth** - Secure access with X-API-Key header authentication
- ✅ **Docker-ready** - Multi-platform images (amd64, arm64) on Docker Hub and GHCR
- ✅ **Health checks** - Built-in endpoint for container orchestration
- ✅ **Lightweight** - <50MB Docker image, <5s startup time
- ✅ **Production-ready** - TypeScript, comprehensive tests, structured logging

## Quick Start

### Docker Run

```bash
docker run -d \
  --name wol-api \
  --network host \
  -e API_KEY=your-secret-api-key \
  your-username/wake-on-lan-api:latest
```

### Docker Compose

```yaml
services:
  wol-api:
    image: tm99899/wol:latest
    network_mode: host
    environment:
      - API_KEY=your-secret-api-key
    restart: unless-stopped
```

### Kubernetes Compose

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wol-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: wol-api
  template:
    metadata:
      labels:
        app: wol-api
    spec:
      hostNetwork: true
      containers:
        - name: wol-api
          image: 'tm99899/wol:1.0.0'
          env:
            - name: API_KEY
              valueFrom:
                secretKeyRef:
                  name: wol-api-secret
                  key: api-key

```

### Send Wake Request

```bash
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF"}'
```

**Response:**
```json
{
  "status": "success",
  "message": "Wake-on-LAN packet sent successfully",
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-01-18T00:00:00.000Z"
}
```

## API Reference

### POST /wake

Send a Wake-on-LAN magic packet to a network device.

**Headers:**
- `Content-Type: application/json` (required)
- `X-API-Key: <your-api-key>` (required)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mac` | string | Yes | MAC address (formats: `AA:BB:CC:DD:EE:FF`, `AA-BB-CC-DD-EE-FF`, `AABBCCDDEEFF`) |
| `address` | string | No | Custom broadcast address (default: `255.255.255.255`) |
| `port` | integer | No | Custom UDP port (default: `9`) |
| `interface` | string | No | Network interface name (e.g., `eth0`, `en0`) |
| `num_packets` | integer | No | Number of packets to send (1-10, default: `3`) |
| `interval` | integer | No | Delay between packets in milliseconds (10-1000, default: `100`) |

**Examples:**

```bash
# Basic wake request
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF"}'

# Custom broadcast address
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF", "address": "192.168.1.255"}'

# Custom port and interface
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key": "your-api-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF", "port": 7, "interface": "eth0"}'

# Send multiple packets for reliability
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF", "num_packets": 5}'

# Custom packet timing (5 packets with 200ms delay)
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF", "num_packets": 5, "interval": 200}'
```

### GET /health

Health check endpoint for container orchestration (no authentication required).

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123,
  "timestamp": "2026-01-18T00:00:00.000Z"
}
```

## Configuration

Configure via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_KEY` | **Yes** | - | API key for authentication (min 8 chars recommended) |
| `PORT` | No | `3000` | HTTP server port |
| `LOG_LEVEL` | No | `info` | Log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `NODE_ENV` | No | `production` | Environment identifier |

## Development

### Prerequisites

- Node.js 24 LTS or later
- npm or yarn
- Docker (optional, for containerization)

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/docker-wol.git
cd docker-wol

# Install dependencies
npm install

# Run tests
npm test

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### Project Structure

```
src/
├── server.ts           # HTTP server setup
├── routes/
│   └── wake.ts        # POST /wake and GET /health endpoints
├── middleware/
│   └── auth.ts        # API key authentication
├── services/
│   └── wol.ts         # Wake-on-LAN service wrapper
├── validators/
│   └── request.ts     # Input validation
├── types/
│   └── index.ts       # TypeScript interfaces
└── config.ts          # Environment configuration

tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
└── contract/          # OpenAPI compliance tests
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test tests/unit
npm test tests/integration
```

### Building Docker Image

```bash
# Build image
docker build -t wake-on-lan-api:dev .

# Run locally
docker run -d \
  --name wol-api-dev \
  --network host \
  -e API_KEY=dev-key-12345 \
  wake-on-lan-api:dev
```

## Troubleshooting

### Device Doesn't Wake Up

1. Verify Wake-on-LAN is enabled in device BIOS/UEFI and OS settings
2. Check MAC address is correct
3. Try subnet broadcast address instead of `255.255.255.255`
4. Try specifying network interface explicitly

### Container Network Issues

Ensure `--network host` or `network_mode: host` is configured:

```bash
docker inspect wol-api | grep NetworkMode
# Should show: "NetworkMode": "host"
```

### Authentication Errors

- Verify `API_KEY` environment variable is set
- Ensure `X-API-Key` header matches configured API key
- Header name is case-sensitive: `X-API-Key`

## Security Best Practices

- Use strong API keys (minimum 16 characters, random alphanumeric)
- Rotate API keys regularly
- Don't expose port 3000 publicly (use reverse proxy with TLS if needed)
- Monitor logs for unauthorized access attempts
- Use Docker secrets or environment secrets, not plain text

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Support

- **Documentation**: [specs/001-wol-api-docker/](specs/001-wol-api-docker/)
- **API Spec**: [contracts/openapi.yaml](specs/001-wol-api-docker/contracts/openapi.yaml)
- **Issues**: [GitHub Issues](https://github.com/your-org/docker-wol/issues)
- **wake_on_lan Package**: [npm](https://www.npmjs.com/package/wake_on_lan)

## Acknowledgments

Built with:
- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [wake_on_lan](https://www.npmjs.com/package/wake_on_lan) - Wake-on-LAN implementation
- [Vitest](https://vitest.dev/) - Testing framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
