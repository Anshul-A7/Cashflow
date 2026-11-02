package com.cashflowguardian.app.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessDto {
    private Long id;
    private String name;
    private String taxId;
    private String currency;
    private String address;
    private String phone;
    private OffsetDateTime createdAt;
}

