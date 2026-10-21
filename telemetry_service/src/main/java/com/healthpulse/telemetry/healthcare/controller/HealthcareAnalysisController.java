package com.healthpulse.telemetry.healthcare.controller;

import com.healthpulse.telemetry.healthcare.service.HealthcareAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Endpoint for Healthcare AI Diagnostic & Recommendation Engine
 * Integrates LLM (Groq LPU) + JEV System One + Healthcare CDM
 */
@RestController
@RequestMapping("/api/v1/healthcare")
@CrossOrigin(origins = "*")
public class HealthcareAnalysisController {

    private final HealthcareAiService healthcareAiService;

    public HealthcareAnalysisController(HealthcareAiService healthcareAiService) {
        this.healthcareAiService = healthcareAiService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeHealth(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required field: 'query'"));
        }

        // Security check: Cap payload to prevent token drain
        if (query.length() > 2000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query exceeds maximum limit of 2,000 characters."));
        }

        String sanitizedQuery = query.replace("\0", "").trim();
        Map<String, Object> result = healthcareAiService.analyzeHealthQuery(sanitizedQuery);
        return ResponseEntity.ok(result);
    }
}
