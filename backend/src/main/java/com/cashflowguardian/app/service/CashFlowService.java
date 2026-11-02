package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.Invoice;
import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.repository.CashAccountRepository;
import com.cashflowguardian.app.repository.ExpenseRepository;
import com.cashflowguardian.app.repository.InvoiceRepository;
import com.cashflowguardian.app.web.dto.CashFlowForecastResponse;
import com.cashflowguardian.app.web.dto.WeeklyForecastPoint;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Core CashFlow Engine as specified in G H Raisoni University Project Report (Chapter 4, Page 29).
 * Evaluates liquidity positions, expected receivables, and upcoming obligations.
 */
@Service
@Transactional(readOnly = true)
public class CashFlowService {

    private final CashAccountRepository cashAccountRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;

    public CashFlowService(CashAccountRepository cashAccountRepository,
                           InvoiceRepository invoiceRepository,
                           ExpenseRepository expenseRepository) {
        this.cashAccountRepository = cashAccountRepository;
        this.invoiceRepository = invoiceRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Estimated cash = balance + expected receipts - upcoming expenses
     * Exact method defined on Page 29 of the Project Report.
     */
    public BigDecimal forecastCashPosition(Long businessId, LocalDate untilDate) {
        BigDecimal balance = cashAccountRepository.sumBalance(businessId);
        BigDecimal receivables = invoiceRepository.sumOutstandingDueBy(businessId, untilDate);
        BigDecimal expenses = expenseRepository.sumUnpaidDueBy(businessId, untilDate);
        return balance.add(receivables).subtract(expenses);
    }

    /**
     * Generates a 6-week rolling cash flow projection (W1 to W6)
     * as shown in the Illustrative CashFlow-Guardian Dashboard (Page 17).
     */
    public CashFlowForecastResponse generateRollingForecast(Long businessId) {
        BigDecimal currentBalance = cashAccountRepository.sumBalance(businessId);
        BigDecimal totalReceivables = invoiceRepository.sumTotalReceivables(businessId);
        BigDecimal totalPayables = expenseRepository.sumUpcomingPayables(businessId);

        LocalDate today = LocalDate.now();
        List<WeeklyForecastPoint> points = new ArrayList<>();

        BigDecimal runningCash = currentBalance;
        BigDecimal minCash = currentBalance;

        for (int week = 1; week <= 6; week++) {
            LocalDate weekEnd = today.plusWeeks(week);
            LocalDate weekStart = week == 1 ? today : today.plusWeeks(week - 1).plusDays(1);

            BigDecimal weekReceivables = invoiceRepository.sumOutstandingDueBy(businessId, weekEnd);
            BigDecimal previousWeekReceivables = week == 1 ? BigDecimal.ZERO : invoiceRepository.sumOutstandingDueBy(businessId, weekStart.minusDays(1));
            BigDecimal expectedInflow = weekReceivables.subtract(previousWeekReceivables).max(BigDecimal.ZERO);

            BigDecimal weekExpenses = expenseRepository.sumUnpaidDueBy(businessId, weekEnd);
            BigDecimal previousWeekExpenses = week == 1 ? BigDecimal.ZERO : expenseRepository.sumUnpaidDueBy(businessId, weekStart.minusDays(1));
            BigDecimal expectedOutflow = weekExpenses.subtract(previousWeekExpenses).max(BigDecimal.ZERO);

            runningCash = runningCash.add(expectedInflow).subtract(expectedOutflow);
            if (runningCash.compareTo(minCash) < 0) {
                minCash = runningCash;
            }

            points.add(WeeklyForecastPoint.builder()
                    .weekLabel("W" + week)
                    .startDate(weekStart)
                    .endDate(weekEnd)
                    .expectedInflow(expectedInflow)
                    .expectedOutflow(expectedOutflow)
                    .projectedCash(runningCash)
                    .isDeficit(runningCash.compareTo(BigDecimal.ZERO) < 0)
                    .build());
        }

        // Calculate estimated runway in days based on 30-day expense velocity
        BigDecimal past30DaysExpenses = expenseRepository.sumExpensesInPeriod(businessId, today.minusDays(30), today);
        BigDecimal dailyBurnRate = past30DaysExpenses.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);
        int runwayDays = 999;
        if (dailyBurnRate.compareTo(BigDecimal.ZERO) > 0) {
            runwayDays = currentBalance.divide(dailyBurnRate, 0, RoundingMode.DOWN).intValue();
        }

        return CashFlowForecastResponse.builder()
                .currentCashBalance(currentBalance)
                .totalOutstandingReceivables(totalReceivables)
                .totalUpcomingPayables(totalPayables)
                .minimumProjectedCash(minCash)
                .hasLiquidityRisk(minCash.compareTo(BigDecimal.ZERO) < 0)
                .estimatedRunwayDays(Math.max(0, runwayDays))
                .weeklyForecast(points)
                .build();
    }
}

