package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.CustomerRiskTier;
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
public class CustomerResponse {
    private Long id;
    private Long businessId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String taxId;
    private BigDecimal paymentReliabilityScore;
    private BigDecimal averageDaysLate;
    private CustomerRiskTier riskTier;
    private BigDecimal totalBilled;
    private BigDecimal totalPaid;
    private BigDecimal outstandingBalance;
    private OffsetDateTime createdAt;
}

