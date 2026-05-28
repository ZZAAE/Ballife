package com.prologue.ballife.domain.medicine;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Document(collection = "medicines")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    @Id
    private String id;

    @Indexed(unique = true)
    private String itemSeq; //품목기준코드

    @Indexed
    private String itemName;         // 품목명 (한글)
    private String itemEngName;      // 품목명 (영문)

    private String etcOtcCode;       // 전문/일반의약품 구분
    private String chart;            // 성상
    private String storageMethod;    // 저장방법
    private String validTerm;        // 유효기간
    private String packUnit;         // 포장단위
    private String materialName;     // 원료성분 (raw, pipe-separated)
    private String mainItemIngr;     // 주성분
    private String mainIngrEng;      // 주성분 (영문)
    private String ingrName;         // 첨가제
    private String atcCode;          // ATC 코드
    private String ediCode;          // 보험코드
    private List<String> barCodes;   // 바코드 (콤마 분리 → 리스트)

    // XML 파싱된 평문
    private String efficacy;         // 효능효과 (EE_DOC_DATA 파싱)
    private String dosage;           // 용법용량 (UD_DOC_DATA 파싱)
    private String precautions;      // 사용상 주의사항 (NB_DOC_DATA 파싱)

    private LocalDateTime cachedAt;
}
