package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.CashAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CashAccountRepository extends JpaRepository<CashAccount, Long> {
    List<CashAccount> findAllByBusinessIdOrderByAccountNameAsc(Long businessId);
    Optional<CashAccount> findByIdAndBusinessId(Long id, Long businessId);

    // Explicitly specified in Project Report Chapter 4 / CashFlowService
    @Query("SELECT COALESCE(SUM(ca.currentBalance), 0) FROM CashAccount ca WHERE ca.business.id = :businessId")
    BigDecimal sumBalance(@Param("businessId") Long businessId);
}

