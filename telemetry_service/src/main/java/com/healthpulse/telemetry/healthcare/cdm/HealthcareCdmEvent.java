package com.healthpulse.telemetry.healthcare.cdm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Healthcare Common Domain Model (Healthcare CDM)
 * Standardized clinical and ayurvedic informatics record for diagnostic analysis,
 * biomarker observations, and targeted therapeutic recommendations.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public record HealthcareCdmEvent(
    EventStructure eventStructure,
    PatientProfile patient,
    ClinicalObservations observations,
    DiagnosticInference diagnosis,
    TherapeuticRecommendations recommendations
) {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EventStructure(
        String eventType, // e.g. "DIAGNOSTIC_ANALYSIS", "WELLNESS_ASSESSMENT"
        String analysisId,
        String timestamp
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PatientProfile(
        String patientId,
        Integer age,
        String gender,
        String dominantDosha // Vata, Pitta, Kapha
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ClinicalObservations(
        List<Biomarker> biomarkers,
        SensorTelemetry vitals,
        List<String> reportedSymptoms
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Biomarker(
        String name,
        Double value,
        String unit,
        String status // "low", "normal", "high"
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SensorTelemetry(
        Double heartRate,
        Double spo2,
        Double temperature
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DiagnosticInference(
        String primaryCondition,
        Double confidence,
        Integer healthScore,
        String riskLevel, // "Low", "Moderate", "Critical"
        String clinicalSummary
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TherapeuticRecommendations(
        List<MedicineItem> medicines,
        List<String> diet,
        List<String> lifestyle,
        List<String> precautions,
        String doshaAdvice
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MedicineItem(
        String name,
        String benefit,
        String category // e.g. "Hematopoietic Tonic", "Daily Rejuvenator", "Cardioprotective"
    ) {}
}
