package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategoryPoint {
    private ExpenseCategory category;
    private String categoryLabel;
    private BigDecimal totalAmount;
    private BigDecimal percentage;
}

