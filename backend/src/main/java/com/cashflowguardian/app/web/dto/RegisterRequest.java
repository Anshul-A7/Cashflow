package com.cashflowguardian.app.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 60, message = "Full name must be between 2 and 60 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address (e.g. founder@company.com)")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 64, message = "Password must be between 6 and 64 characters")
    private String password;

    @NotBlank(message = "Business name is required")
    @Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    private String businessName;

    @Pattern(regexp = "^$|^[A-Za-z0-9_/-]{6,20}$", 
             message = "Tax ID / GSTIN must be between 6 and 20 alphanumeric characters")
    private String taxId;

    @Pattern(regexp = "^$|^(INR|USD|EUR|GBP)$", message = "Currency must be INR, USD, EUR, or GBP")
    private String currency; // Default INR
}
