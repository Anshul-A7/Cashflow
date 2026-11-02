package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByBusinessIdOrderByExpenseDateDesc(Long businessId);
    Optional<Expense> findByIdAndBusinessId(Long id, Long businessId);

    // Sum unpaid expenses due by target date (Report Page 29)
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.business.id = :businessId " +
           "AND e.isPaid = false " +
           "AND e.dueDate <= :untilDate")
    BigDecimal sumUnpaidDueBy(@Param("businessId") Long businessId, @Param("untilDate") LocalDate untilDate);

    // Total upcoming payables
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.business.id = :businessId " +
           "AND e.isPaid = false")
    BigDecimal sumUpcomingPayables(@Param("businessId") Long businessId);

    // Total expenses incurred in date range
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.business.id = :businessId " +
           "AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesInPeriod(@Param("businessId") Long businessId, 
                                  @Param("startDate") LocalDate startDate, 
                                  @Param("endDate") LocalDate endDate);

    // Category breakdown
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e " +
           "WHERE e.business.id = :businessId " +
           "GROUP BY e.category")
    List<Object[]> getExpenseBreakdownByCategory(@Param("businessId") Long businessId);
}

