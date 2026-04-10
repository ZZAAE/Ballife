package com.prologue.ballife.domain.medicine;

import java.time.LocalDateTime;
import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "USER_MEDICINE_RECORD")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserMedicineRecord {  

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_MEDICINE_RECORD_ID", nullable = false)
    private Long userMedicineRecordId;

    // 복용 카테고리 (영양제, 병원약)
    @Column (name = "MEDICINE_CATEGORY", length = 15)
    private String medicineCategory;

    // 복용 시간 
    @Column (name = "INTAKE_TIME")
    private LocalDateTime intakeTime;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "PRESCRIPTION_ID") 
    private Prescription prescriptionId;

    @Column(name = "SUPPLEMENT_ID")  
    private Integer supplementId;
    
}