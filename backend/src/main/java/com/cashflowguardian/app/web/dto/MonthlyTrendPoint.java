package com.cashflowguardian.app.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendPoint {
    private String month; // e.g. "May", "Jun", "Jul", etc.
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal netCashFlow;
}

