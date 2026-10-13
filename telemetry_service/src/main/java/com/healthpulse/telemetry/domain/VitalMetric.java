package com.healthpulse.telemetry.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;
import java.util.Objects;

/**
 * Immutable domain record representing an individual vital telemetry point.
 * Replaces legacy POJOs, builders, and boilerplate equals/hashCode/toString.
 */
public record VitalMetric(
    @NotBlank String patientId,
    @NotBlank String metricType,
    @Positive double value,
    String unit,
    @NotNull Instant timestamp
) {
    // Compact constructor for validation and normalization
    public VitalMetric {
        Objects.requireNonNull(patientId, "patientId cannot be null");
        Objects.requireNonNull(metricType, "metricType cannot be null");
        Objects.requireNonNull(timestamp, "timestamp cannot be null");

        patientId = patientId.trim().toUpperCase();
        metricType = metricType.trim().toLowerCase();
        unit = (unit != null) ? unit.trim() : "";
    }

    public String formattedSummary() {
        return "%s -> %s: %.2f %s at %s".formatted(patientId, metricType, value, unit, timestamp);
    }
}
