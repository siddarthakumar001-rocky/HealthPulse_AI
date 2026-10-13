package com.healthpulse.telemetry.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.time.Instant;

/**
 * Sealed domain hierarchy representing health sensor events.
 * Exhaustive domain modeling allows compiler-enforced pattern matching switches.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "eventType"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = HealthTelemetryEvent.HeartRateEvent.class, name = "HEART_RATE"),
    @JsonSubTypes.Type(value = HealthTelemetryEvent.SpO2Event.class, name = "SPO2"),
    @JsonSubTypes.Type(value = HealthTelemetryEvent.TemperatureEvent.class, name = "TEMPERATURE"),
    @JsonSubTypes.Type(value = HealthTelemetryEvent.CriticalAlertEvent.class, name = "CRITICAL_ALERT")
})
public sealed interface HealthTelemetryEvent 
    permits HealthTelemetryEvent.HeartRateEvent,
            HealthTelemetryEvent.SpO2Event,
            HealthTelemetryEvent.TemperatureEvent,
            HealthTelemetryEvent.CriticalAlertEvent {

    String patientId();
    Instant timestamp();

    record HeartRateEvent(
        String patientId,
        int bpm,
        int hrvMs,
        Instant timestamp
    ) implements HealthTelemetryEvent {}

    record SpO2Event(
        String patientId,
        double oxygenSaturationPercent,
        Instant timestamp
    ) implements HealthTelemetryEvent {}

    record TemperatureEvent(
        String patientId,
        double temperatureCelsius,
        Instant timestamp
    ) implements HealthTelemetryEvent {}

    record CriticalAlertEvent(
        String patientId,
        String conditionName,
        int severityLevel,
        String recommendation,
        Instant timestamp
    ) implements HealthTelemetryEvent {}
}
