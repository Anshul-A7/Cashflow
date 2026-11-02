package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findAllByBusinessIdOrderByPaymentDateDesc(Long businessId);
    List<Payment> findAllByBusinessIdAndCustomerIdOrderByPaymentDateDesc(Long businessId, Long customerId);
    List<Payment> findAllByInvoiceId(Long invoiceId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
           "WHERE p.business.id = :businessId " +
           "AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumPaymentsInPeriod(@Param("businessId") Long businessId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
}

