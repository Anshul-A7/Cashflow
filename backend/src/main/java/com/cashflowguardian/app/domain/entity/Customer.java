package com.cashflowguardian.app.domain.entity;

import com.cashflowguardian.app.domain.enums.CustomerRiskTier;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Builder.Default
    @Column(name = "payment_reliability_score", precision = 5, scale = 2)
    private BigDecimal paymentReliabilityScore = new BigDecimal("100.00");

    @Builder.Default
    @Column(name = "average_days_late", precision = 5, scale = 2)
    private BigDecimal averageDaysLate = BigDecimal.ZERO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_tier", nullable = false, length = 30)
    private CustomerRiskTier riskTier = CustomerRiskTier.LOW_RISK;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

