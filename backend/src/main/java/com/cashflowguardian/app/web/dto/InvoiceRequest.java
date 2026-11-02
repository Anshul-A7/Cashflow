package com.cashflowguardian.app.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @Pattern(regexp = "^$|^[A-Za-z0-9_/-]{3,30}$", 
             message = "Invoice number must be between 3 and 30 alphanumeric characters, hyphens or slashes")
    private String invoiceNumber; // Auto-generated if null

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @DecimalMin(value = "0.00", message = "Tax rate cannot be negative")
    @DecimalMax(value = "100.00", message = "Tax rate cannot exceed 100%")
    private BigDecimal taxRate; // Optional percentage (e.g. 18.0)

    @DecimalMin(value = "0.00", message = "Discount cannot be negative")
    @DecimalMax(value = "99999999.99", message = "Discount amount exceeds maximum limit")
    private BigDecimal discountAmount;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    @NotEmpty(message = "Invoice must contain at least one line item")
    @Valid
    private List<InvoiceItemRequest> items;
}
