package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long businessId;
    private Long cashAccountId;
    private String cashAccountName;
    private ExpenseCategory category;
    private String payee;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private LocalDate dueDate;
    private Boolean isPaid;
    private Boolean isRecurring;
    private String recurringFrequency;
    private String description;
    private OffsetDateTime createdAt;
}

