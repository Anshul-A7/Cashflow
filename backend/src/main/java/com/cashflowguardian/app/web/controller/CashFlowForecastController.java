package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.AuthService;
import com.cashflowguardian.app.service.CashFlowService;
import com.cashflowguardian.app.web.dto.CashFlowForecastResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
@Tag(name = "Cash Flow Forecasting", description = "Deterministic liquidity simulation and 6-week rolling cash horizons")
public class CashFlowForecastController {

    private final CashFlowService cashFlowService;
    private final AuthService authService;

    @GetMapping("/{businessId}")
    @Operation(summary = "Generate 6-week rolling cash forecast with deficit detection and runway analysis")
    public ResponseEntity<CashFlowForecastResponse> getForecast(
            @PathVariable Long businessId,
            Authentication authentication) {
        authService.validateBusinessAccess(businessId, authentication.getName());
        return ResponseEntity.ok(cashFlowService.generateRollingForecast(businessId));
    }

    @GetMapping("/{businessId}/position")
    @Operation(summary = "Calculate estimated cash position until a target date (Project Report Page 29)")
    public ResponseEntity<Map<String, Object>> getCashPositionUntil(
            @PathVariable Long businessId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate untilDate,
            Authentication authentication) {
        authService.validateBusinessAccess(businessId, authentication.getName());
        BigDecimal projectedCash = cashFlowService.forecastCashPosition(businessId, untilDate);
        return ResponseEntity.ok(Map.of(
                "businessId", businessId,
                "untilDate", untilDate,
                "projectedCash", projectedCash
        ));
    }
}

