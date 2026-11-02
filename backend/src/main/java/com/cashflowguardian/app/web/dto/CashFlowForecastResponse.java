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
public class CashFlowForecastResponse {
    private BigDecimal currentCashBalance;
    private BigDecimal totalOutstandingReceivables;
    private BigDecimal totalUpcomingPayables;
    private BigDecimal minimumProjectedCash;
    private boolean hasLiquidityRisk;
    private Integer estimatedRunwayDays;
    private List<WeeklyForecastPoint> weeklyForecast;
}

