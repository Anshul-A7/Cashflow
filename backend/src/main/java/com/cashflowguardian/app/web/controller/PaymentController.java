package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.PaymentService;
import com.cashflowguardian.app.web.dto.PaymentRequest;
import com.cashflowguardian.app.web.dto.PaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Tracking & Reconciliation", description = "Record received payments, reconcile invoices, and update cash accounts")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{businessId}")
    @Operation(summary = "Record customer payment, credit cash account, and reconcile invoice balance")
    public ResponseEntity<PaymentResponse> recordPayment(
            @PathVariable Long businessId,
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(paymentService.recordPayment(businessId, request, authentication.getName()));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "List all received payments")
    public ResponseEntity<List<PaymentResponse>> getPayments(
            @PathVariable Long businessId,
            Authentication authentication) {
        return ResponseEntity.ok(paymentService.getPayments(businessId, authentication.getName()));
    }
}

