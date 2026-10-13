package com.healthpulse.telemetry.service;

import com.healthpulse.telemetry.domain.HealthTelemetryEvent.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class TelemetryProcessingServiceTest {

    private final TelemetryProcessingService service = new TelemetryProcessingService();

    @Test
    @DisplayName("Should trigger Tachycardia alert when heart rate exceeds 130 BPM")
    void shouldTriggerTachycardiaAlert() {
        var highHrEvent = new HeartRateEvent("P-101", 145, 25, Instant.now());
        String evaluation = service.evaluateTelemetryEvent(highHrEvent);

        assertTrue(evaluation.contains("ALERT: Tachycardia triggered"));
    }

    @Test
    @DisplayName("Should detect normal SpO2 saturation")
    void shouldHandleNominalSpO2() {
        var spo2Event = new SpO2Event("P-101", 98.5, Instant.now());
        String evaluation = service.evaluateTelemetryEvent(spo2Event);

        assertTrue(evaluation.contains("SpO2 nominal: 98.5%"));
    }

    @Test
    @DisplayName("Should trigger Hypoxia emergency when SpO2 < 90%")
    void shouldTriggerHypoxiaAlert() {
        var criticalSpo2 = new SpO2Event("P-101", 87.2, Instant.now());
        String evaluation = service.evaluateTelemetryEvent(criticalSpo2);

        assertTrue(evaluation.contains("CRITICAL: Hypoxia emergency"));
    }
}
