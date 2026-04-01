package com.prologue.ballife.domain.medicine;

import jakarta.persistence.*;
import lombok.*;


@Entity 
@Table(name = "MEDICINE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Medicine {
    // 받아오는 KD_CODE
    @Id 
    @Column(name = "KD_CODE", nullable = false, length = 15)
    private String kdCode;

    // 약 이름 
    @Column (name = "MEDICINE_NAME", length = 50)
    private String medicineName;

    // 관련 질환 
    @Column (name = "RELATED_DISEASE", length = 300)
    private String relatedDisease; 

    // 효능
    @Column (name = "EFFICACY_TEXT", length = 300)
    private String efficacyText;

    // 주의사항 
    @Column (name = "CAUTION_TEXT", length = 300)
    private String cautionText;

    // 부작용 
    @Column (name = "SIDE_EFFECT_TEXT", length = 300)
    private String sideEffectText; 

    // 약 이미지 URL 경로
    @Column (name = "IMAGE_URL", length = 300)
    private String imageUrl;

}
