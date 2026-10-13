package com.healthpulse.telemetry.service;

import com.healthpulse.telemetry.domain.HealthTelemetryEvent;
import com.healthpulse.telemetry.domain.HealthTelemetryEvent.*;
import com.healthpulse.telemetry.domain.VitalMetric;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Service
public class TelemetryProcessingService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryProcessingService.class);
    
    // Explicit Virtual Thread per-task executor for high-throughput batch operations
    private final Executor virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();

    /**
     * Evaluates incoming health events using Java modern pattern matching with record deconstruction.
     */
    public String evaluateTelemetryEvent(HealthTelemetryEvent event) {
        return switch (event) {
            case null -> "Null telemetry event received";

            // Guarded record pattern: High heart rate tachycardia detection
            case HeartRateEvent(var patient, var bpm, var hrv, var time) when bpm > 130 -> {
                log.warn("Tachycardia detected for patient {}: {} BPM", patient, bpm);
                yield "ALERT: Tachycardia triggered [%s BPM]".formatted(bpm);
            }

            // Normal heart rate pattern
            case HeartRateEvent(var patient, var bpm, var hrv, var time) ->
                "Normal heart rate recorded: %d BPM (HRV: %d ms)".formatted(bpm, hrv);

            // Hypoxia detection with guard
            case SpO2Event(var patient, var spo2, var time) when spo2 < 90.0 -> {
                log.error("Hypoxia danger for patient {}: {}%", patient, spo2);
                yield "CRITICAL: Hypoxia emergency [%.1f%%]".formatted(spo2);
            }

            case SpO2Event(var patient, var spo2, var time) ->
                "SpO2 nominal: %.1f%%".formatted(spo2);

            case TemperatureEvent(var patient, var temp, var time) when temp >= 38.5 ->
                "High fever alert: %.1f°C".formatted(temp);

            case TemperatureEvent(var patient, var temp, var time) ->
                "Normal temperature: %.1f°C".formatted(temp);

            case CriticalAlertEvent(var patient, var condition, var severity, var rec, var time) ->
                "CRITICAL [%d]: Patient %s diagnosed with %s. Action: %s".formatted(
                    severity, patient, condition, rec
                );
        };
    }

    /**
     * Batch processes vital metrics asynchronously on lightweight virtual threads.
     */
    public CompletableFuture<Integer> processBatchMetricsAsync(List<VitalMetric> metrics) {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Processing {} metrics on virtual thread: {}", metrics.size(), Thread.currentThread());
            int count = 0;
            for (VitalMetric metric : metrics) {
                // Simulate lightweight I/O or downstream persistence
                count++;
            }
            return count;
        }, virtualThreadExecutor);
    }
}
