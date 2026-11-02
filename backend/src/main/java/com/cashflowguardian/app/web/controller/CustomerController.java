package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.CustomerBehaviorIntelligenceService;
import com.cashflowguardian.app.service.CustomerService;
import com.cashflowguardian.app.web.dto.CustomerBehaviorDto;
import com.cashflowguardian.app.web.dto.CustomerRequest;
import com.cashflowguardian.app.web.dto.CustomerResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customer & Behavior Intelligence", description = "Customer records and payment delay analytics")
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerBehaviorIntelligenceService behaviorService;

    @PostMapping("/{businessId}")
    @Operation(summary = "Register new customer")
    public ResponseEntity<CustomerResponse> createCustomer(
            @PathVariable Long businessId,
            @Valid @RequestBody CustomerRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(customerService.createCustomer(businessId, request, authentication.getName()));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "List all customers with outstanding balance and reliability scores")
    public ResponseEntity<List<CustomerResponse>> getCustomers(
            @PathVariable Long businessId,
            Authentication authentication) {
        return ResponseEntity.ok(customerService.getCustomers(businessId, authentication.getName()));
    }

    @GetMapping("/{businessId}/{customerId}")
    @Operation(summary = "Get single customer details")
    public ResponseEntity<CustomerResponse> getCustomerById(
            @PathVariable Long businessId,
            @PathVariable Long customerId,
            Authentication authentication) {
        return ResponseEntity.ok(customerService.getCustomerById(businessId, customerId, authentication.getName()));
    }

    @PutMapping("/{businessId}/{customerId}")
    @Operation(summary = "Update customer details")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long businessId,
            @PathVariable Long customerId,
            @Valid @RequestBody CustomerRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(customerService.updateCustomer(businessId, customerId, request, authentication.getName()));
    }

    @DeleteMapping("/{businessId}/{customerId}")
    @Operation(summary = "Delete customer record")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Long businessId,
            @PathVariable Long customerId,
            Authentication authentication) {
        customerService.deleteCustomer(businessId, customerId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{businessId}/behavior")
    @Operation(summary = "Analyze customer payment track records, average days late, and risk classification")
    public ResponseEntity<List<CustomerBehaviorDto>> getCustomerBehaviorMatrix(
            @PathVariable Long businessId,
            Authentication authentication) {
        customerService.getCustomers(businessId, authentication.getName()); // Validates business access
        return ResponseEntity.ok(behaviorService.getCustomerBehaviorMatrix(businessId));
    }
}

