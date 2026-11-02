package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findAllByOwnerId(Long ownerId);
    Optional<Business> findByIdAndOwnerId(Long id, Long ownerId);
}

