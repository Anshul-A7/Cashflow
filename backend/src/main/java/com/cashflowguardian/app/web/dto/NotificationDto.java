package com.cashflowguardian.app.web.dto;

import com.cashflowguardian.app.domain.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long referenceId;
    private Boolean isRead;
    private OffsetDateTime createdAt;
}

