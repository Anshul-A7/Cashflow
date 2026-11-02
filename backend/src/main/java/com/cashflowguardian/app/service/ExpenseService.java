package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.Business;
import com.cashflowguardian.app.domain.entity.CashAccount;
import com.cashflowguardian.app.domain.entity.Expense;
import com.cashflowguardian.app.domain.enums.ExpenseCategory;
import com.cashflowguardian.app.repository.CashAccountRepository;
import com.cashflowguardian.app.repository.ExpenseRepository;
import com.cashflowguardian.app.web.dto.ExpenseCategoryPoint;
import com.cashflowguardian.app.web.dto.ExpenseRequest;
import com.cashflowguardian.app.web.dto.ExpenseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CashAccountRepository cashAccountRepository;
    private final AuthService authService;

    @Transactional
    public ExpenseResponse createExpense(Long businessId, ExpenseRequest request, String userEmail) {
        Business business = authService.validateBusinessAccess(businessId, userEmail);

        CashAccount cashAccount = null;
        if (request.getCashAccountId() != null) {
            cashAccount = cashAccountRepository.findByIdAndBusinessId(request.getCashAccountId(), businessId)
                    .orElseThrow(() -> new IllegalArgumentException("Cash account not found: " + request.getCashAccountId()));
        }

        if (request.getDueDate() != null && request.getDueDate().isBefore(request.getExpenseDate())) {
            throw new IllegalArgumentException("Expense due date (" + request.getDueDate() + ") cannot be earlier than expense date (" + request.getExpenseDate() + ")");
        }

        boolean isPaid = Boolean.TRUE.equals(request.getIsPaid());

        if (isPaid && cashAccount == null) {
            throw new IllegalArgumentException("A Cash or Bank account must be selected to disburse immediate payment for this expense");
        }

        // Deduct from cash account balance if paid immediately
        if (isPaid && cashAccount != null) {
            cashAccount.setCurrentBalance(cashAccount.getCurrentBalance().subtract(request.getAmount()));
            cashAccount.setUpdatedAt(OffsetDateTime.now());
            cashAccountRepository.save(cashAccount);
        }

        Expense expense = Expense.builder()
                .business(business)
                .cashAccount(cashAccount)
                .category(request.getCategory())
                .payee(request.getPayee().trim())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .dueDate(request.getDueDate())
                .isPaid(isPaid)
                .isRecurring(Boolean.TRUE.equals(request.getIsRecurring()))
                .recurringFrequency(request.getRecurringFrequency())
                .description(request.getDescription())
                .build();

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpenses(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        return expenseRepository.findAllByBusinessIdOrderByExpenseDateDesc(businessId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseCategoryPoint> getCategoryBreakdown(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        List<Object[]> rows = expenseRepository.getExpenseBreakdownByCategory(businessId);
        BigDecimal totalExpenses = rows.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ExpenseCategoryPoint> points = new ArrayList<>();
        for (Object[] row : rows) {
            ExpenseCategory cat = (ExpenseCategory) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            BigDecimal percentage = totalExpenses.compareTo(BigDecimal.ZERO) > 0
                    ? amount.multiply(new BigDecimal("100")).divide(totalExpenses, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            points.add(ExpenseCategoryPoint.builder()
                    .category(cat)
                    .categoryLabel(cat.name().replace('_', ' '))
                    .totalAmount(amount)
                    .percentage(percentage)
                    .build());
        }

        return points;
    }

    @Transactional
    public void deleteExpense(Long businessId, Long expenseId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Expense expense = expenseRepository.findByIdAndBusinessId(expenseId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found: " + expenseId));

        // Reversal of balance deduction if it was paid
        if (Boolean.TRUE.equals(expense.getIsPaid()) && expense.getCashAccount() != null) {
            CashAccount ca = expense.getCashAccount();
            ca.setCurrentBalance(ca.getCurrentBalance().add(expense.getAmount()));
            ca.setUpdatedAt(OffsetDateTime.now());
            cashAccountRepository.save(ca);
        }

        expenseRepository.delete(expense);
    }

    public ExpenseResponse mapToResponse(Expense exp) {
        return ExpenseResponse.builder()
                .id(exp.getId())
                .businessId(exp.getBusiness().getId())
                .cashAccountId(exp.getCashAccount() != null ? exp.getCashAccount().getId() : null)
                .cashAccountName(exp.getCashAccount() != null ? exp.getCashAccount().getAccountName() : null)
                .category(exp.getCategory())
                .payee(exp.getPayee())
                .amount(exp.getAmount())
                .expenseDate(exp.getExpenseDate())
                .dueDate(exp.getDueDate())
                .isPaid(exp.getIsPaid())
                .isRecurring(exp.getIsRecurring())
                .recurringFrequency(exp.getRecurringFrequency())
                .description(exp.getDescription())
                .createdAt(exp.getCreatedAt())
                .build();
    }
}

