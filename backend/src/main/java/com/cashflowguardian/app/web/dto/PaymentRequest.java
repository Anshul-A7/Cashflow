package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class PaymentRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long invoiceId; // Optional: Link directly to an invoice

    @NotNull(message = "Cash Account ID is required")
    private Long cashAccountId; // Account where funds are deposited

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be at least 0.01")
    @DecimalMax(value = "99999999.99", message = "Payment amount cannot exceed 99,999,999.99")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Pattern(regexp = "^$|^[A-Za-z0-9_/-]{2,50}$", 
             message = "Reference / UTR number must be between 2 and 50 alphanumeric characters or hyphens")
    private String referenceNumber;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
}
