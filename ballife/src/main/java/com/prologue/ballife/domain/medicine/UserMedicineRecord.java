package com.prologue.ballife.domain.medicine;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "USER_MEDICINE_RECORD")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMedicineRecord {  

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_MEDICINE_RECORD_ID", nullable = false)
    private Long userMedicineRecordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRESCRIPTION_ID", nullable = false)
    private Prescription prescription;

    // 복용 시간 
    @Column (name = "INTAKE_DATE")
    private LocalDate intakeDate;

    // 복용 시간 
    @Column (name = "INTAKE_TIME")
    private LocalTime intakeTime;

    @Column(name = "SUPPLEMENT_ID")  
    private Long supplementId;

    // 복용 간격
    public enum TakenCategory {
        MORNING,
        LUNCH,
        DINNER,
        BEDTIME,
        FASTING
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "TAKEN_CATEGORY")
    private TakenCategory takenCategory;
    
}