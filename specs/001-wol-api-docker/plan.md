# Implementation Plan: Wake-on-LAN API Container

**Branch**: `001-wol-api-docker` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-wol-api-docker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a containerized HTTP API service in TypeScript/Node.js that provides Wake-on-LAN functionality to other containers in a Docker Compose stack. The service accepts POST requests with MAC addresses and optional network parameters, validates inputs, and sends WoL magic packets via the wake_on_lan npm package. The container runs with host networking to access the physical network while other containers remain isolated. Pre-built images will be published to Docker Hub and GitHub Container Registry for easy deployment.

## Technical Context

**Language/Version**: TypeScript with Node.js 24 LTS (Krypton)
**Primary Dependencies**: wake_on_lan npm package, Fastify (HTTP framework), Pino (logging)
**Storage**: N/A (stateless service)
**Testing**: Vitest (native TypeScript support, Jest-compatible API)
**Target Platform**: Docker containers (Alpine Linux, host networking mode)
**Project Type**: Single project (API microservice)
**Performance Goals**: <3s latency from request to packet transmission, <200ms API response time p95
**Constraints**: <100MB memory footprint, <10s container startup time, <5s ready state
**Scale/Scope**: Single endpoint (/wake), 100+ concurrent requests support, minimal API surface

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Phase 0) ✅

### Code Quality Gate
- ✅ Single Responsibility: Each module focused (API handler, validator, WoL sender)
- ✅ DRY: Minimal codebase given single-purpose service
- ✅ Error handling: Required per FR-004 (clear error messages)
- ✅ Linting/formatting: Will configure ESLint + Prettier for TypeScript

### Testing Gate
- ✅ Test-first required per constitution
- ✅ 80% coverage achievable (limited surface area)
- ✅ Unit tests: Validator, request handler logic
- ✅ Integration tests: HTTP endpoint to WoL packet transmission
- ✅ Contract tests: OpenAPI compliance for POST /wake

### Performance Gate
- ✅ API response <200ms p95: Achievable (minimal processing)
- ✅ Memory <100MB: Likely under 50MB (Node.js + minimal dependencies)
- ✅ Container startup <10s: Target <5s per SC-002
- ✅ WoL latency <3s: Should be <1s (direct UDP packet)

### Documentation Gate
- ✅ User-facing docs: README, quickstart.md, example docker-compose.yml
- ✅ API contract: OpenAPI spec in contracts/
- ✅ Setup documentation: Environment variables, deployment

**Status**: ✅ PASS - No constitutional violations. Simple scope aligns well with quality standards.

---

### Post-Phase 1 Design Check ✅

### Code Quality Validation
- ✅ **Single Responsibility**: Architecture confirms clean separation (routes → middleware → services → validators)
- ✅ **DRY**: Shared validation logic, error handling, and configuration centralized
- ✅ **Error Handling**: Comprehensive error codes defined (9 error types), consistent response format
- ✅ **Quality Tooling**: ESLint + Prettier configuration planned in TypeScript setup

### Testing Validation
- ✅ **Test Framework**: Vitest selected with native TypeScript support
- ✅ **Test Coverage**: All paths testable (2 endpoints, clear validation logic)
- ✅ **Unit Tests**: Validators (MAC, port, address), middleware (auth), services (WoL wrapper)
- ✅ **Integration Tests**: End-to-end API request → WoL packet flow
- ✅ **Contract Tests**: OpenAPI spec created (`contracts/openapi.yaml`), validates all request/response schemas

### Performance Validation
- ✅ **Framework Choice**: Fastify selected for high performance (4-8x faster than Express)
- ✅ **Response Time**: Minimal processing overhead, async/await throughout, Fastify's speed meets <200ms p95
- ✅ **Memory**: Alpine base image + Node.js 24 + minimal deps should stay under 50MB runtime
- ✅ **Startup Time**: No database connections, minimal initialization, expect <5s
- ✅ **WoL Latency**: Direct UDP send via wake_on_lan package, expect <500ms

### Documentation Validation
- ✅ **User Documentation**: `quickstart.md` created with examples, troubleshooting, Docker Compose setup
- ✅ **API Contract**: `contracts/openapi.yaml` complete with all endpoints, schemas, examples
- ✅ **Data Model**: `data-model.md` documents all entities, validation rules, state flows
- ✅ **Research Docs**: `research.md` captures all technical decisions with rationale
- ✅ **Setup Guide**: Environment variables, configuration options documented in quickstart

### Additional Observations
- ✅ **Architecture Simplicity**: Stateless design eliminates database complexity
- ✅ **Type Safety**: TypeScript throughout with JSON Schema validation alignment
- ✅ **Security**: API key authentication, input validation, fail-fast configuration
- ✅ **Observability**: Structured logging with Pino, request correlation, detailed error messages
- ✅ **Containerization**: Multi-stage build planned, Alpine base, health checks defined

**Final Status**: ✅✅ PASS - Design phase confirms all constitutional requirements are met. Architecture is clean, well-documented, performant, and testable. No violations or concerns identified.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── server.ts           # HTTP server setup and startup
├── routes/
│   └── wake.ts        # POST /wake endpoint handler
├── middleware/
│   └── auth.ts        # X-API-Key authentication
├── services/
│   └── wol.ts         # Wake-on-LAN service (wraps wake_on_lan npm)
├── validators/
│   └── request.ts     # MAC address and options validation
├── types/
│   └── index.ts       # TypeScript interfaces for requests/responses
└── config.ts          # Environment variable configuration

tests/
├── unit/
│   ├── validators.test.ts
│   ├── auth.test.ts
│   └── wol.test.ts
├── integration/
│   └── api.test.ts    # End-to-end API tests
└── contract/
    └── openapi.test.ts # OpenAPI spec compliance

docker/
├── Dockerfile
└── docker-compose.example.yml

contracts/
└── openapi.yaml       # API specification
```

**Structure Decision**: Single project layout chosen. This is a focused microservice with a single endpoint, minimal dependencies, and no separate frontend. All code exists in `src/` with clear separation of concerns: routing, middleware, business logic, and validation. TypeScript provides type safety throughout.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations identified.** This feature maintains constitutional compliance throughout:
- Simple, focused microservice architecture
- Clean separation of concerns
- Comprehensive testing approach
- Well-documented with clear contracts
- Performance requirements easily achievable

---

## Phase 0: Research Summary ✅

**Status**: Complete  
**Artifact**: `research.md`

### Key Decisions Made

1. **HTTP Framework**: Fastify - native TypeScript, 4-8x faster than Express
2. **Testing**: Vitest - native TypeScript, Jest-compatible API
3. **Node.js Version**: 24 LTS (Krypton) - active LTS through 2028
4. **Base Image**: node:24-alpine - minimal size, security-focused
5. **Validation**: JSON Schema via Fastify - performance, OpenAPI alignment
6. **Logging**: Pino - built into Fastify, structured JSON logging
7. **Documentation**: OpenAPI 3.1 with Swagger UI integration

### Research Coverage

- ✅ All "NEEDS CLARIFICATION" items resolved
- ✅ Technology stack finalized
- ✅ Best practices identified for each component
- ✅ Alternatives evaluated with rationale
- ✅ Performance implications assessed

---

## Phase 1: Design & Contracts Summary ✅

**Status**: Complete  
**Artifacts**: 
- `data-model.md` - Entity schemas and validation rules
- `contracts/openapi.yaml` - API specification
- `quickstart.md` - User documentation
- `.github/agents/copilot-instructions.md` - Updated agent context

### Design Deliverables

1. **Data Model** (`data-model.md`):
   - WakeRequest entity with JSON Schema
   - WakeResponse and ErrorResponse schemas
   - Health check entity
   - 9 error codes with clear semantics
   - State transition diagram
   - Relationship diagrams

2. **API Contract** (`contracts/openapi.yaml`):
   - OpenAPI 3.1 specification
   - 2 endpoints: POST /wake, GET /health
   - Request/response schemas with examples
   - Security scheme (ApiKeyAuth)
   - Comprehensive error examples
   - Ready for contract testing

3. **User Guide** (`quickstart.md`):
   - 5-minute quick start
   - Docker and Docker Compose examples
   - API usage with curl examples
   - Troubleshooting guide
   - Security best practices
   - Configuration reference

4. **Agent Context** (`.github/agents/copilot-instructions.md`):
   - Technology stack documented
   - Framework preferences captured
   - Project structure guidance

### Design Validation

- ✅ Entities extracted from feature spec (FR-001 to FR-019)
- ✅ All user stories mapped to endpoints
- ✅ Validation rules enforce functional requirements
- ✅ Error handling covers all edge cases
- ✅ OpenAPI spec aligns with data model
- ✅ Constitutional gates re-validated (all pass)

---

## Phase 2: Task Planning (Next Step)

**Command**: `/speckit.tasks`

Phase 1 planning complete. Next phase will generate:
- `tasks.md` - Prioritized implementation tasks
- Test-first workflow with task dependencies
- Task acceptance criteria from user stories

**Estimated Tasks**:
1. Project setup (TypeScript, Fastify, Vitest)
2. Configuration and environment validation
3. Authentication middleware
4. Request validation
5. WoL service implementation
6. Route handlers
7. Error handling
8. Logging integration
9. Health check endpoint
10. Docker containerization
11. CI/CD pipeline (Docker Hub + GHCR)
12. Documentation finalization

---

## Summary

**Planning Phase Complete** ✅

| Phase | Status | Key Outputs |
|-------|--------|-------------|
| Phase 0: Research | ✅ Complete | research.md - 10 technical decisions |
| Phase 1: Design | ✅ Complete | data-model.md, openapi.yaml, quickstart.md |
| Constitution Check | ✅ Pass | No violations, all gates green |
| Agent Context | ✅ Updated | Copilot instructions synchronized |

**Ready for**: Task generation and test-first implementation workflow.
