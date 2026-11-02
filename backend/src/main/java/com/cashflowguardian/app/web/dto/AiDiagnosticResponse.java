package com.cashflowguardian.app.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDiagnosticResponse {
    private int financialHealthScore; // 0 to 100
    private String liquidityStatus; // EXCELLENT, STABLE, VULNERABLE, CRITICAL
    private String executiveSummary;
    private List<String> identifiedRisks;
    private List<String> strategicRecommendations;
    private BigDecimal calculatedRunwayDays;
    private List<AiInsightDto> generatedInsights;
    private boolean isAiGenerated; // true if via Gemini API, false if via heuristic financial engine
}

