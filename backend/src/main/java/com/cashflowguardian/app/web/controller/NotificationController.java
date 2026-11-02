package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.NotificationService;
import com.cashflowguardian.app.web.dto.NotificationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications & Financial Alerts", description = "Overdue invoices, upcoming expenses, and liquidity warning alerts")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{businessId}")
    @Operation(summary = "List all business alerts and notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @PathVariable Long businessId,
            Authentication authentication) {
        return ResponseEntity.ok(notificationService.getNotifications(businessId, authentication.getName()));
    }

    @GetMapping("/{businessId}/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable Long businessId,
            Authentication authentication) {
        long count = notificationService.getUnreadCount(businessId, authentication.getName());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{businessId}/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long businessId,
            @PathVariable Long notificationId,
            Authentication authentication) {
        notificationService.markAsRead(businessId, notificationId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

