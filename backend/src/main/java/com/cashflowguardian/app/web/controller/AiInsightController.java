package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.AuthService;
import com.cashflowguardian.app.service.GeminiAiService;
import com.cashflowguardian.app.web.dto.AiDiagnosticResponse;
import com.cashflowguardian.app.web.dto.AiInsightDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Insights & Diagnostics", description = "AI-powered financial evaluations, liquidity health scoring, and recommendations via Google Gemini")
public class AiInsightController {

    private final GeminiAiService geminiAiService;
    private final AuthService authService;

    @GetMapping("/{businessId}/insights")
    @Operation(summary = "Fetch all historical and current AI financial insights")
    public ResponseEntity<List<AiInsightDto>> getInsights(
            @PathVariable Long businessId,
            Authentication authentication) {
        authService.validateBusinessAccess(businessId, authentication.getName());
        return ResponseEntity.ok(geminiAiService.getInsights(businessId));
    }

    @PostMapping("/{businessId}/diagnose")
    @Operation(summary = "Run live AI diagnostic evaluation using real financial telemetry")
    public ResponseEntity<AiDiagnosticResponse> runDiagnostic(
            @PathVariable Long businessId,
            Authentication authentication) {
        authService.validateBusinessAccess(businessId, authentication.getName());
        return ResponseEntity.ok(geminiAiService.runFinancialDiagnostic(businessId));
    }
}

