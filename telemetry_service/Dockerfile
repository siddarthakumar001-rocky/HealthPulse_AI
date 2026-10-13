# ==========================================
# STAGE 1: Build & Dependency Isolation
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy POM first to leverage Docker layer caching for dependencies
COPY pom.xml ./

# Pre-fetch dependencies in offline mode
RUN mvn dependency:go-offline -B || true

# Copy source code and build production package
COPY src/ ./src/
RUN mvn clean package -DskipTests -B

# Extract Spring Boot layered JAR for efficient cache layers
RUN java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted

# ==========================================
# STAGE 2: Hardened, Minimal Runtime Container
# ==========================================
FROM eclipse-temurin:21-jre-jammy AS runtime

LABEL maintainer="HealthPulse DevOps <devops@healthpulse.ai>"
LABEL description="Java Virtual Threaded Health Telemetry Service"

# Security hardening: Unprivileged execution user
RUN groupadd --gid 10001 appgroup && \
    useradd --uid 10001 --gid appgroup --shell /bin/false --no-create-home appuser

WORKDIR /app

# Copy Spring Boot layer fragments with correct ownership
COPY --from=builder --chown=appuser:appgroup /build/target/extracted/dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /build/target/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appgroup /build/target/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /build/target/extracted/application/ ./

# Drop privileges to non-root user
USER 10001:10001

EXPOSE 8085

# Container-optimized JVM Flags
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:InitialRAMPercentage=50.0 \
               -XX:+ExitOnOutOfMemoryError \
               -Djava.security.egd=file:/dev/./urandom \
               -Dfile.encoding=UTF-8"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
