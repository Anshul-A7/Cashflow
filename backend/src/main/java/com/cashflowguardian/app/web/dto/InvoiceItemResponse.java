package com.cashflowguardian.app.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemResponse {
    private Long id;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}

