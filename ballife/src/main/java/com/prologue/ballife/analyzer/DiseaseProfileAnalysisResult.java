package com.prologue.ballife.analyzer;

import com.prologue.ballife.standard.DiseaseProfileStandard.DiseaseProfile;

import java.util.List;

/**
 * 보유 질환 분석 결과.
 * 사용자가 신고한 보유 질환들의 파싱 결과를 담는다.
 * AI가 진단한 게 아니라 자기 신고 정보다.
 */
public record DiseaseProfileAnalysisResult(
        List<DiseaseProfile> diseases  // 빈 리스트 가능 (보유 질환 없음)
) {}
