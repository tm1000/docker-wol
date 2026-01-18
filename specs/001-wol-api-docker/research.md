# Research & Technical Decisions

**Feature**: Wake-on-LAN API Container  
**Branch**: `001-wol-api-docker`  
**Date**: 2026-01-17

## Overview

This document captures research findings and technical decisions made during Phase 0 of implementation planning. Each decision includes rationale and alternatives considered.

---

## 1. HTTP Framework Selection

### Decision
**Fastify** - Modern, high-performance HTTP framework with native TypeScript support

### Rationale
- **Performance**: 4-8x faster than Express (up to 76,000 RPS vs ~10,000 RPS), handles concurrent requests efficiently
- **TypeScript First**: Native TypeScript support without additional transformers, excellent type inference
- **Built-in Features**: JSON Schema validation, async error handling, structured logging (Pino), plugin system
- **Modern API**: Async/await by default, clear lifecycle hooks, familiar Express-like syntax
- **Meets Requirements**: Easily achieves <200ms p95 response time, supports concurrent requests (FR-016)
- **Developer Experience**: Strong documentation, growing ecosystem, smaller learning curve than alternatives

### Alternatives Considered
- **Express**: Most popular but slower, requires extra TypeScript setup, less efficient for high concurrency
- **Koa**: Minimal and modern but too bare-bones (no routing/parsing out of box), requires more manual assembly
- **Node HTTP**: No framework overhead but would require building validation, routing, error handling from scratch

### References
- [Fastify vs Express Comparison (BetterStack)](https://betterstack.com/community/guides/scaling-nodejs/fastify-express/)
- [Best TypeScript Backend Frameworks 2026 (Encore.dev)](https://encore.dev/articles/best-typescript-backend-frameworks)

---

## 2. Testing Framework Selection

### Decision
**Vitest** - Modern test framework with native TypeScript support

### Rationale
- **Native TypeScript**: Zero configuration needed, no transformers required unlike Jest (ts-jest)
- **Performance**: Exceptionally fast with Worker threads, hot module reloading, built-in watch mode
- **Jest Compatible**: Same `describe/it/expect` API, easy migration path if needed
- **Complete Feature Set**: Snapshots, code coverage, mocking, parallel execution out of the box
- **Modern Tooling**: Built for modern TypeScript projects, excellent DX
- **Meets Requirements**: Supports all three test layers (unit, integration, contract), enables 80% coverage goal

### Alternatives Considered
- **Jest**: Most popular but requires ts-jest transformer, heavier startup time, more configuration overhead
- **Node Test Runner**: Zero dependencies, built-in to Node.js, but lacks snapshot testing and advanced features
- **Mocha/Chai**: Mature but requires multiple packages, less integrated experience

### References
- [Node.js Testing Libraries Comparison (BetterStack)](https://betterstack.com/community/guides/testing/best-node-testing-libraries/)
- [TypeScript Unit Testing Frameworks (Capicua)](https://www.capicua.com/blog/typescript-unit-testing-frameworks)

---

## 3. Node.js Version Selection

### Decision
**Node.js 24 LTS (Krypton)** - Current Active LTS version as of 2026

### Rationale
- **Active LTS**: Entered LTS in October 2025, receives full support and security patches
- **Long-term Stability**: Security support through 2028, suitable for production deployments
- **Ecosystem Compatibility**: Best supported by TypeScript compiler and modern tooling
- **Future-proof**: Most recent LTS ensures longest support window for this project
- **Docker Base Images**: Official Node.js Docker images available for v24 LTS

### Alternatives Considered
- **Node.js 22**: In Maintenance LTS, approaching end-of-life (October 2026), not recommended for new projects
- **Node.js 20**: Near EOL (April 2026), unsuitable for production
- **Node.js Current**: Cutting-edge but unstable, no LTS guarantees

### References
- [Node.js Releases (Official)](https://nodejs.org/en/about/previous-releases)
- [Node.js End-of-Life Schedule](https://endoflife.date/nodejs)

---

## 4. Docker Base Image Strategy

### Decision
**Alpine Linux** variant of official Node.js image (`node:24-alpine`)

### Rationale
- **Image Size**: Significantly smaller (~40MB base vs ~350MB Debian), faster pulls and deployments
- **Security**: Minimal attack surface with fewer packages and dependencies
- **Performance**: Lower memory footprint aligns with <100MB constraint (FR-011)
- **Official Support**: Maintained by Node.js Docker team, receives security updates
- **Production Ready**: Widely used in production, stable and well-tested

### Alternatives Considered
- **Debian Slim**: Larger image (~150MB) but more compatible with native dependencies (not needed here)
- **Distroless**: Ultra-minimal but harder to debug, unnecessary for simple API service
- **Ubuntu**: Full-featured but too large for microservice use case

---

## 5. Container Registry Strategy

### Decision
**Dual Publishing** to Docker Hub and GitHub Container Registry (GHCR)

### Rationale
- **Requirement**: FR-012 and FR-013 explicitly require both registries
- **Docker Hub**: Wider reach, default for `docker pull`, better discovery
- **GitHub Container Registry**: Tight integration with repo, free for public images, better CI/CD integration
- **Redundancy**: Multiple sources increase availability
- **GitHub Actions**: Single workflow can push to both registries efficiently

### Implementation Approach
- Use GitHub Actions for automated builds on main branch merges
- Tag strategy: `latest`, semantic versions (e.g., `1.0.0`), commit SHA
- Multi-platform builds: linux/amd64, linux/arm64 for broad compatibility

---

## 6. Input Validation Strategy

### Decision
**JSON Schema** validation using Fastify's built-in validator

### Rationale
- **Native Integration**: Fastify provides first-class JSON Schema support
- **Performance**: Schema validation is compiled and cached for speed
- **OpenAPI Alignment**: JSON Schemas can generate OpenAPI specs automatically
- **Type Safety**: Fastify can infer TypeScript types from schemas
- **Standards-Based**: JSON Schema is industry standard, well-documented

### Schema Structure
```json
{
  "type": "object",
  "required": ["mac"],
  "properties": {
    "mac": {
      "type": "string",
      "pattern": "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    },
    "address": { "type": "string", "format": "ipv4" },
    "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
    "interface": { "type": "string" }
  }
}
```

### Alternatives Considered
- **Zod**: Popular TypeScript-first validator but adds dependency, Fastify schema is sufficient
- **Joi**: Older validation library, less TypeScript-friendly than JSON Schema
- **Manual validation**: Error-prone, doesn't leverage Fastify's capabilities

---

## 7. Logging Strategy

### Decision
**Pino** logger (built into Fastify)

### Rationale
- **Performance**: Extremely fast JSON logging, minimal overhead
- **Fastify Integration**: Default logger in Fastify, zero configuration
- **Structured Logging**: JSON output suitable for log aggregation (CloudWatch, Datadog, etc.)
- **Log Levels**: Supports standard levels (trace, debug, info, warn, error, fatal)
- **Request Correlation**: Automatic request ID tracking for tracing
- **Meets Requirement**: FR-019 requires logging of MAC address, options, and result

### Log Format Example
```json
{
  "level": 30,
  "time": 1705456789123,
  "pid": 1234,
  "hostname": "wol-api",
  "reqId": "req-abc123",
  "mac": "AA:BB:CC:DD:EE:FF",
  "options": { "address": "192.168.1.255" },
  "result": "success",
  "msg": "Wake-on-LAN packet sent"
}
```

---

## 8. Environment Variable Management

### Decision
**Direct process.env** access with validation at startup

### Rationale
- **Simplicity**: No additional dependencies needed for simple configuration
- **Container-Native**: Environment variables are standard Docker configuration method
- **Type Safety**: Create typed config object validated on startup
- **Fail-Fast**: Validation errors prevent container from starting with invalid config

### Required Environment Variables
- `API_KEY` (required): X-API-Key value for authentication
- `PORT` (optional, default: 3000): HTTP server port
- `LOG_LEVEL` (optional, default: info): Pino log level
- `NODE_ENV` (optional, default: production): Environment identifier

### Alternatives Considered
- **dotenv**: Unnecessary in Docker environment, adds dependency
- **config packages**: Overkill for 4 simple environment variables

---

## 9. Health Check Endpoint Design

### Decision
**GET /health** endpoint with simple JSON response

### Rationale
- **Requirement**: FR-017 requires health check endpoint for orchestration
- **Docker Integration**: Supports HEALTHCHECK directive in Dockerfile
- **Kubernetes Ready**: Compatible with liveness/readiness probes
- **Minimal Overhead**: Unauthenticated, fast response
- **Standard Pattern**: Industry standard for container health checks

### Response Format
```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2026-01-17T10:30:00Z"
}
```

---

## 10. API Documentation Strategy

### Decision
**OpenAPI 3.1** specification with Swagger UI integration

### Rationale
- **Standards-Based**: OpenAPI is industry standard for REST API documentation
- **Fastify Integration**: `@fastify/swagger` plugin generates OpenAPI from route schemas
- **Interactive Docs**: Swagger UI provides interactive API testing interface
- **Client Generation**: OpenAPI spec enables auto-generation of client libraries
- **Contract Testing**: Spec serves as source of truth for contract tests

### Alternatives Considered
- **Manual Documentation**: Error-prone, becomes outdated quickly
- **GraphQL Schema**: Not applicable for REST API design
- **API Blueprint**: Less popular than OpenAPI, fewer tools

---

## Summary of Key Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| HTTP Framework | Fastify | Performance, native TypeScript, built-in validation |
| Testing | Vitest | Native TS, fast, Jest-compatible API |
| Node.js Version | 24 LTS | Active LTS, long-term support through 2028 |
| Base Image | node:24-alpine | Small size, security, meets memory constraints |
| Registries | Docker Hub + GHCR | Meets requirements, broad availability |
| Validation | JSON Schema (Fastify) | Native integration, performance, OpenAPI alignment |
| Logging | Pino | Fast, structured, built into Fastify |
| Config | Environment Variables | Simple, container-native, fail-fast validation |
| Health Check | GET /health | Standard pattern, Docker/K8s compatible |
| API Docs | OpenAPI 3.1 | Industry standard, tooling support, contract tests |

---

## Next Steps

With research complete, proceed to **Phase 1: Design & Contracts**:
1. Generate `data-model.md` from entities in feature spec
2. Create OpenAPI contract in `contracts/openapi.yaml`
3. Generate `quickstart.md` with setup and usage instructions
4. Update agent context with technology stack decisions
