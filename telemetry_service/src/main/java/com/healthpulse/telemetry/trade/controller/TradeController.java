package com.healthpulse.telemetry.trade.controller;

import com.healthpulse.telemetry.trade.service.TradePipelineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/trade")
@CrossOrigin(origins = "*")
public class TradeController {

    private final TradePipelineService tradePipelineService;

    public TradeController(TradePipelineService tradePipelineService) {
        this.tradePipelineService = tradePipelineService;
    }

    /**
     * Executes the 4-stage trade execution pipeline:
     * 1. Jev Intent Routing
     * 2. Groq LLaMA 3 70B CDM Translation
     * 3. Jev Risk & Hallucination Guardrail Check
     * 4. Groq LLaMA 3 8B Dashboard UI Toast Generation
     */
    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeTrade(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing required field: 'query'"
            ));
        }

        // Security check: Cap payload length to prevent token-drain & buffer exhaustion
        if (query.length() > 1000) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Query exceeds maximum permitted length of 1,000 characters."
            ));
        }

        // Security check: Strip null-bytes and potential control injection characters
        String sanitizedQuery = query.replace("\0", "").trim();

        Map<String, Object> result = tradePipelineService.execute(sanitizedQuery);
        return ResponseEntity.ok(result);
    }

}
