package com.prologue.ballife.web.analysis.dto;

import java.time.LocalDate;
import java.util.List;

import com.prologue.ballife.analyzer.BloodPressureAnalysisResult;
import com.prologue.ballife.analyzer.BloodSugarAnalysisResult;
import com.prologue.ballife.analyzer.BmiAnalysisResult;
import com.prologue.ballife.analyzer.DiseaseProfileAnalysisResult;
import com.prologue.ballife.analyzer.MedicationAnalysisResult;

/**
 * 건강 분석 API의 최종 응답 그릇.
 *
 * 필드 순서: (기존 7개 → 뒤에 user, recordingStats 추가)
 *   기존 — userId, period, bloodPressure, bloodSugar, bmi, medication, diseaseProfile
 *   추가 — user (보고서용 환자 정보 + 간략 질환), recordingStats (측정 기록률)
 *
 * - userId         : 분석 대상 사용자 ID
 * - period         : 분석 기간 (타입 + 시작/끝 날짜)
 * - bloodPressure  : 혈압 분석 결과 (측정 없으면 내부 필드 null)
 * - bloodSugar     : 혈당 분석 결과 (공복/식전/식후 3그룹, 없는 그룹 필드는 null)
 * - bmi            : BMI 분석 결과 (키·몸무게 없으면 내부 필드 null)
 * - medication     : 복약 이행률 분석 결과 (예정 복약 없으면 내부 필드 null)
 * - diseaseProfile : 사용자 신고 보유 질환 파싱 결과 (LLM 챗봇용 풀스펙)
 * - user           : 보고서용 환자 정보 (이름/나이/성별/키/몸무게 + 간략 질환 요약)
 * - recordingStats : 측정 기록률 (보고서용)
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
        DiseaseProfileAnalysisResult diseaseProfile,

        User user,
        RecordingStats recordingStats
) {
    /**
     * 분석 기간.
     * type 은 향후 다양한 분석 종류를 구분하기 위한 라벨 ("WEEKLY"/"MONTHLY"/"CUSTOM").
     */
    public record Period(
            String type,
            LocalDate startDate,
            LocalDate endDate
    ) {}

    /**
     * 보고서용 환자 기본 정보 + 보유 질환 간략 요약.
     *
     * - name        : User.username 을 매핑 (응답 JSON에서는 "name"으로 노출)
     * - age         : 오늘(LocalDate.now()) 기준 만나이
     * - height/weight : User 엔티티의 Double 그대로 (cm/kg)
     * - diseases    : 챗봇용 풀스펙은 diseaseProfile 에 그대로 두고, 여기는 보고서용 간략 요약만
     */
    public record User(
            String name,
            Integer age,
            String gender,
            Double height,
            Double weight,
            List<DiseaseSummary> diseases
    ) {}

    /**
     * 보고서용 질환 간략 요약.
     * (챗봇용 풀스펙은 diseaseProfile.diseases() 의 DiseaseProfile record 참조)
     */
    public record DiseaseSummary(
            String label,         // "고혈압"
            String subtypeLabel   // "1기" — 없거나 모르는 subtype이면 null
    ) {}

    /**
     * 측정 기록률 — 분석 기간 내 실제로 측정한 날짜 수 / 기간 일수.
     *
     * - bloodPressureDays : 혈압 기록이 있는 distinct 날짜 수
     * - bloodSugarDays    : 혈당 기록이 있는 distinct 날짜 수
     * - medicationDays    : 복약 기록이 있는 distinct 날짜 수
     * - periodDays        : 분석 기간 일수 (양 끝 포함)
     * - 각 rate           : 분자/분모 비율 (0.000 ~ 1.000, 소수점 셋째 자리)
     */
    public record RecordingStats(
            Integer bloodPressureDays,
            Integer bloodSugarDays,
            Integer medicationDays,
            Integer periodDays,
            Double  bloodPressureRate,
            Double  bloodSugarRate,
            Double  medicationRate
    ) {}
}