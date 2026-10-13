#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Continuous Deployment (CD) Script for HealthPulse Telemetry Service
# Implements: Rolling Update -> Health Verification Probe -> Automatic Rollback
# ==============================================================================

IMAGE_TAG="${1:-latest}"
NAMESPACE="${2:-healthpulse}"
DEPLOYMENT_NAME="telemetry-service"
REGISTRY="${REGISTRY:-ghcr.io/healthpulse}"
FULL_IMAGE="${REGISTRY}/${DEPLOYMENT_NAME}:${IMAGE_TAG}"

echo "=========================================="
echo "Starting Continuous Deployment to [${NAMESPACE}]"
echo "Target Image: ${FULL_IMAGE}"
echo "=========================================="

# Ensure Namespace Exists
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

# Apply Manifests (Config, Service, HPA)
echo "[1/4] Applying Kubernetes configuration and manifests..."
kubectl apply -f k8s/deployment.yaml -n "${NAMESPACE}"

# Trigger Rolling Update with Target Image
echo "[2/4] Updating image to ${FULL_IMAGE}..."
kubectl set image deployment/${DEPLOYMENT_NAME} \
    ${DEPLOYMENT_NAME}="${FULL_IMAGE}" \
    -n "${NAMESPACE}" \
    --record=true

# Monitor Rollout Status with Timeout
echo "[3/4] Monitoring rolling rollout status (max 180s)..."
if ! kubectl rollout status deployment/${DEPLOYMENT_NAME} -n "${NAMESPACE}" --timeout=180s; then
    echo "========================================================="
    echo "❌ ERROR: Rollout failed or timed out! INITIATING AUTOMATIC ROLLBACK..."
    echo "========================================================="
    kubectl rollout undo deployment/${DEPLOYMENT_NAME} -n "${NAMESPACE}"
    kubectl rollout status deployment/${DEPLOYMENT_NAME} -n "${NAMESPACE}"
    echo "Rollback completed. Exiting with failure code 1."
    exit 1
fi

# Run Post-Deployment Smoke Test (Actuator Health Probe)
echo "[4/4] Running live smoke test on pods..."
POD_NAME=$(kubectl get pods -n "${NAMESPACE}" -l app=${DEPLOYMENT_NAME} -o jsonpath="{.items[0].metadata.name}")

HEALTH_STATUS=$(kubectl exec -n "${NAMESPACE}" "${POD_NAME}" -- curl -s http://localhost:8085/actuator/health/readiness | grep -o '"status":"UP"' || true)

if [[ -z "${HEALTH_STATUS}" ]]; then
    echo "❌ WARNING: Actuator Readiness Probe did not return UP!"
    echo "Initiating automatic safety rollback..."
    kubectl rollout undo deployment/${DEPLOYMENT_NAME} -n "${NAMESPACE}"
    exit 1
fi

echo "=========================================="
echo "✅ CONTINUOUS DEPLOYMENT SUCCESSFUL!"
echo "Service is healthy and live in [${NAMESPACE}]"
echo "=========================================="
