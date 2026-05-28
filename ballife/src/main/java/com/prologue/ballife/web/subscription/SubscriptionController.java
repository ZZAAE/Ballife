package com.prologue.ballife.web.subscription;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.subscription.SubscriptionService;
import com.prologue.ballife.web.dto.subscription.SubscriptionDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Subscription", description = "구독 API")
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(summary = "내 구독 상태 조회")
    @GetMapping("/me")
    public ResponseEntity<SubscriptionDto.StatusResponse> getMySubscription(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(subscriptionService.getStatus(principal.getUserId()));
    }

    @Operation(summary = "구독 활성화 (모의 결제)")
    @PostMapping("/activate")
    public ResponseEntity<SubscriptionDto.StatusResponse> activate(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody SubscriptionDto.ActivateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(subscriptionService.activate(principal.getUserId(), request.getPlan()));
    }

    @Operation(summary = "구독 해지")
    @PostMapping("/cancel")
    public ResponseEntity<SubscriptionDto.StatusResponse> cancel(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(subscriptionService.cancel(principal.getUserId()));
    }
}
