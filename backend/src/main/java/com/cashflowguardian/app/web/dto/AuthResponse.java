package com.cashflowguardian.app.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String email;
    private String fullName;
    private Long activeBusinessId;
    private String activeBusinessName;
    private List<BusinessDto> businesses;
}

