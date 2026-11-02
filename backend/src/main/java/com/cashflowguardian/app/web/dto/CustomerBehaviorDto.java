package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.CustomerRiskTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerBehaviorDto {
    private Long customerId;
    private String customerName;
    private String email;
    private BigDecimal reliabilityScore; // 0 to 100
    private BigDecimal averageDaysLate; // e.g. 4.2 days
    private CustomerRiskTier riskTier; // LOW_RISK, MODERATE_RISK, CHRONIC_LATE, CRITICAL_DEFAULT_RISK
    private int totalInvoicesIssued;
    private int totalInvoicesPaid;
    private int overdueInvoicesCount;
    private BigDecimal totalBilled;
    private BigDecimal totalCollected;
    private BigDecimal currentOutstandingBalance;
    private String behavioralSummary;
    private String recommendedCollectionAction;
}

