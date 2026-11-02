package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.service.InvoiceService;
import com.cashflowguardian.app.web.dto.InvoiceRequest;
import com.cashflowguardian.app.web.dto.InvoiceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoice Management", description = "Create customer invoices, compute taxes, and track overdue receivables")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/{businessId}")
    @Operation(summary = "Generate customer invoice with multi-item calculations")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @PathVariable Long businessId,
            @Valid @RequestBody InvoiceRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(invoiceService.createInvoice(businessId, request, authentication.getName()));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "List invoices with optional status filter (e.g. SENT, PAID, OVERDUE)")
    public ResponseEntity<List<InvoiceResponse>> getInvoices(
            @PathVariable Long businessId,
            @RequestParam(required = false) InvoiceStatus status,
            Authentication authentication) {
        return ResponseEntity.ok(invoiceService.getInvoices(businessId, status, authentication.getName()));
    }

    @GetMapping("/{businessId}/{invoiceId}")
    @Operation(summary = "Get full invoice details with line items and outstanding balance")
    public ResponseEntity<InvoiceResponse> getInvoiceById(
            @PathVariable Long businessId,
            @PathVariable Long invoiceId,
            Authentication authentication) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(businessId, invoiceId, authentication.getName()));
    }

    @PatchMapping("/{businessId}/{invoiceId}/status")
    @Operation(summary = "Transition invoice status (e.g. SENT, CANCELLED)")
    public ResponseEntity<InvoiceResponse> updateStatus(
            @PathVariable Long businessId,
            @PathVariable Long invoiceId,
            @RequestParam InvoiceStatus status,
            Authentication authentication) {
        return ResponseEntity.ok(invoiceService.updateStatus(businessId, invoiceId, status, authentication.getName()));
    }

    @DeleteMapping("/{businessId}/{invoiceId}")
    @Operation(summary = "Delete invoice record")
    public ResponseEntity<Void> deleteInvoice(
            @PathVariable Long businessId,
            @PathVariable Long invoiceId,
            Authentication authentication) {
        invoiceService.deleteInvoice(businessId, invoiceId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

