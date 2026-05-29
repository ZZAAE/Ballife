package com.prologue.ballife.web.analysis;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prologue.ballife.service.HealthAnalysisService;
import com.prologue.ballife.web.analysis.dto.HealthAnalysisResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 건강 분석 API 엔드포인트.
 *
 * 인증은 일단 미적용. 동작 확인 후 추후 별도 단계에서 Spring Security 통합 예정.
 */
@Tag(name = "HealthAnalysis", description = "건강 분석 API (혈압/혈당/BMI/복약/보유 질환 종합 분석)")
@RestController
@RequestMapping("/api/health-analysis")
@RequiredArgsConstructor
public class HealthAnalysisController {

    private final HealthAnalysisService healthAnalysisService;

    @Operation(
            summary = "주간(최근 7일) 건강 분석",
            description = "오늘 포함 최근 7일간의 측정 기록을 분석해 항목별 분류 결과를 반환한다. "
                        + "측정 기록이 없는 항목은 내부 필드가 null로 반환된다."
    )
    @GetMapping("/weekly/{userId}")
    public ResponseEntity<HealthAnalysisResponse> getWeeklyAnalysis(
            @Parameter(description = "분석 대상 사용자 ID") @PathVariable Long userId) {
        return ResponseEntity.ok(healthAnalysisService.analyzeWeekly(userId));
    }
}