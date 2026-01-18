# Wake-on-LAN API v1.0.0 Release

**Release Date**: January 18, 2026  
**Docker Hub**: `tm99899/wol:1.0.0`  
**GitHub**: `tm1000/docker-wol` - tag `v1.0.0`

---

## 🎉 First Production Release

This is the first production-ready release of the Wake-on-LAN API Container, a lightweight, secure RESTful API for sending Wake-on-LAN magic packets over HTTP.

---

## 📦 Docker Images

All images are available on Docker Hub at `tm99899/wol`:

```bash
# Specific version (recommended for production)
docker pull tm99899/wol:1.0.0

# Minor version (receives patch updates)
docker pull tm99899/wol:1.0

# Major version (receives minor + patch updates)
docker pull tm99899/wol:1

# Latest stable (always up-to-date)
docker pull tm99899/wol:latest
```

**Image Size**: 67MB (compressed), 293MB (uncompressed)  
**Base Image**: Alpine Linux (minimal, secure)

---

## ✨ Features

### Core Functionality
- ✅ RESTful API for Wake-on-LAN packet transmission
- ✅ Multiple MAC address formats supported (colon, hyphen, continuous)
- ✅ Custom broadcast address configuration
- ✅ Custom UDP port configuration
- ✅ Network interface selection
- ✅ Packet redundancy control (`num_packets`: 1-10)
- ✅ Packet timing control (`interval`: 10-1000ms)

### Security & Authentication
- ✅ API key authentication (X-API-Key header)
- ✅ Environment-based configuration
- ✅ Input validation and sanitization
- ✅ Comprehensive error handling

### Operations
- ✅ Health check endpoint for monitoring
- ✅ Structured JSON logging
- ✅ Docker health checks built-in
- ✅ Non-root container execution
- ✅ Graceful shutdown support

### Developer Experience
- ✅ OpenAPI 3.0 specification
- ✅ Complete API documentation
- ✅ TypeScript implementation
- ✅ 77 passing tests (unit + integration)
- ✅ Test coverage reporting
- ✅ Clear error messages with codes

---

## 🚀 Quick Start

### Using Docker Run

```bash
docker run -d \
  --name wol-api \
  --network host \
  -e API_KEY=your-secret-key \
  tm99899/wol:1.0.0
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  wol-api:
    image: tm99899/wol:1.0.0
    network_mode: host
    environment:
      - API_KEY=your-secret-key
      - PORT=3000
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

### Send a Wake-on-LAN Packet

```bash
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{
    "mac": "AA:BB:CC:DD:EE:FF",
    "num_packets": 5,
    "interval": 200
  }'
```

---

## 📊 API Reference

### POST /wake

Send a Wake-on-LAN magic packet to a target device.

**Parameters:**

| Field | Type | Required | Range | Default | Description |
|-------|------|----------|-------|---------|-------------|
| `mac` | string | Yes | - | - | Target MAC address |
| `address` | string | No | IPv4 | `255.255.255.255` | Broadcast address |
| `port` | integer | No | 1-65535 | `9` | UDP port |
| `interface` | string | No | - | auto | Network interface |
| `num_packets` | integer | No | 1-10 | `3` | Number of packets |
| `interval` | integer | No | 10-1000 | `100` | Delay between packets (ms) |

**Success Response (200)**:
```json
{
  "status": "success",
  "message": "Wake-on-LAN packet sent successfully",
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-01-18T00:00:00.000Z"
}
```

**Error Codes**:
- `INVALID_MAC_FORMAT` - MAC address format is invalid
- `INVALID_PORT` - Port number out of range
- `INVALID_ADDRESS` - IP address format is invalid
- `INVALID_NUM_PACKETS` - num_packets out of range (1-10)
- `INVALID_INTERVAL` - interval out of range (10-1000ms)
- `MISSING_MAC` - MAC address not provided
- `UNAUTHORIZED` - Missing or invalid API key
- `WOL_SEND_FAILED` - Failed to send WoL packet

### GET /health

Health check endpoint for monitoring and orchestration.

**Success Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T00:00:00.000Z",
  "uptime": 3600.5
}
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_KEY` | Yes | - | Authentication key for API access |
| `PORT` | No | `3000` | HTTP server port |
| `LOG_LEVEL` | No | `info` | Log level (trace, debug, info, warn, error, fatal) |
| `NODE_ENV` | No | `production` | Node.js environment |

---

## 📋 Use Cases

### Basic Wake (Default Settings)
```bash
# Send 3 packets with 100ms intervals (default)
{"mac": "AA:BB:CC:DD:EE:FF"}
```

### High Reliability (Unreliable Networks)
```bash
# Send 10 packets with 500ms intervals
{"mac": "AA:BB:CC:DD:EE:FF", "num_packets": 10, "interval": 500}
```

### Fast Wake (Responsive Networks)
```bash
# Send 3 packets with 10ms intervals
{"mac": "AA:BB:CC:DD:EE:FF", "interval": 10}
```

### Subnet-Specific Wake
```bash
# Target specific subnet broadcast address
{"mac": "AA:BB:CC:DD:EE:FF", "address": "192.168.50.255"}
```

### Interface-Specific Wake
```bash
# Use specific network interface
{"mac": "AA:BB:CC:DD:EE:FF", "interface": "eth1"}
```

---

## 🧪 Testing

This release includes comprehensive testing:

- **77 total tests** - All passing ✅
- **Unit tests**: 42 tests covering validators, services, utilities
- **Integration tests**: 35 tests covering API endpoints, error handling, authentication
- **Test coverage**: Statements, branches, functions, and lines tracked
- **CI/CD ready**: Tests run in Docker environment

Run tests locally:
```bash
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:integration  # Integration tests only
npm run test:coverage  # With coverage report
```

---

## 📖 Documentation

- **README.md** - Complete usage guide
- **OpenAPI Specification** - `specs/001-wol-api-docker/contracts/openapi.yaml`
- **API Examples** - Included in README
- **Docker Guide** - `docs/docker-publishing.md`
- **Contributing Guide** - `CONTRIBUTING.md`

---

## 🔐 Security

- ✅ Non-root container execution (user `nodejs`, UID 1001)
- ✅ API key authentication required
- ✅ Input validation on all parameters
- ✅ No sensitive data in logs
- ✅ Minimal attack surface (Alpine Linux base)
- ✅ Regular dependency updates
- ✅ TypeScript type safety

---

## 🏗️ Technical Stack

- **Runtime**: Node.js 20 LTS (Alpine)
- **Language**: TypeScript 5.7
- **Framework**: Fastify 5.2
- **WoL Library**: wake_on_lan 1.0.0
- **Testing**: Vitest 2.1
- **Build**: Multi-stage Docker build
- **Size**: 67MB compressed

---

## 📈 Performance

- **Startup time**: < 1 second
- **Memory usage**: ~50MB idle
- **Response time**: < 10ms (typical)
- **Throughput**: 1000+ requests/second
- **Concurrent requests**: Supported via Node.js async I/O

---

## 🔄 Upgrade Path

This is the first release (v1.0.0). Future updates will follow semantic versioning:

- **Patch** (1.0.x) - Bug fixes, security patches
- **Minor** (1.x.0) - New features (backward compatible)
- **Major** (x.0.0) - Breaking changes

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **wake_on_lan** npm package for WoL implementation
- **Fastify** for the high-performance HTTP framework
- **TypeScript** for type safety and developer experience
- **Vitest** for fast, modern testing

---

## 📞 Support

- **Issues**: https://github.com/tm1000/docker-wol/issues
- **Docker Hub**: https://hub.docker.com/r/tm99899/wol
- **Documentation**: https://github.com/tm1000/docker-wol

---

**Released with ❤️ by the docker-wol team**

