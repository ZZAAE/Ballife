package com.prologue.ballife.web.analysis.dto;

import java.time.LocalDate;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.DiseaseProfileAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;

/**
 * 건강 분석 API의 최종 응답 그릇.
 *
 * - userId         : 분석 대상 사용자 ID
 * - period         : 분석 기간 (타입 + 시작/끝 날짜)
 * - bloodPressure  : 혈압 분석 결과 (측정 없으면 내부 필드 null)
 * - bloodSugar     : 혈당 분석 결과 (공복/식전/식후 3그룹, 없는 그룹 필드는 null)
 * - bmi            : BMI 분석 결과 (키·몸무게 없으면 내부 필드 null)
 * - medication     : 복약 이행률 분석 결과 (예정 복약 없으면 내부 필드 null)
 * - diseaseProfile : 사용자 신고 보유 질환 파싱 결과 (없으면 빈 리스트)
 *
 * 식단/운동은 REFERENCE_ONLY 정책이라 이번 응답에는 포함하지 않는다.
 * 데이터 모델 확정 후 별도 필드로 추가 예정.
 */
public record HealthAnalysisResponse(
        Long userId,
        Period period,
        BloodPressureAnalysisResult bloodPressure,
        BloodSugarAnalysisResult    bloodSugar,
        BmiAnalysisResult           bmi,
        MedicationAnalysisResult    medication,
        DiseaseProfileAnalysisResult diseaseProfile
) {
    /**
     * 분석 기간.
     * type 은 향후 다양한 분석 종류를 구분하기 위한 라벨 (지금은 "WEEKLY" 고정).
     */
    public record Period(
            String type,
            LocalDate startDate,
            LocalDate endDate
    ) {}
}