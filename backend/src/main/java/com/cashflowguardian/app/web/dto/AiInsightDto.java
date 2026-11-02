package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.InsightType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInsightDto {
    private Long id;
    private InsightType insightType;
    private String title;
    private String content;
    private String actionableAdvice;
    private String severity; // INFO, WARNING, CRITICAL
    private OffsetDateTime generatedAt;
}

