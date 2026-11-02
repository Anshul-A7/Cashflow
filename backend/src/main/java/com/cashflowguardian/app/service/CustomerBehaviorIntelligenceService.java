package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.Customer;
import com.cashflowguardian.app.domain.entity.Invoice;
import com.cashflowguardian.app.domain.entity.Payment;
import com.cashflowguardian.app.domain.enums.CustomerRiskTier;
import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.repository.CustomerRepository;
import com.cashflowguardian.app.repository.InvoiceRepository;
import com.cashflowguardian.app.repository.PaymentRepository;
import com.cashflowguardian.app.web.dto.CustomerBehaviorDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Feature 6: Customer Payment Behavior Intelligence (CPBI)
 * Analyzes payment track record, calculates payment delay index, and tags chronic late payers.
 */
@Service
@RequiredArgsConstructor
public class CustomerBehaviorIntelligenceService {

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public void recalculateCustomerMetrics(Long customerId) {
        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null) return;

        List<Invoice> invoices = invoiceRepository.findAllByBusinessIdAndCustomerIdOrderByDueDateAsc(
                customer.getBusiness().getId(), customerId);
        List<Payment> payments = paymentRepository.findAllByBusinessIdAndCustomerIdOrderByPaymentDateDesc(
                customer.getBusiness().getId(), customerId);

        if (invoices.isEmpty()) {
            customer.setPaymentReliabilityScore(new BigDecimal("100.00"));
            customer.setAverageDaysLate(BigDecimal.ZERO);
            customer.setRiskTier(CustomerRiskTier.LOW_RISK);
            customerRepository.save(customer);
            return;
        }

        // Calculate Days To Pay for settled invoices
        long totalDelayDays = 0;
        int evaluatedInvoices = 0;
        int overdueCount = 0;
        LocalDate today = LocalDate.now();

        for (Invoice inv : invoices) {
            if (inv.getStatus() == InvoiceStatus.PAID) {
                // Find latest payment for this invoice
                List<Payment> invPayments = paymentRepository.findAllByInvoiceId(inv.getId());
                if (!invPayments.isEmpty()) {
                    LocalDate paidDate = invPayments.get(0).getPaymentDate();
                    long days = ChronoUnit.DAYS.between(inv.getDueDate(), paidDate);
                    totalDelayDays += Math.max(0, days);
                    evaluatedInvoices++;
                }
            } else if (inv.getStatus() == InvoiceStatus.OVERDUE || (inv.getDueDate().isBefore(today) && inv.getStatus() != InvoiceStatus.CANCELLED)) {
                overdueCount++;
                long daysPast = ChronoUnit.DAYS.between(inv.getDueDate(), today);
                totalDelayDays += Math.max(0, daysPast);
                evaluatedInvoices++;
            }
        }

        BigDecimal avgDaysLate = evaluatedInvoices > 0
                ? BigDecimal.valueOf(totalDelayDays).divide(BigDecimal.valueOf(evaluatedInvoices), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Reliability Formula: 100 - (AvgDelay * 3) - (OverdueCount * 15)
        BigDecimal score = new BigDecimal("100.00")
                .subtract(avgDaysLate.multiply(new BigDecimal("3.0")))
                .subtract(BigDecimal.valueOf(overdueCount).multiply(new BigDecimal("15.0")))
                .max(BigDecimal.ZERO)
                .min(new BigDecimal("100.00"));

        CustomerRiskTier tier;
        if (score.compareTo(new BigDecimal("80.00")) >= 0) {
            tier = CustomerRiskTier.LOW_RISK;
        } else if (score.compareTo(new BigDecimal("55.00")) >= 0) {
            tier = CustomerRiskTier.MODERATE_RISK;
        } else if (score.compareTo(new BigDecimal("30.00")) >= 0) {
            tier = CustomerRiskTier.CHRONIC_LATE;
        } else {
            tier = CustomerRiskTier.CRITICAL_DEFAULT_RISK;
        }

        customer.setPaymentReliabilityScore(score);
        customer.setAverageDaysLate(avgDaysLate);
        customer.setRiskTier(tier);
        customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerBehaviorDto> getCustomerBehaviorMatrix(Long businessId) {
        List<Customer> customers = customerRepository.findAllByBusinessIdOrderByNameAsc(businessId);
        List<CustomerBehaviorDto> matrix = new ArrayList<>();

        for (Customer c : customers) {
            List<Invoice> invoices = invoiceRepository.findAllByBusinessIdAndCustomerIdOrderByDueDateAsc(businessId, c.getId());
            List<Payment> payments = paymentRepository.findAllByBusinessIdAndCustomerIdOrderByPaymentDateDesc(businessId, c.getId());

            int totalIssued = invoices.size();
            int totalPaid = (int) invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.PAID).count();
            int overdue = (int) invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.OVERDUE).count();

            BigDecimal totalBilled = invoices.stream()
                    .filter(i -> i.getStatus() != InvoiceStatus.CANCELLED)
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalCollected = payments.stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal outstanding = invoices.stream()
                    .filter(i -> i.getStatus() != InvoiceStatus.PAID && i.getStatus() != InvoiceStatus.CANCELLED)
                    .map(Invoice::getOutstandingBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String summary;
            String action;

            switch (c.getRiskTier()) {
                case LOW_RISK -> {
                    summary = "Reliable payer. Typically settles invoices on or ahead of due date.";
                    action = "Standard net-30 terms. High credit limit approved.";
                }
                case MODERATE_RISK -> {
                    summary = String.format("Minor payment friction. Average delay of %s days.", c.getAverageDaysLate());
                    action = "Send friendly reminder 3 days prior to due date; offer 2% quick-pay discount.";
                }
                case CHRONIC_LATE -> {
                    summary = String.format("Chronic late payer. Consistent %s days payment backlog.", c.getAverageDaysLate());
                    action = "Reduce credit window to Net-7. Require phone confirmation before dispatch.";
                }
                default -> {
                    summary = String.format("High risk of payment default with %d overdue invoices.", overdue);
                    action = "Halt new deliveries. Require 100% advance payment or cash on delivery (COD).";
                }
            }

            matrix.add(CustomerBehaviorDto.builder()
                    .customerId(c.getId())
                    .customerName(c.getName())
                    .email(c.getEmail())
                    .reliabilityScore(c.getPaymentReliabilityScore())
                    .averageDaysLate(c.getAverageDaysLate())
                    .riskTier(c.getRiskTier())
                    .totalInvoicesIssued(totalIssued)
                    .totalInvoicesPaid(totalPaid)
                    .overdueInvoicesCount(overdue)
                    .totalBilled(totalBilled)
                    .totalCollected(totalCollected)
                    .currentOutstandingBalance(outstanding)
                    .behavioralSummary(summary)
                    .recommendedCollectionAction(action)
                    .build());
        }

        return matrix;
    }
}

