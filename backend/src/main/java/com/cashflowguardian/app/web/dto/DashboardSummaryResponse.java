package com.cashflowguardian.app.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    // 4 Primary KPI metric tiles (Project Report Page 17)
    private BigDecimal cashBalance;
    private BigDecimal totalReceivables;
    private BigDecimal upcomingExpenses;
    private BigDecimal overdueInvoices;

    // Additional Core Indicators
    private BigDecimal netCashFlowThisMonth;
    private Integer estimatedRunwayDays;
    private long totalCustomers;
    private long pendingInvoicesCount;
    private long overdueInvoicesCount;

    // Charts & Breakdowns
    private Map<String, BigDecimal> invoiceStatusDistribution; // Paid, Pending, Overdue percentages
    private List<MonthlyTrendPoint> incomeVsExpenseTrend;
    private CashFlowForecastResponse forecast;
    private List<AiInsightDto> recentInsights;
    private List<ExpenseCategoryPoint> expenseBreakdown;
}

