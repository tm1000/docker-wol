# Feature Specification: Wake-on-LAN API Container

**Feature Branch**: `001-wol-api-docker`  
**Created**: 2026-01-17  
**Status**: Draft  
**Input**: User description: "Build a simple API that runs from a docker container. Its sole purpose is to run node.js wake_on_lan (https://www.npmjs.com/package/wake_on_lan) therefore this should be written in typescript (node), all options that are allow in https://www.npmjs.com/package/wake_on_lan should be pass through the single API endpoint. The purpose of this project is to have a docker image that can be added to a docker-compose file where this specific image should have network_mode set to host so that other containers in this stack can utilize wake on lan without exposing other containers to the host. We then publish the built docker container to dockerhub & github"

## Clarifications

### Session 2026-01-17

- Q: What HTTP method(s) should the wake endpoint accept? → A: POST only
- Q: What authentication/authorization mechanism should the API use? → A: API key via header
- Q: What is the specific path for the wake endpoint? → A: /wake
- Q: What HTTP port should the API server listen on? → A: 3000
- Q: What is the specific name of the API key header? → A: X-API-Key

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Wake-on-LAN Packet to Network Device (Priority: P1)

A system administrator or application needs to remotely wake up a network device (computer, server, NAS) by sending a Wake-on-LAN magic packet. They run the container with host networking enabled and send an HTTP request with the device's MAC address, and the device powers on.

**Why this priority**: This is the core functionality - without the ability to send WoL packets, the service provides no value. This represents the minimum viable product.

**Independent Test**: Can be fully tested by sending a single HTTP request with a MAC address to the API endpoint and verifying that a network device with WoL enabled powers on. Delivers immediate value as a standalone WoL service.

**Acceptance Scenarios**:

1. **Given** a device with MAC address "AA:BB:CC:DD:EE:FF" is powered off and WoL-enabled, **When** a user sends a wake request with that MAC address, **Then** the device receives the magic packet and powers on
2. **Given** the API is running in a container with host network mode, **When** a user sends a wake request, **Then** the magic packet is broadcast on the host network (not isolated to container network)
3. **Given** a valid MAC address format, **When** a user sends a wake request, **Then** the API responds with success confirmation
4. **Given** an invalid MAC address format, **When** a user sends a wake request, **Then** the API responds with a clear error message

---

### User Story 2 - Configure Wake-on-LAN Options (Priority: P2)

A user needs to specify additional WoL parameters such as custom broadcast address, specific network interface, or port number to accommodate different network configurations or devices with non-standard WoL implementations.

**Why this priority**: While basic WoL works with defaults, some network environments require custom configurations. This extends the service to support more complex scenarios without requiring users to modify container code.

**Independent Test**: Can be tested by sending requests with various option combinations (custom address, port, interface) and verifying packets are sent to the correct destination. Adds flexibility while maintaining the core P1 functionality.

**Acceptance Scenarios**:

1. **Given** a network requires a specific broadcast address, **When** a user sends a wake request with a custom address parameter, **Then** the magic packet is sent to that address
2. **Given** a system has multiple network interfaces, **When** a user specifies an interface parameter, **Then** the magic packet is broadcast on the specified interface
3. **Given** a device uses a non-standard WoL port, **When** a user specifies a custom port parameter, **Then** the magic packet is sent to that port
4. **Given** multiple options are provided together, **When** a user sends a wake request, **Then** all specified options are applied correctly

---

### User Story 3 - Integrate with Docker Compose Stacks (Priority: P1)

A DevOps engineer wants to add Wake-on-LAN capability to their existing Docker Compose application stack without exposing all containers to the host network. They add this container to their compose file, configure it with host networking, and other containers can make HTTP requests to wake network devices.

**Why this priority**: This addresses the specific isolation problem described - allowing containers to use WoL without requiring host network mode on every container. This is the primary architectural value proposition.

**Independent Test**: Can be tested by creating a sample docker-compose.yml with this WoL container (host mode) and another service container (bridge mode), then verifying the service container can successfully wake devices via HTTP requests to the WoL container.

**Acceptance Scenarios**:

1. **Given** a Docker Compose stack with this container and other services, **When** another container sends an HTTP request to the WoL service, **Then** the magic packet is successfully sent on the host network
2. **Given** the WoL container is configured with host network mode in compose file, **When** other containers use standard bridge networking, **Then** only the WoL container has host network access
3. **Given** a service name defined in docker-compose, **When** other containers reference the WoL service by name, **Then** requests are successfully routed to the WoL API

---

### User Story 4 - Deploy Pre-built Container Images (Priority: P2)

A user wants to use the Wake-on-LAN service without building it themselves. They pull a pre-built image from Docker Hub or GitHub Container Registry and run it immediately.

**Why this priority**: Pre-built images lower the barrier to entry and provide a better user experience. Users can get started in seconds rather than minutes. This is standard practice for distributing containerized applications.

**Independent Test**: Can be tested by pulling the published image from the registry and running it without any build steps, then verifying all P1 functionality works correctly.

**Acceptance Scenarios**:

1. **Given** the image is published to Docker Hub, **When** a user runs `docker pull [image-name]`, **Then** the latest image is downloaded successfully
2. **Given** the image is published to GitHub Container Registry, **When** a user runs `docker pull ghcr.io/[org]/[image-name]`, **Then** the latest image is downloaded successfully
3. **Given** a user has pulled the image, **When** they run the container with host networking, **Then** the service starts and accepts WoL requests immediately
4. **Given** new versions are released, **When** images are published, **Then** version tags and 'latest' tag are updated appropriately

---

### Edge Cases

- What happens when a MAC address contains invalid characters or incorrect format (too many/few segments, invalid hex)?
- What happens when the specified network interface doesn't exist on the host?
- What happens when the broadcast address is unreachable or invalid?
- What happens when the API receives malformed JSON or missing required parameters?
- What happens when an API key is missing or invalid in the request?
- What happens when multiple wake requests are sent simultaneously?
- What happens when the container is not running in host network mode (packets won't reach target devices)?
- What happens when a request specifies conflicting options (e.g., both interface and address that don't align)?
- What happens when the port number is outside valid range (1-65535)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept HTTP requests containing a MAC address and send a Wake-on-LAN magic packet to that address
- **FR-002**: System MUST validate MAC address format before attempting to send packets (standard formats: AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, AABBCCDDEEFF)
- **FR-003**: System MUST support all configuration options available in the wake_on_lan npm package (address, port, interface)
- **FR-004**: System MUST provide clear error messages for invalid inputs (malformed MAC address, invalid options)
- **FR-005**: System MUST return success/failure status for each wake request
- **FR-006**: System MUST expose a single HTTP POST endpoint at path `/wake` that accepts wake requests with JSON body containing MAC address and optional parameters
- **FR-007**: System MUST require API key authentication via X-API-Key request header for all wake requests
- **FR-008**: System MUST support API key configuration via environment variable at container startup
- **FR-009**: System MUST reject requests with missing or invalid API keys with HTTP 401 Unauthorized status
- **FR-010**: System MUST run as a containerized service that can be deployed via Docker or Docker Compose
- **FR-011**: System MUST listen on HTTP port 3000 (configurable via environment variable)
- **FR-012**: Container image MUST be published to Docker Hub for public access
- **FR-013**: Container image MUST be published to GitHub Container Registry for public access
- **FR-014**: System MUST function correctly when container network mode is set to "host"
- **FR-015**: System MUST accept requests from other containers in the same Docker Compose stack
- **FR-016**: System MUST handle concurrent requests without blocking or failing
- **FR-017**: System MUST provide health check endpoint for container orchestration
- **FR-018**: Container image MUST include all necessary dependencies (no external installation required)
- **FR-019**: System MUST log wake request attempts with relevant details (MAC address, options, result)

### Key Entities

- **Wake Request**: A command to wake a network device, containing MAC address (mandatory) and optional parameters (broadcast address, port, network interface)
- **Device Identity**: The MAC address of the target device to wake, validated against standard MAC address formats
- **Network Configuration**: Optional settings that control how the magic packet is sent (which interface, which address, which port)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully wake a WoL-enabled device by sending a single HTTP request to the API
- **SC-002**: The container starts and becomes ready to accept requests within 5 seconds of deployment
- **SC-003**: Invalid MAC addresses are rejected with clear error messages before packet transmission attempts
- **SC-004**: The service handles at least 100 concurrent wake requests without failures or timeouts
- **SC-005**: Users can pull and run the pre-built container image in under 30 seconds without build steps
- **SC-006**: Container images are automatically published within 10 minutes of code changes being merged
- **SC-007**: Other containers in a Docker Compose stack can successfully send wake requests without requiring host network mode themselves
- **SC-008**: The service successfully sends magic packets on the host network when container network_mode is set to "host"
