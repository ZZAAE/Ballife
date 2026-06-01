package com.prologue.ballife.analyzer;

import com.prologue.ballife.standard.DiseaseProfileStandard;
import com.prologue.ballife.standard.DiseaseProfileStandard.DiseaseProfile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 보유 질환 분석기.
 * DB에 저장된 diseaseIndex 문자열을 파싱해서 구조화된 형태로 변환한다.
 *
 * 예) "hypertension:type2,diabetes:type1" 
 *  →  [고혈압(1기), 당뇨(1형)] 형태의 객체 리스트
 */
@Component
public class DiseaseProfileAnalyzer {

    public DiseaseProfileAnalysisResult analyze(String diseaseIndex) {
        List<DiseaseProfile> profiles = DiseaseProfileStandard.parse(diseaseIndex);
        return new DiseaseProfileAnalysisResult(profiles);
    }
}
