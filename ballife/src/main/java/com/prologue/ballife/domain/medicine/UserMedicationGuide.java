package com.prologue.ballife.domain.medicine;

import java.time.LocalDate;
import com.prologue.ballife.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
@Entity 
@Table(name = "USER_MEDICATION_GUIDE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMedicationGuide {
    // 복용기록 식별자 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_MEDICATION_ID", nullable = false)
    private Long userMedicationId;
    
    // json에서 가져오는 kd코드 
    @Column (name = "KD_CODE") 
    private String kdCode;

    // 복용간격 
    @Column(name = "INTAKE_INTERVAL", length = 100, nullable = false)
    private String intakeInterval;

    // 며칠 먹는지 
    @Column (name = "DAY")
    private Integer day;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRESCRIPTION_ID", nullable = false)
    private Prescription prescriptionId;
    
}
