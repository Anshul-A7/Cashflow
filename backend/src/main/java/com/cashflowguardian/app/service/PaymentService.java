package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.*;
import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.repository.*;
import com.cashflowguardian.app.web.dto.PaymentRequest;
import com.cashflowguardian.app.web.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final CashAccountRepository cashAccountRepository;
    private final CustomerBehaviorIntelligenceService behaviorService;
    private final AuthService authService;

    @Transactional
    public PaymentResponse recordPayment(Long businessId, PaymentRequest request, String userEmail) {
        Business business = authService.validateBusinessAccess(businessId, userEmail);

        Customer customer = customerRepository.findByIdAndBusinessId(request.getCustomerId(), businessId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getCustomerId()));

        CashAccount cashAccount = cashAccountRepository.findByIdAndBusinessId(request.getCashAccountId(), businessId)
                .orElseThrow(() -> new IllegalArgumentException("Cash account not found: " + request.getCashAccountId()));

        Invoice invoice = null;
        if (request.getInvoiceId() != null) {
            invoice = invoiceRepository.findByIdAndBusinessId(request.getInvoiceId(), businessId)
                    .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + request.getInvoiceId()));

            if (!invoice.getCustomer().getId().equals(customer.getId())) {
                throw new IllegalArgumentException("Invoice #" + invoice.getInvoiceNumber() + " does not belong to customer: " + customer.getName());
            }

            if (invoice.getStatus() == InvoiceStatus.PAID) {
                throw new IllegalArgumentException("Invoice #" + invoice.getInvoiceNumber() + " is already fully paid");
            }

            BigDecimal remaining = invoice.getOutstandingBalance();
            if (request.getAmount().compareTo(remaining) > 0) {
                throw new IllegalArgumentException("Payment amount (" + request.getAmount() + ") cannot exceed invoice remaining balance (" + remaining + ")");
            }

            // Update invoice paid amount & status
            BigDecimal newPaid = invoice.getPaidAmount().add(request.getAmount());
            invoice.setPaidAmount(newPaid);
            if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
                invoice.setStatus(InvoiceStatus.PAID);
            } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
                invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
            }
            invoice.setUpdatedAt(OffsetDateTime.now());
            invoiceRepository.save(invoice);
        }

        // Deposit amount to CashAccount
        cashAccount.setCurrentBalance(cashAccount.getCurrentBalance().add(request.getAmount()));
        cashAccount.setUpdatedAt(OffsetDateTime.now());
        cashAccountRepository.save(cashAccount);

        Payment payment = Payment.builder()
                .business(business)
                .customer(customer)
                .invoice(invoice)
                .cashAccount(cashAccount)
                .paymentDate(request.getPaymentDate())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .referenceNumber(request.getReferenceNumber() != null ? request.getReferenceNumber().trim() : null)
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);

        // Update customer payment behavior metrics asynchronously or synchronously
        behaviorService.recalculateCustomerMetrics(customer.getId());

        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        return paymentRepository.findAllByBusinessIdOrderByPaymentDateDesc(businessId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .businessId(p.getBusiness().getId())
                .customerId(p.getCustomer().getId())
                .customerName(p.getCustomer().getName())
                .invoiceId(p.getInvoice() != null ? p.getInvoice().getId() : null)
                .invoiceNumber(p.getInvoice() != null ? p.getInvoice().getInvoiceNumber() : null)
                .cashAccountId(p.getCashAccount().getId())
                .cashAccountName(p.getCashAccount().getAccountName())
                .paymentDate(p.getPaymentDate())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .referenceNumber(p.getReferenceNumber())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .build();
    }
}

