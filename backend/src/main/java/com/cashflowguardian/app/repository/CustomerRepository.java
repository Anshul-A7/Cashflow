package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findAllByBusinessIdOrderByNameAsc(Long businessId);
    Optional<Customer> findByIdAndBusinessId(Long id, Long businessId);
    long countByBusinessId(Long businessId);
}

