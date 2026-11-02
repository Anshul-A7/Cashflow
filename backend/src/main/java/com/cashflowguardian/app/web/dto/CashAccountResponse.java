package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashAccountResponse {
    private Long id;
    private Long businessId;
    private String accountName;
    private AccountType accountType;
    private String accountNumber;
    private String bankName;
    private BigDecimal currentBalance;
    private OffsetDateTime updatedAt;
}

