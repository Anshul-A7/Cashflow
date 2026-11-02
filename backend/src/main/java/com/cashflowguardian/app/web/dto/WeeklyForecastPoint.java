package com.cashflowguardian.app.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyForecastPoint {
    private String weekLabel; // e.g. W1, W2...
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal expectedInflow;
    private BigDecimal expectedOutflow;
    private BigDecimal projectedCash;
    private boolean isDeficit;
}

