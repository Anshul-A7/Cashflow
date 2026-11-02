package com.cashflowguardian.app.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemRequest {

    @NotBlank(message = "Item description is required")
    @Size(min = 2, max = 200, message = "Item description must be between 2 and 200 characters")
    private String description;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be at least 0.01")
    @DecimalMax(value = "999999.99", message = "Quantity cannot exceed 999,999.99")
    private BigDecimal quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.00", message = "Unit price cannot be negative")
    @DecimalMax(value = "99999999.99", message = "Unit price cannot exceed 99,999,999.99")
    private BigDecimal unitPrice;
}
