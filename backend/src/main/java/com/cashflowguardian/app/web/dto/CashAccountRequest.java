package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.AccountType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class CashAccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(min = 2, max = 60, message = "Account name must be between 2 and 60 characters")
    private String accountName;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @Pattern(regexp = "^$|^[0-9]{9,18}$", 
             message = "Account number must be between 9 and 18 digits (numbers only)")
    private String accountNumber;

    @Size(max = 100, message = "Bank name cannot exceed 100 characters")
    private String bankName;

    @NotNull(message = "Initial balance is required")
    @DecimalMin(value = "0.00", message = "Initial balance cannot be negative")
    @DecimalMax(value = "9999999999.99", message = "Initial balance cannot exceed 9,999,999,999.99")
    private BigDecimal initialBalance;
}
