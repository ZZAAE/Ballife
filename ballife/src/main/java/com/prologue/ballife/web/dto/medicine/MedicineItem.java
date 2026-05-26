package com.prologue.ballife.web.dto.medicine;

/*	식품의약품안전처_의약품개요정보(e약은요) API 통신, 몽고DB을 위한 DTO */
public record MedicineItem(
    String itemSeq,          // 품목기준코드
    String itemName,         // 제품명
    String entpName,         // 업체명
    String efcyQesitm,       // 효능
    String useMethodQesitm,  // 사용법
    String atpnWarnQesitm,   // 주의사항 경고
    String atpnQesitm,       // 주의사항
    String intrcQesitm,      // 상호작용
    String seQesitm,         // 부작용
    String depositMethodQesitm, // 보관법
    String itemImage         // 낱알이미지 URL
) {}
