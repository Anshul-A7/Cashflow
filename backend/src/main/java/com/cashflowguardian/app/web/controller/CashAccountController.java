package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.CashAccountService;
import com.cashflowguardian.app.web.dto.CashAccountRequest;
import com.cashflowguardian.app.web.dto.CashAccountResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Cash & Bank Accounts", description = "Monitor cash reserves, bank checking accounts, and petty cash")
public class CashAccountController {

    private final CashAccountService cashAccountService;

    @PostMapping("/{businessId}")
    @Operation(summary = "Create cash/bank account with opening balance")
    public ResponseEntity<CashAccountResponse> createAccount(
            @PathVariable Long businessId,
            @Valid @RequestBody CashAccountRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(cashAccountService.createAccount(businessId, request, authentication.getName()));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "List all cash accounts and live balances")
    public ResponseEntity<List<CashAccountResponse>> getAccounts(
            @PathVariable Long businessId,
            Authentication authentication) {
        return ResponseEntity.ok(cashAccountService.getAccounts(businessId, authentication.getName()));
    }

    @GetMapping("/{businessId}/{accountId}")
    @Operation(summary = "Get cash account details")
    public ResponseEntity<CashAccountResponse> getAccountById(
            @PathVariable Long businessId,
            @PathVariable Long accountId,
            Authentication authentication) {
        return ResponseEntity.ok(cashAccountService.getAccountById(businessId, accountId, authentication.getName()));
    }

    @PutMapping("/{businessId}/{accountId}")
    @Operation(summary = "Update account name or bank details")
    public ResponseEntity<CashAccountResponse> updateAccount(
            @PathVariable Long businessId,
            @PathVariable Long accountId,
            @Valid @RequestBody CashAccountRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(cashAccountService.updateAccount(businessId, accountId, request, authentication.getName()));
    }

    @DeleteMapping("/{businessId}/{accountId}")
    @Operation(summary = "Delete cash account")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long businessId,
            @PathVariable Long accountId,
            Authentication authentication) {
        cashAccountService.deleteAccount(businessId, accountId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

