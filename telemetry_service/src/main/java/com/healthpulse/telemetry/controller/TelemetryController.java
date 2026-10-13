package com.healthpulse.telemetry.controller;

import com.healthpulse.telemetry.domain.HealthTelemetryEvent;
import com.healthpulse.telemetry.domain.VitalMetric;
import com.healthpulse.telemetry.service.TelemetryProcessingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryController {

    private final TelemetryProcessingService processingService;

    public TelemetryController(TelemetryProcessingService processingService) {
        this.processingService = processingService;
    }

    /**
     * Ingests polymorphic health events (Heart Rate, SpO2, Temperature, Alert)
     * using the modern sealed type hierarchy.
     */
    @PostMapping("/event")
    public ResponseEntity<Map<String, Object>> ingestEvent(@RequestBody HealthTelemetryEvent event) {
        String result = processingService.evaluateTelemetryEvent(event);
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "patientId", event.patientId(),
            "evaluation", result,
            "thread", Thread.currentThread().toString()
        ));
    }

    /**
     * Batch ingestion processed over Virtual Threads without blocking platform OS threads.
     */
    @PostMapping("/batch")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> ingestBatchMetrics(
        @RequestBody @Valid List<VitalMetric> metrics
    ) {
        return processingService.processBatchMetricsAsync(metrics)
            .thenApply(count -> ResponseEntity.ok(Map.of(
                "status", "PROCESSED",
                "ingestedCount", count,
                "virtualThread", Thread.currentThread().isVirtual()
            )));
    }
}
