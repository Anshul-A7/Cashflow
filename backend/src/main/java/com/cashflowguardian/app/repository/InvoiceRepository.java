package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.Invoice;
import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findAllByBusinessIdOrderByDueDateAsc(Long businessId);
    List<Invoice> findAllByBusinessIdAndStatus(Long businessId, InvoiceStatus status);
    List<Invoice> findAllByBusinessIdAndCustomerIdOrderByDueDateAsc(Long businessId, Long customerId);
    Optional<Invoice> findByIdAndBusinessId(Long id, Long businessId);

    // Sum outstanding receivables due by a specific target date (Report Page 29)
    @Query("SELECT COALESCE(SUM(i.totalAmount - i.paidAmount), 0) FROM Invoice i " +
           "WHERE i.business.id = :businessId " +
           "AND i.dueDate <= :untilDate " +
           "AND i.status IN (com.cashflowguardian.app.domain.enums.InvoiceStatus.SENT, " +
           "                 com.cashflowguardian.app.domain.enums.InvoiceStatus.PARTIALLY_PAID, " +
           "                 com.cashflowguardian.app.domain.enums.InvoiceStatus.OVERDUE)")
    BigDecimal sumOutstandingDueBy(@Param("businessId") Long businessId, @Param("untilDate") LocalDate untilDate);

    // Total outstanding receivables
    @Query("SELECT COALESCE(SUM(i.totalAmount - i.paidAmount), 0) FROM Invoice i " +
           "WHERE i.business.id = :businessId " +
           "AND i.status IN (com.cashflowguardian.app.domain.enums.InvoiceStatus.SENT, " +
           "                 com.cashflowguardian.app.domain.enums.InvoiceStatus.PARTIALLY_PAID, " +
           "                 com.cashflowguardian.app.domain.enums.InvoiceStatus.OVERDUE)")
    BigDecimal sumTotalReceivables(@Param("businessId") Long businessId);

    // Overdue receivables (past due date)
    @Query("SELECT COALESCE(SUM(i.totalAmount - i.paidAmount), 0) FROM Invoice i " +
           "WHERE i.business.id = :businessId " +
           "AND i.dueDate < :currentDate " +
           "AND i.status IN (com.cashflowguardian.app.domain.enums.InvoiceStatus.SENT, " +
           "                 com.cashflowguardian.app.domain.enums.InvoiceStatus.PARTIALLY_PAID, " +
           "                 com.cashflowguardian.app.domain.enums.InvoiceStatus.OVERDUE)")
    BigDecimal sumOverdueReceivables(@Param("businessId") Long businessId, @Param("currentDate") LocalDate currentDate);

    // Find overdue invoices needing status transition to OVERDUE
    @Query("SELECT i FROM Invoice i WHERE i.business.id = :businessId AND i.dueDate < :currentDate AND i.status IN (com.cashflowguardian.app.domain.enums.InvoiceStatus.SENT, com.cashflowguardian.app.domain.enums.InvoiceStatus.PARTIALLY_PAID)")
    List<Invoice> findOverduePendingInvoices(@Param("businessId") Long businessId, @Param("currentDate") LocalDate currentDate);

    long countByBusinessIdAndStatus(Long businessId, InvoiceStatus status);
    long countByBusinessId(Long businessId);
}

