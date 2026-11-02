package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private Long businessId;
    private Long customerId;
    private String customerName;
    private String invoiceNumber;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingBalance;
    private InvoiceStatus status;
    private String notes;
    private List<InvoiceItemResponse> items;
    private OffsetDateTime createdAt;
}

