package com.prologue.ballife.analyzer;

import com.prologue.ballife.config.MessageResolver;
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
 *
 * 라벨/챗봇 문구는 코드(diseaseKey/subtypeCode) 기준으로 현재 로케일로 해석한다.
 */
@Component
public class DiseaseProfileAnalyzer {

    private final MessageResolver messages;

    public DiseaseProfileAnalyzer(MessageResolver messages) {
        this.messages = messages;
    }

    public DiseaseProfileAnalysisResult analyze(String diseaseIndex) {
        List<DiseaseProfile> profiles = DiseaseProfileStandard.parse(diseaseIndex).stream()
                .map(this::localize)
                .toList();
        return new DiseaseProfileAnalysisResult(profiles);
    }

    private DiseaseProfile localize(DiseaseProfile p) {
        String key = p.diseaseKey();
        String diseaseLabel = messages.get("analysis.disease." + key + ".label");
        String subtypeLabel = (p.subtypeCode() == null)
                ? null
                : messages.get("analysis.disease." + key + "." + p.subtypeCode());
        String chatbotMessage = messages.get("analysis.disease." + key + ".chatbot");
        return new DiseaseProfile(
                p.diseaseKey(),
                diseaseLabel,
                p.subtypeCode(),
                subtypeLabel,
                p.characteristic(),
                p.linkedMeasurement(),
                chatbotMessage);
    }
}
