package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.Business;
import com.cashflowguardian.app.domain.entity.Customer;
import com.cashflowguardian.app.domain.entity.Invoice;
import com.cashflowguardian.app.domain.entity.Payment;
import com.cashflowguardian.app.domain.enums.CustomerRiskTier;
import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.repository.CustomerRepository;
import com.cashflowguardian.app.repository.InvoiceRepository;
import com.cashflowguardian.app.repository.PaymentRepository;
import com.cashflowguardian.app.web.dto.CustomerRequest;
import com.cashflowguardian.app.web.dto.CustomerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuthService authService;

    @Transactional
    public CustomerResponse createCustomer(Long businessId, CustomerRequest request, String userEmail) {
        Business business = authService.validateBusinessAccess(businessId, userEmail);

        String cleanEmail = (request.getEmail() != null && !request.getEmail().trim().isEmpty()) ? request.getEmail().trim() : null;
        String cleanPhone = (request.getPhone() != null && !request.getPhone().trim().isEmpty()) ? request.getPhone().trim() : null;
        String cleanAddress = (request.getAddress() != null && !request.getAddress().trim().isEmpty()) ? request.getAddress().trim() : null;
        String cleanTaxId = (request.getTaxId() != null && !request.getTaxId().trim().isEmpty()) ? request.getTaxId().trim().toUpperCase() : null;

        Customer customer = Customer.builder()
                .business(business)
                .name(request.getName().trim())
                .email(cleanEmail)
                .phone(cleanPhone)
                .address(cleanAddress)
                .taxId(cleanTaxId)
                .paymentReliabilityScore(new BigDecimal("100.00"))
                .averageDaysLate(BigDecimal.ZERO)
                .riskTier(CustomerRiskTier.LOW_RISK)
                .build();

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomers(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        return customerRepository.findAllByBusinessIdOrderByNameAsc(businessId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long businessId, Long customerId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Customer customer = customerRepository.findByIdAndBusinessId(customerId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long businessId, Long customerId, CustomerRequest request, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Customer customer = customerRepository.findByIdAndBusinessId(customerId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        String cleanEmail = (request.getEmail() != null && !request.getEmail().trim().isEmpty()) ? request.getEmail().trim() : null;
        String cleanPhone = (request.getPhone() != null && !request.getPhone().trim().isEmpty()) ? request.getPhone().trim() : null;
        String cleanAddress = (request.getAddress() != null && !request.getAddress().trim().isEmpty()) ? request.getAddress().trim() : null;
        String cleanTaxId = (request.getTaxId() != null && !request.getTaxId().trim().isEmpty()) ? request.getTaxId().trim().toUpperCase() : null;

        customer.setName(request.getName().trim());
        customer.setEmail(cleanEmail);
        customer.setPhone(cleanPhone);
        customer.setAddress(cleanAddress);
        customer.setTaxId(cleanTaxId);

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    @Transactional
    public void deleteCustomer(Long businessId, Long customerId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Customer customer = customerRepository.findByIdAndBusinessId(customerId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        customerRepository.delete(customer);
    }

    public CustomerResponse mapToResponse(Customer customer) {
        List<Invoice> invoices = invoiceRepository.findAllByBusinessIdAndCustomerIdOrderByDueDateAsc(
                customer.getBusiness().getId(), customer.getId());
        List<Payment> payments = paymentRepository.findAllByBusinessIdAndCustomerIdOrderByPaymentDateDesc(
                customer.getBusiness().getId(), customer.getId());

        BigDecimal totalBilled = invoices.stream()
                .filter(inv -> inv.getStatus() != InvoiceStatus.CANCELLED)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstanding = invoices.stream()
                .filter(inv -> inv.getStatus() != InvoiceStatus.PAID && inv.getStatus() != InvoiceStatus.CANCELLED)
                .map(Invoice::getOutstandingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CustomerResponse.builder()
                .id(customer.getId())
                .businessId(customer.getBusiness().getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .taxId(customer.getTaxId())
                .paymentReliabilityScore(customer.getPaymentReliabilityScore())
                .averageDaysLate(customer.getAverageDaysLate())
                .riskTier(customer.getRiskTier())
                .totalBilled(totalBilled)
                .totalPaid(totalPaid)
                .outstandingBalance(outstanding)
                .createdAt(customer.getCreatedAt())
                .build();
    }
}

