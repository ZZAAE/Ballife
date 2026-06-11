package com.prologue.ballife.web.notification;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.notification.NotificationService;
import com.prologue.ballife.web.dto.notification.NotificationDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Notification", description = "알림 API")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 내 알림 목록(최신순)
    @Operation(summary = "알림 목록 조회")
    @GetMapping
    public ResponseEntity<List<NotificationDto.Response>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(notificationService.getNotifications(principal.getUserId()));
    }

    // 안 읽은 알림 개수(헤더 배지 폴링용)
    @Operation(summary = "안 읽은 알림 개수")
    @GetMapping("/unread-count")
    public ResponseEntity<NotificationDto.UnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        long count = notificationService.getUnreadCount(principal.getUserId());
        return ResponseEntity.ok(NotificationDto.UnreadCountResponse.builder().count(count).build());
    }

    // 단건 읽음 처리
    @Operation(summary = "알림 읽음 처리")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        notificationService.markAsRead(notificationId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    // 전체 읽음 처리
    @Operation(summary = "알림 전체 읽음 처리")
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        notificationService.markAllAsRead(principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
