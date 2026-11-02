package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.ExpenseService;
import com.cashflowguardian.app.web.dto.ExpenseCategoryPoint;
import com.cashflowguardian.app.web.dto.ExpenseRequest;
import com.cashflowguardian.app.web.dto.ExpenseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expense Tracking", description = "Record operating expenses, rent, payroll, and analyze category breakdowns")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/{businessId}")
    @Operation(summary = "Record business expense with optional cash account balance deduction")
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long businessId,
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(expenseService.createExpense(businessId, request, authentication.getName()));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "List all recorded expenses ordered by date")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @PathVariable Long businessId,
            Authentication authentication) {
        return ResponseEntity.ok(expenseService.getExpenses(businessId, authentication.getName()));
    }

    @GetMapping("/{businessId}/categories")
    @Operation(summary = "Get aggregated expense breakdown by category for analytics")
    public ResponseEntity<List<ExpenseCategoryPoint>> getCategoryBreakdown(
            @PathVariable Long businessId,
            Authentication authentication) {
        return ResponseEntity.ok(expenseService.getCategoryBreakdown(businessId, authentication.getName()));
    }

    @DeleteMapping("/{businessId}/{expenseId}")
    @Operation(summary = "Delete expense record and restore balance if paid")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long businessId,
            @PathVariable Long expenseId,
            Authentication authentication) {
        expenseService.deleteExpense(businessId, expenseId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

