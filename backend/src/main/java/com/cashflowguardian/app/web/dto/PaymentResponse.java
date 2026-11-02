package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.PaymentMethod;
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
public class PaymentResponse {
    private Long id;
    private Long businessId;
    private Long customerId;
    private String customerName;
    private Long invoiceId;
    private String invoiceNumber;
    private Long cashAccountId;
    private String cashAccountName;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private String notes;
    private OffsetDateTime createdAt;
}

