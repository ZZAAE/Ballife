package com.prologue.ballife.web.analysis;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.security.CustomUserDetails;
import com.prologue.ballife.service.HealthAnalysisService;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 건강 분석 API 엔드포인트.
 *
 * 인증된 사용자만 접근 가능 (SecurityConfig의 .anyRequest().authenticated() 정책).
 * 본인 데이터만 조회 가능하도록 PathVariable userId 대신 SecurityContext에서 추출하는
 * GET /weekly 신규 엔드포인트를 권장한다. 기존 /weekly/{userId} 는 deprecated 상태로
 * 하위 호환 차원에서 유지한다.
 */
@Tag(name = "HealthAnalysis", description = "건강 분석 API (혈압/혈당/BMI/복약/보유 질환 종합 분석)")
@RestController
@RequestMapping("/api/health-analysis")
@RequiredArgsConstructor
public class HealthAnalysisController {

    private final HealthAnalysisService healthAnalysisService;

    @Operation(
            summary = "주간(최근 7일) 건강 분석 — 본인 데이터 (권장)",
            description = "JWT 토큰으로 인증된 본인의 최근 7일 측정 기록을 분석한다. "
                        + "측정 기록이 없는 항목은 내부 필드가 null로 반환된다. "
                        + "사용자 ID는 SecurityContext에서 추출하므로 클라이언트가 임의 ID를 넣을 수 없다."
    )
    @GetMapping("/weekly")
    public ResponseEntity<HealthAnalysisResponse> getMyWeeklyAnalysis(
            @AuthenticationPrincipal CustomUserDetails me) {
        return ResponseEntity.ok(healthAnalysisService.analyzeWeekly(me.getUserId()));
    }

    /**
     * @deprecated PathVariable userId 방식은 다른 사용자 ID를 임의로 넣을 수 있는 우회 가능성이 있어
     *             신규 {@link #getMyWeeklyAnalysis(CustomUserDetails)} 사용을 권장한다.
     *             하위 호환 유지를 위해 동일 동작으로 보존하며, 향후 별도 단계에서 제거 예정.
     */
    @Deprecated
    @Operation(
            summary = "[Deprecated] 주간 건강 분석 — 특정 userId 지정",
            description = "**Deprecated**. 신규 GET /api/health-analysis/weekly (본인 데이터 자동 추출) 사용을 권장한다. "
                        + "본 엔드포인트는 PathVariable로 받은 userId 그대로 분석한다 — "
                        + "본인이 아닌 다른 사용자 ID를 넣는 우회 가능성이 있어 보안상 권장되지 않는다. "
                        + "하위 호환 차원에서 유지하며, 향후 별도 단계에서 제거 예정."
    )
    @GetMapping("/weekly/{userId}")
    public ResponseEntity<HealthAnalysisResponse> getWeeklyAnalysis(
            @Parameter(description = "분석 대상 사용자 ID") @PathVariable Long userId) {
        return ResponseEntity.ok(healthAnalysisService.analyzeWeekly(userId));
    }
}
