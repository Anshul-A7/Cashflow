package com.cashflowguardian.app.repository;

import com.cashflowguardian.app.domain.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<Notification> findAllByBusinessIdAndIsReadFalseOrderByCreatedAtDesc(Long businessId);
    long countByBusinessIdAndIsReadFalse(Long businessId);
}

