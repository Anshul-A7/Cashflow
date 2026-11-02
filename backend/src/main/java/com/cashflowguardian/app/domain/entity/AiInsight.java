package com.cashflowguardian.app.domain.entity;

import com.cashflowguardian.app.domain.enums.InsightType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ai_insights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Enumerated(EnumType.STRING)
    @Column(name = "insight_type", nullable = false, length = 40)
    private InsightType insightType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "actionable_advice", columnDefinition = "TEXT")
    private String actionableAdvice;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String severity = "INFO"; // INFO, WARNING, CRITICAL

    @Builder.Default
    @Column(name = "generated_at", nullable = false)
    private OffsetDateTime generatedAt = OffsetDateTime.now();
}

