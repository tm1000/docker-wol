# Implementation Tasks: Wake-on-LAN API Container

**Branch**: `001-wol-api-docker` | **Date**: 2026-01-18  
**Tech Stack**: TypeScript, Node.js 24 LTS, Fastify, Vitest, Docker Alpine  
**Testing**: Test-first development per constitution (unit, integration, contract tests)

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)
Focus on **User Story 1 (P1)** first for rapid value delivery:
- Core WoL packet sending functionality
- Basic MAC address validation
- Single endpoint with authentication
- Health check for container orchestration
- Docker containerization

**MVP delivers**: A working, deployable Wake-on-LAN API that satisfies the primary use case.

### Incremental Delivery
After MVP, add features incrementally:
1. **User Story 2 (P2)**: Advanced WoL options (custom address, port, interface)
2. **User Story 3 (P1)**: Docker Compose integration examples and validation
3. **User Story 4 (P2)**: CI/CD and public registry publishing

---

## Task Dependencies & Execution Order

### Dependency Graph (By User Story)

```
Phase 1: Setup (Blocking)
    ↓
Phase 2: Foundational (Blocking)
    ↓
    ├─→ Phase 3: User Story 1 [P1] ← MVP
    │       ↓ (Required for all stories)
    ├─→ Phase 4: User Story 2 [P2] (Independent after US1)
    │
    ├─→ Phase 5: User Story 3 [P1] (Requires US1 complete)
    │
    └─→ Phase 6: User Story 4 [P2] (Requires US1 complete)
            ↓
Phase 7: Polish & Cross-Cutting Concerns
```

### Parallel Execution Opportunities

**Phase 1 (Setup)**: Sequential - project initialization  
**Phase 2 (Foundational)**: Some parallelization:
- T006 [P], T007 [P], T008 [P] can run in parallel (different files)

**Phase 3 (User Story 1)**: High parallelization after tests:
- T010 [P], T011 [P], T012 [P] can run in parallel (validators, config, auth)
- T014 [P], T015 [P] can run in parallel (WoL service, wake route)

**Phase 4 (User Story 2)**: All tasks parallelizable after US1

**Phase 5 (User Story 3)**: Sequential documentation tasks

**Phase 6 (User Story 4)**: CI/CD tasks can run independently

**Phase 7 (Polish)**: Some parallelization possible

---

## Phase 1: Project Setup

**Goal**: Initialize TypeScript project with Fastify, Vitest, and Docker configuration

**Duration Estimate**: 1-2 hours

### Tasks

- [X] T001 Initialize Node.js project with package.json and TypeScript configuration in project root
- [X] T002 Install core dependencies: fastify, wake_on_lan, @fastify/swagger, @fastify/swagger-ui
- [X] T003 Install dev dependencies: typescript, vitest, @types/node, @vitest/coverage-v8, eslint, prettier
- [X] T004 Create tsconfig.json with strict mode and ES2022 target in project root
- [X] T005 Create project structure (src/, tests/, docker/, contracts/ directories) per plan.md

---

## Phase 2: Foundational Infrastructure

**Goal**: Establish shared infrastructure required by all user stories

**Duration Estimate**: 2-3 hours

### Tasks

- [X] T006 [P] Create TypeScript interfaces for WakeRequest, WakeResponse, ErrorResponse, HealthResponse in src/types/index.ts
- [X] T007 [P] Implement configuration loader with environment variable validation in src/config.ts
- [X] T008 [P] Set up Fastify server instance with Pino logging and error handling in src/server.ts
- [X] T009 Create ESLint and Prettier configuration files for TypeScript code quality

---

## Phase 3: User Story 1 - Send Wake-on-LAN Packet to Network Device [P1] 🎯 MVP

**Story Goal**: System administrator sends HTTP request with MAC address, device receives WoL packet and powers on.

**Independent Test Criteria**:
- ✅ Send POST /wake with valid MAC → API returns 200 success
- ✅ Send POST /wake with invalid MAC → API returns 400 with clear error
- ✅ Send POST /wake without X-API-Key → API returns 401 unauthorized
- ✅ Container running with host network → WoL packet reaches physical network
- ✅ Health check endpoint returns 200 with uptime data

**Acceptance**: FR-001, FR-002, FR-005, FR-006, FR-007, FR-009, FR-017 satisfied

**Duration Estimate**: 4-6 hours

### Test Tasks (Test-First Development)

- [X] T010 [P] [US1] Write unit tests for MAC address validator (3 formats, invalid cases) in tests/unit/validators.test.ts
- [X] T011 [P] [US1] Write unit tests for API key authentication middleware in tests/unit/auth.test.ts
- [X] T012 [P] [US1] Write unit tests for configuration validation in tests/unit/config.test.ts
- [X] T013 [US1] Write integration test for POST /wake endpoint (success & error cases) in tests/integration/api.test.ts

### Implementation Tasks

- [X] T014 [P] [US1] Implement MAC address validator with regex validation in src/validators/request.ts
- [X] T015 [P] [US1] Implement Wake-on-LAN service wrapper around wake_on_lan npm package in src/services/wol.ts
- [X] T016 [US1] Implement API key authentication middleware with X-API-Key validation in src/middleware/auth.ts
- [X] T017 [US1] Implement POST /wake route handler with validation and WoL service call in src/routes/wake.ts
- [X] T018 [US1] Implement GET /health endpoint returning status, uptime, timestamp in src/routes/wake.ts
- [X] T019 [US1] Register routes and middleware with Fastify server in src/server.ts
- [X] T020 [US1] Add structured logging for wake requests (MAC, options, result) using Pino in src/routes/wake.ts

### Validation Tasks

- [X] T021 [US1] Run unit tests and verify 80%+ coverage with Vitest
- [X] T022 [US1] Run integration tests and verify all acceptance scenarios pass
- [X] T023 [US1] Test API manually with curl: valid MAC, invalid MAC, missing API key

---

## Phase 4: User Story 2 - Configure Wake-on-LAN Options [P2]

**Story Goal**: Users can specify custom broadcast address, port, and network interface for advanced network configurations.

**Independent Test Criteria**:
- ✅ Send POST /wake with custom address → Packet sent to specified address
- ✅ Send POST /wake with custom port → Packet sent to specified port
- ✅ Send POST /wake with interface → Packet sent via specified interface
- ✅ Send POST /wake with multiple options → All options applied correctly
- ✅ Send POST /wake with invalid port → API returns 400 with error

**Acceptance**: FR-003, FR-004 satisfied

**Duration Estimate**: 2-3 hours

### Test Tasks

- [X] T024 [P] [US2] Write unit tests for port validation (1-65535 range) in tests/unit/validators.test.ts
- [X] T025 [P] [US2] Write unit tests for IP address format validation in tests/unit/validators.test.ts
- [X] T026 [US2] Write integration tests for custom options (address, port, interface) in tests/integration/api.test.ts

### Implementation Tasks

- [X] T027 [P] [US2] Add port number validation to request validator in src/validators/request.ts
- [X] T028 [P] [US2] Add IPv4 address validation to request validator in src/validators/request.ts
- [X] T029 [P] [US2] Add network interface validation to request validator in src/validators/request.ts
- [X] T030 [US2] Update WoL service to support optional address, port, interface parameters in src/services/wol.ts
- [X] T031 [US2] Update POST /wake handler to pass options to WoL service in src/routes/wake.ts

### Validation Tasks

- [X] T032 [US2] Test custom broadcast address with curl
- [X] T033 [US2] Test custom port number with curl
- [X] T034 [US2] Test specific network interface with curl
- [X] T035 [US2] Test multiple options combined with curl

---

## Phase 5: User Story 3 - Integrate with Docker Compose Stacks [P1]

**Story Goal**: DevOps engineers add WoL container to Docker Compose, other containers can wake devices without host networking.

**Independent Test Criteria**:
- ✅ Create docker-compose.yml with WoL API (host mode) and test service (bridge mode)
- ✅ Test service sends request to WoL API via localhost:3000
- ✅ WoL API successfully sends packet to physical network
- ✅ Health check works from other containers

**Acceptance**: FR-010, FR-014, FR-015 satisfied, SC-007 achieved

**Duration Estimate**: 2-3 hours

### Implementation Tasks

- [X] T036 [US3] Create Dockerfile with multi-stage build using node:24-alpine in docker/Dockerfile
- [X] T037 [US3] Add HEALTHCHECK directive to Dockerfile using curl /health
- [X] T038 [US3] Create example docker-compose.yml with WoL API (host network) in docker/docker-compose.example.yml
- [X] T039 [US3] Add test service to docker-compose.yml demonstrating bridge network communication
- [X] T040 [US3] Document environment variables (API_KEY, PORT, LOG_LEVEL, NODE_ENV) in docker-compose.yml comments

### Validation Tasks

- [X] T041 [US3] Build Docker image locally and verify size <100MB
- [X] T042 [US3] Run container with host networking and verify WoL functionality
- [X] T043 [US3] Test docker-compose.yml with both services and verify inter-container communication
- [X] T044 [US3] Verify container startup time <5 seconds (SC-002)

---

## Phase 6: User Story 4 - Deploy Pre-built Container Images [P2]

**Story Goal**: Users pull pre-built images from Docker Hub and GitHub Container Registry and run immediately.

**Independent Test Criteria**:
- ✅ GitHub Actions workflow builds on main branch push
- ✅ Image pushed to Docker Hub with latest and version tags
- ✅ Image pushed to GitHub Container Registry with latest and version tags
- ✅ Fresh pull and run completes in <30 seconds (SC-005)
- ✅ Automated publishing completes in <10 minutes (SC-006)

**Acceptance**: FR-012, FR-013, FR-018 satisfied, SC-005, SC-006 achieved

**Duration Estimate**: 2-4 hours

### Implementation Tasks

- [X] T045 [US4] Create GitHub Actions workflow for Docker build and push in .github/workflows/docker-publish.yml
- [X] T046 [US4] Configure workflow to build multi-platform images (linux/amd64, linux/arm64)
- [X] T047 [US4] Add Docker Hub authentication and push step to workflow
- [X] T048 [US4] Add GitHub Container Registry authentication and push step to workflow
- [X] T049 [US4] Configure semantic versioning tags (latest, v1.0.0, commit SHA) in workflow
- [X] T050 [US4] Add workflow trigger for main branch push and tag creation

### Validation Tasks

- [X] T051 [US4] Create test tag and verify workflow runs successfully
- [X] T052 [US4] Pull image from Docker Hub and verify functionality
- [X] T053 [US4] Pull image from GHCR and verify functionality
- [X] T054 [US4] Measure and document image pull and startup time

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: API documentation, OpenAPI compliance, README, and final quality checks

**Duration Estimate**: 3-4 hours

### Tasks

- [X] T055 [P] Write contract tests validating OpenAPI spec compliance in tests/contract/openapi.test.ts
- [X] T056 [P] Create comprehensive README.md with quickstart, API examples, Docker instructions in project root
- [X] T057 [P] Add .dockerignore file excluding node_modules, tests, specs in project root
- [X] T058 [P] Add .gitignore file for Node.js, TypeScript, Docker artifacts in project root
- [X] T059 Configure Fastify Swagger plugin to serve OpenAPI spec at /documentation in src/server.ts
- [X] T060 Add Swagger UI for interactive API testing at /docs in src/server.ts
- [X] T061 Create CONTRIBUTING.md with development setup and testing guide in project root
- [X] T062 Create LICENSE file (MIT as per OpenAPI spec) in project root
- [X] T063 Run full test suite and verify 80%+ coverage across all stories
- [X] T064 Run ESLint and Prettier on all TypeScript files
- [X] T065 Perform load test with 100 concurrent requests (SC-004 validation)
- [X] T066 Update quickstart.md with actual Docker Hub and GHCR image names
- [X] T067 Final review: verify all FRs (FR-001 to FR-019) and SCs (SC-001 to SC-008) met

---

## Task Summary

### Total Task Count: 67 tasks

**By Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (User Story 1 - MVP): 14 tasks
- Phase 4 (User Story 2): 12 tasks
- Phase 5 (User Story 3): 9 tasks
- Phase 6 (User Story 4): 10 tasks
- Phase 7 (Polish): 13 tasks

**By User Story**:
- User Story 1 [P1]: 14 tasks (MVP scope)
- User Story 2 [P2]: 12 tasks
- User Story 3 [P1]: 9 tasks
- User Story 4 [P2]: 10 tasks
- Setup/Infrastructure: 9 tasks
- Polish/Cross-cutting: 13 tasks

**Test Tasks**: 13 tasks (unit, integration, contract)  
**Parallelizable Tasks**: 18 tasks marked [P]

### Parallel Execution Examples

**Phase 2 Parallelization** (After T005):
```bash
# Parallel execution of foundational tasks
Terminal 1: T006 - Create TypeScript interfaces
Terminal 2: T007 - Implement config loader
Terminal 3: T008 - Set up Fastify server
```

**Phase 3 (User Story 1) Parallelization** (After tests T010-T013):
```bash
# Parallel implementation tasks
Terminal 1: T014 - MAC validator
Terminal 2: T015 - WoL service
Terminal 3: T016 - Auth middleware
# Then after these complete:
Terminal 1: T017 - Wake route handler
Terminal 2: T018 - Health endpoint
```

**Phase 4 (User Story 2) Parallelization** (After US1):
```bash
# Parallel test writing
Terminal 1: T024 - Port validation tests
Terminal 2: T025 - IP validation tests
# Then parallel implementation:
Terminal 1: T027 - Port validator
Terminal 2: T028 - IP validator
Terminal 3: T029 - Interface validator
```

**Phase 7 Parallelization**:
```bash
# Parallel documentation
Terminal 1: T055 - Contract tests
Terminal 2: T056 - README
Terminal 3: T057 - .dockerignore
Terminal 4: T058 - .gitignore
```

---

## Independent Testing per User Story

### User Story 1 Testing (MVP)
```bash
# Unit tests
npm test tests/unit/validators.test.ts
npm test tests/unit/auth.test.ts
npm test tests/unit/config.test.ts

# Integration tests
npm test tests/integration/api.test.ts

# Manual validation
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF"}'

curl http://localhost:3000/health
```

### User Story 2 Testing
```bash
# Unit tests for options
npm test tests/unit/validators.test.ts -- --grep "port|address|interface"

# Integration tests with options
npm test tests/integration/api.test.ts -- --grep "custom options"

# Manual validation
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF", "address": "192.168.1.255", "port": 9}'
```

### User Story 3 Testing
```bash
# Docker build and test
docker build -t wol-api:test -f docker/Dockerfile .
docker run -d --name wol-test --network host -e API_KEY=test wol-api:test

# Docker Compose test
docker-compose -f docker/docker-compose.example.yml up -d
docker-compose -f docker/docker-compose.example.yml exec test-service curl http://localhost:3000/health
```

### User Story 4 Testing
```bash
# Pull from registries (after CI/CD setup)
docker pull <dockerhub-username>/wake-on-lan-api:latest
docker pull ghcr.io/<org>/wake-on-lan-api:latest

# Verify quick start
time docker run -d --network host -e API_KEY=test <image>
# Should complete in <30 seconds
```

---

## Success Criteria Validation Checklist

Map tasks to success criteria from spec.md:

- [ ] **SC-001**: Wake WoL-enabled device → T017, T022, T023
- [ ] **SC-002**: Container ready in <5s → T036, T037, T044
- [ ] **SC-003**: Invalid MAC rejected → T014, T021, T023
- [ ] **SC-004**: 100 concurrent requests → T065
- [ ] **SC-005**: Pull and run in <30s → T052, T053, T054
- [ ] **SC-006**: Auto-publish in <10min → T045-T051
- [ ] **SC-007**: Docker Compose integration → T038, T039, T043
- [ ] **SC-008**: Host network WoL packets → T042

---

## Functional Requirements Coverage

Verify all 19 functional requirements are addressed:

- **FR-001**: Send WoL packet → T015, T017
- **FR-002**: Validate MAC format → T014
- **FR-003**: Support all WoL options → T030
- **FR-004**: Clear error messages → T014, T017, T027-T029
- **FR-005**: Return success/failure → T017
- **FR-006**: POST /wake endpoint → T017
- **FR-007**: API key auth required → T016
- **FR-008**: API key from env var → T007
- **FR-009**: Reject invalid API key → T016, T021
- **FR-010**: Containerized service → T036
- **FR-011**: Listen on port 3000 → T007, T008
- **FR-012**: Docker Hub publish → T047
- **FR-013**: GHCR publish → T048
- **FR-014**: Host network mode → T036, T042
- **FR-015**: Accept compose requests → T038, T043
- **FR-016**: Handle concurrent requests → T008, T065
- **FR-017**: Health check endpoint → T018
- **FR-018**: Include all dependencies → T036
- **FR-019**: Log wake requests → T020

---

## Development Workflow

### Test-First Development (Per Constitution)

For each user story:
1. **Write failing tests first** (unit → integration → contract)
2. **Run tests** - verify they fail (red phase)
3. **Implement minimum code** to pass tests (green phase)
4. **Refactor** while keeping tests green
5. **Verify coverage** meets 80% threshold

### Example: User Story 1 Workflow

```bash
# Step 1: Write tests (T010-T013)
npm test tests/unit/validators.test.ts  # Should fail - no validator yet

# Step 2: Implement validators (T014)
# Code in src/validators/request.ts

# Step 3: Re-run tests
npm test tests/unit/validators.test.ts  # Should pass

# Step 4: Continue pattern for auth, service, routes
# Always test first, then implement

# Step 5: Verify coverage
npm run coverage
# Ensure validators.ts, auth.ts, wol.ts all >80% coverage
```

---

## Estimated Timeline

**Aggressive (Experienced Developer)**: 2-3 days full-time
- Day 1: Setup + User Story 1 (MVP)
- Day 2: User Story 2 + User Story 3
- Day 3: User Story 4 + Polish

**Moderate (Standard Pace)**: 4-5 days full-time
- Day 1: Setup + Foundational
- Day 2: User Story 1 (MVP with tests)
- Day 3: User Story 2 + User Story 3
- Day 4: User Story 4 (CI/CD)
- Day 5: Polish, documentation, final testing

**Conservative (Learning/Careful)**: 6-8 days full-time
- Day 1-2: Setup, foundational, learning tech stack
- Day 3-4: User Story 1 with comprehensive testing
- Day 5: User Story 2
- Day 6: User Story 3
- Day 7: User Story 4
- Day 8: Polish and validation

---

## Notes

- **MVP First**: Focus on User Story 1 for fastest time-to-value
- **Test Coverage**: Aim for 80%+ on business logic (validators, services, routes)
- **Parallel Opportunities**: 18 tasks marked [P] can be parallelized
- **Independent Stories**: US2, US3, US4 can be developed in any order after US1
- **Docker Optimization**: Use multi-stage builds to minimize final image size
- **Security**: Never commit API_KEY values, use environment variables or secrets
- **Performance**: Fastify handles concurrency well, but test with realistic load (T065)

---

**Ready for implementation!** Start with Phase 1 (Setup) and follow test-first development workflow.
