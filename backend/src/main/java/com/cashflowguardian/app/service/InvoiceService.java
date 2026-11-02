package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.Business;
import com.cashflowguardian.app.domain.entity.Customer;
import com.cashflowguardian.app.domain.entity.Invoice;
import com.cashflowguardian.app.domain.entity.InvoiceItem;
import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.repository.CustomerRepository;
import com.cashflowguardian.app.repository.InvoiceRepository;
import com.cashflowguardian.app.web.dto.InvoiceItemRequest;
import com.cashflowguardian.app.web.dto.InvoiceItemResponse;
import com.cashflowguardian.app.web.dto.InvoiceRequest;
import com.cashflowguardian.app.web.dto.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final AuthService authService;

    @Transactional
    public InvoiceResponse createInvoice(Long businessId, InvoiceRequest request, String userEmail) {
        Business business = authService.validateBusinessAccess(businessId, userEmail);

        Customer customer = customerRepository.findByIdAndBusinessId(request.getCustomerId(), businessId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getCustomerId()));

        if (request.getDueDate().isBefore(request.getIssueDate())) {
            throw new IllegalArgumentException("Invoice due date (" + request.getDueDate() + ") cannot be earlier than issue date (" + request.getIssueDate() + ")");
        }

        String invoiceNumber = request.getInvoiceNumber();
        if (invoiceNumber == null || invoiceNumber.trim().isEmpty()) {
            long count = invoiceRepository.countByBusinessId(businessId) + 1;
            invoiceNumber = String.format("INV-%d-%04d", LocalDate.now().getYear(), count);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (InvoiceItemRequest itemReq : request.getItems()) {
            BigDecimal lineTotal = itemReq.getQuantity().multiply(itemReq.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxAmount = subtotal.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;

        if (discount.compareTo(subtotal) > 0) {
            throw new IllegalArgumentException("Discount amount (" + discount + ") cannot exceed invoice subtotal (" + subtotal + ")");
        }

        BigDecimal totalAmount = subtotal.add(taxAmount).subtract(discount).max(BigDecimal.ZERO);

        InvoiceStatus initialStatus = request.getDueDate().isBefore(LocalDate.now()) ? InvoiceStatus.OVERDUE : InvoiceStatus.SENT;

        Invoice invoice = Invoice.builder()
                .business(business)
                .customer(customer)
                .invoiceNumber(invoiceNumber.trim())
                .issueDate(request.getIssueDate())
                .dueDate(request.getDueDate())
                .subtotal(subtotal)
                .taxRate(taxRate)
                .taxAmount(taxAmount)
                .discountAmount(discount)
                .totalAmount(totalAmount)
                .paidAmount(BigDecimal.ZERO)
                .status(initialStatus)
                .notes(request.getNotes())
                .build();

        for (InvoiceItemRequest itemReq : request.getItems()) {
            BigDecimal lineTotal = itemReq.getQuantity().multiply(itemReq.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .description(itemReq.getDescription().trim())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .lineTotal(lineTotal)
                    .build();
            invoice.addItem(item);
        }

        invoice = invoiceRepository.save(invoice);
        return mapToResponse(invoice);
    }

    @Transactional
    public List<InvoiceResponse> getInvoices(Long businessId, InvoiceStatus status, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        // Auto-check overdue status transitions before returning
        checkAndMarkOverdue(businessId);

        List<Invoice> invoices;
        if (status != null) {
            invoices = invoiceRepository.findAllByBusinessIdAndStatus(businessId, status);
        } else {
            invoices = invoiceRepository.findAllByBusinessIdOrderByDueDateAsc(businessId);
        }

        return invoices.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long businessId, Long invoiceId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Invoice invoice = invoiceRepository.findByIdAndBusinessId(invoiceId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        return mapToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse updateStatus(Long businessId, Long invoiceId, InvoiceStatus newStatus, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Invoice invoice = invoiceRepository.findByIdAndBusinessId(invoiceId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        invoice.setStatus(newStatus);
        invoice.setUpdatedAt(OffsetDateTime.now());
        invoice = invoiceRepository.save(invoice);

        return mapToResponse(invoice);
    }

    @Transactional
    public void deleteInvoice(Long businessId, Long invoiceId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Invoice invoice = invoiceRepository.findByIdAndBusinessId(invoiceId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        invoiceRepository.delete(invoice);
    }

    public void checkAndMarkOverdue(Long businessId) {
        LocalDate today = LocalDate.now();
        List<Invoice> overduePending = invoiceRepository.findOverduePendingInvoices(businessId, today);
        for (Invoice inv : overduePending) {
            inv.setStatus(InvoiceStatus.OVERDUE);
            inv.setUpdatedAt(OffsetDateTime.now());
            invoiceRepository.save(inv);
        }
    }

    public InvoiceResponse mapToResponse(Invoice invoice) {
        List<InvoiceItemResponse> itemDtos = invoice.getItems().stream()
                .map(item -> InvoiceItemResponse.builder()
                        .id(item.getId())
                        .description(item.getDescription())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .lineTotal(item.getLineTotal())
                        .build())
                .collect(Collectors.toList());

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .businessId(invoice.getBusiness().getId())
                .customerId(invoice.getCustomer().getId())
                .customerName(invoice.getCustomer().getName())
                .invoiceNumber(invoice.getInvoiceNumber())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .subtotal(invoice.getSubtotal())
                .taxRate(invoice.getTaxRate())
                .taxAmount(invoice.getTaxAmount())
                .discountAmount(invoice.getDiscountAmount())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .outstandingBalance(invoice.getOutstandingBalance())
                .status(invoice.getStatus())
                .notes(invoice.getNotes())
                .items(itemDtos)
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}

