# HealthPulse Telemetry Service (Java 27 & Cloud-Native)

High-performance, event-driven telemetry ingestion service built on **Java 27** and **Spring Boot 3.4+** utilizing **Virtual Threads (Project Loom)**, **Sealed Class Hierarchies**, and **Pattern Matching with Records**.

---

## Key Architectural Modernizations

1. **Virtual Threads Enabled:**
   - Configured in `application.yml` via `spring.threads.virtual.enabled: true`.
   - Replaces heavy platform OS thread pools with lightweight M:N virtual threads, allowing concurrent handling of tens of thousands of simultaneous telemetry sensor streams.

2. **Domain Modeling:**
   - [VitalMetric.java](file:///d:/Hackathon/6th%20Sem%20Project/telemetry_service/src/main/java/com/healthpulse/telemetry/domain/VitalMetric.java): Compact immutable record with built-in validation and normalizations.
   - [HealthTelemetryEvent.java](file:///d:/Hackathon/6th%20Sem%20Project/telemetry_service/src/main/java/com/healthpulse/telemetry/domain/HealthTelemetryEvent.java): Sealed interface permitting exhaustive polymorphic events (`HeartRateEvent`, `SpO2Event`, `TemperatureEvent`, `CriticalAlertEvent`).

3. **Pattern Matching & Guards:**
   - [TelemetryProcessingService.java](file:///d:/Hackathon/6th%20Sem%20Project/telemetry_service/src/main/java/com/healthpulse/telemetry/service/TelemetryProcessingService.java): Employs `switch (event)` with record deconstruction and `when` guards for instant triage of anomalies.

---

## Local Development & Build

### Requirements
- JDK 27
- Maven 3.9+ (or `./mvnw`)

### Build & Test
```bash
mvn clean verify
```

### Run Locally
```bash
mvn spring-boot:run
```
Service runs on port `8085`.

---

## Docker & Container Execution

Build and run using the multi-stage, non-root Dockerfile:

```bash
docker build -t healthpulse/telemetry-service:latest .
docker run -p 8085:8085 --rm healthpulse/telemetry-service:latest
```

---

## Endpoints

- **Polymorphic Event Ingestion:** `POST /api/v1/telemetry/event`
- **Batch Metric Ingestion (Virtual Thread Async):** `POST /api/v1/telemetry/batch`
- **Health Probes:** `GET /actuator/health`
