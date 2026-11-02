package com.cashflowguardian.app.web.dto;

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
public class CustomerRequest {

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    private String name;

    @Pattern(regexp = "^$|^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", 
             message = "Invalid email format (e.g. client@company.com)")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @Pattern(regexp = "^$|^[6-9][0-9]{9}$", 
             message = "Phone number must be exactly 10 digits starting with 6, 7, 8, or 9 (e.g. 9876543210)")
    private String phone;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @Pattern(regexp = "^$|^[A-Za-z0-9_/-]{6,20}$", 
             message = "Tax ID / GSTIN must be between 6 and 20 alphanumeric characters")
    private String taxId;
}
