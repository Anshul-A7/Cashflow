package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.Business;
import com.cashflowguardian.app.domain.entity.Notification;
import com.cashflowguardian.app.domain.enums.NotificationType;
import com.cashflowguardian.app.repository.NotificationRepository;
import com.cashflowguardian.app.web.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    @Transactional
    public void createNotification(Business business, NotificationType type, String title, String message, Long referenceId) {
        Notification notification = Notification.builder()
                .business(business)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        return notificationRepository.findAllByBusinessIdOrderByCreatedAtDesc(businessId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);
        return notificationRepository.countByBusinessIdAndIsReadFalse(businessId);
    }

    @Transactional
    public void markAsRead(Long businessId, Long notificationId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        if (!notif.getBusiness().getId().equals(businessId)) {
            throw new SecurityException("Notification does not belong to business: " + businessId);
        }

        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

