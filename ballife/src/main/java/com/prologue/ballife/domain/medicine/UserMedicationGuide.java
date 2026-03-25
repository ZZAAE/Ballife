package com.prologue.ballife.domain.medicine;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;


@Entity 
@Table(name = "USER_MEDICATION_GUIDE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class UserMedicationGuide {
    // 복용기록 식별자 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_MEDICATION_ID", nullable = false)
    private Long userMedicationId;

    // 약봉지별로 그룹 
    @Column(name = "GROUP_ID", nullable = false)
    private Long groupId;

    // 복용량
    @Column (name = "DOSAGE", nullable = false)
    private Integer dosage; 

    // 복용간격 
    @Column(name = "INTAKE_INTERVAL", length = 100, nullable = false)
    private String intakeInterval;

    // 복용 시작 날짜 
    @Column (name = "START_DATE")
    private LocalDate startDate;

    // 며칠 먹는지 
    @Column (name = "DAY")
    private Integer day;

    // 메모 사용자 입력 
    @Column (name = "MEMO", length = 300)
    private String memo;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "KD_CODE")
    private Medicine kdCode;


   



}
