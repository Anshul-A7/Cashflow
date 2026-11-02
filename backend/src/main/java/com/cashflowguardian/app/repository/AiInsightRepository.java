package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    List<AiInsight> findAllByBusinessIdOrderByGeneratedAtDesc(Long businessId);
}

