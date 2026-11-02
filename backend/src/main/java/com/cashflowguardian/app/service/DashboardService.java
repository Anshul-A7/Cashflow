package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.repository.*;
import com.cashflowguardian.app.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CashAccountRepository cashAccountRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final CashFlowService cashFlowService;
    private final GeminiAiService geminiAiService;
    private final ExpenseService expenseService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        LocalDate today = LocalDate.now();

        // 4 Primary KPI Tiles
        BigDecimal cashBalance = cashAccountRepository.sumBalance(businessId);
        BigDecimal totalReceivables = invoiceRepository.sumTotalReceivables(businessId);
        BigDecimal upcomingExpenses = expenseRepository.sumUpcomingPayables(businessId);
        BigDecimal overdueInvoices = invoiceRepository.sumOverdueReceivables(businessId, today);

        // Counts
        long totalCustomers = customerRepository.countByBusinessId(businessId);
        long pendingInvoices = invoiceRepository.countByBusinessIdAndStatus(businessId, InvoiceStatus.SENT)
                + invoiceRepository.countByBusinessIdAndStatus(businessId, InvoiceStatus.PARTIALLY_PAID);
        long overdueInvoicesCount = invoiceRepository.countByBusinessIdAndStatus(businessId, InvoiceStatus.OVERDUE);

        // Invoice Status Percentages (Paid, Pending, Overdue)
        long totalInvoices = invoiceRepository.countByBusinessId(businessId);
        long paidInvoices = invoiceRepository.countByBusinessIdAndStatus(businessId, InvoiceStatus.PAID);

        Map<String, BigDecimal> statusDist = new HashMap<>();
        if (totalInvoices > 0) {
            BigDecimal totalCount = BigDecimal.valueOf(totalInvoices);
            BigDecimal paidPct = BigDecimal.valueOf(paidInvoices).multiply(new BigDecimal("100")).divide(totalCount, 1, RoundingMode.HALF_UP);
            BigDecimal pendingPct = BigDecimal.valueOf(pendingInvoices).multiply(new BigDecimal("100")).divide(totalCount, 1, RoundingMode.HALF_UP);
            BigDecimal overduePct = BigDecimal.valueOf(overdueInvoicesCount).multiply(new BigDecimal("100")).divide(totalCount, 1, RoundingMode.HALF_UP);

            statusDist.put("Paid", paidPct);
            statusDist.put("Pending", pendingPct);
            statusDist.put("Overdue", overduePct);
        } else {
            statusDist.put("Paid", BigDecimal.ZERO);
            statusDist.put("Pending", BigDecimal.ZERO);
            statusDist.put("Overdue", BigDecimal.ZERO);
        }

        // Monthly Income vs Expense Trend (past 6 months)
        List<MonthlyTrendPoint> monthlyTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            BigDecimal income = paymentRepository.sumPaymentsInPeriod(businessId, monthStart, monthEnd);
            BigDecimal expense = expenseRepository.sumExpensesInPeriod(businessId, monthStart, monthEnd);
            BigDecimal net = income.subtract(expense);

            String monthName = monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            monthlyTrend.add(MonthlyTrendPoint.builder()
                    .month(monthName)
                    .income(income)
                    .expense(expense)
                    .netCashFlow(net)
                    .build());
        }

        // 6-Week Forecast
        CashFlowForecastResponse forecast = cashFlowService.generateRollingForecast(businessId);

        // Recent Insights
        List<AiInsightDto> insights = geminiAiService.getInsights(businessId);
        if (insights.size() > 3) {
            insights = insights.subList(0, 3);
        }

        // Expense category breakdown
        List<ExpenseCategoryPoint> categoryBreakdown = expenseService.getCategoryBreakdown(businessId, userEmail);

        // Net cash flow this month
        LocalDate startOfMonth = today.withDayOfMonth(1);
        BigDecimal thisMonthIncome = paymentRepository.sumPaymentsInPeriod(businessId, startOfMonth, today);
        BigDecimal thisMonthExpense = expenseRepository.sumExpensesInPeriod(businessId, startOfMonth, today);
        BigDecimal netCashFlowThisMonth = thisMonthIncome.subtract(thisMonthExpense);

        return DashboardSummaryResponse.builder()
                .cashBalance(cashBalance)
                .totalReceivables(totalReceivables)
                .upcomingExpenses(upcomingExpenses)
                .overdueInvoices(overdueInvoices)
                .netCashFlowThisMonth(netCashFlowThisMonth)
                .estimatedRunwayDays(forecast.getEstimatedRunwayDays())
                .totalCustomers(totalCustomers)
                .pendingInvoicesCount(pendingInvoices)
                .overdueInvoicesCount(overdueInvoicesCount)
                .invoiceStatusDistribution(statusDist)
                .incomeVsExpenseTrend(monthlyTrend)
                .forecast(forecast)
                .recentInsights(insights)
                .expenseBreakdown(categoryBreakdown)
                .build();
    }
}

