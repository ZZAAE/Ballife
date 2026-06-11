package com.prologue.ballife.web.medicine;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.medicine.PrnMedicationService;
import com.prologue.ballife.web.dto.medicine.PrnMedicationDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 상비약 직접 기록(PRN) API. 모두 로그인 필요(JWT).
 * userId 는 토큰 principal 에서 가져온다.
 */
@Tag(name = "PrnMedication", description = "상비약 직접 기록 API")
@RestController
@RequestMapping("/api/prn-medications")
@RequiredArgsConstructor
public class PrnMedicationController {

    private final PrnMedicationService service;

    @Operation(summary = "상비약 기록 목록 조회")
    @GetMapping
    public ResponseEntity<List<PrnMedicationDto.Response>> list(
            @AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(service.getByUser(principal.getUserId()));
    }

    @Operation(summary = "상비약 기록 추가")
    @PostMapping
    public ResponseEntity<PrnMedicationDto.Response> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody PrnMedicationDto.CreateRequest req) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(principal.getUserId(), req));
    }

    @Operation(summary = "상비약 기록 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        service.delete(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
