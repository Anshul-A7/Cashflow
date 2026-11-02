package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.DashboardService;
import com.cashflowguardian.app.web.dto.DashboardSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Business Dashboard", description = "Real-time financial status, liquidity metrics, and visual analytics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{businessId}")
    @Operation(summary = "Get aggregated business dashboard metrics, KPI tiles, and trend series")
    public ResponseEntity<DashboardSummaryResponse> getDashboard(
            @PathVariable Long businessId,
            Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(businessId, authentication.getName()));
    }
}

