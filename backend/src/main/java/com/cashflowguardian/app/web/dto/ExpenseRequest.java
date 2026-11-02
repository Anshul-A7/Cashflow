package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.ExpenseCategory;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
public class ExpenseRequest {

    @NotNull(message = "Expense category is required")
    private ExpenseCategory category;

    @NotBlank(message = "Payee name is required")
    @Size(min = 2, max = 100, message = "Payee name must be between 2 and 100 characters")
    private String payee;

    @NotNull(message = "Expense amount is required")
    @DecimalMin(value = "0.01", message = "Expense amount must be at least 0.01")
    @DecimalMax(value = "99999999.99", message = "Expense amount cannot exceed 99,999,999.99")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private LocalDate dueDate;

    private Boolean isPaid;
    private Long cashAccountId; // Account from which expense is deducted if paid

    private Boolean isRecurring;

    @Pattern(regexp = "^$|^(MONTHLY|QUARTERLY|ANNUALLY|WEEKLY)$", 
             message = "Recurring frequency must be MONTHLY, QUARTERLY, ANNUALLY, or WEEKLY")
    private String recurringFrequency;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}
