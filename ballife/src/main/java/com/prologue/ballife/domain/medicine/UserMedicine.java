package com.prologue.ballife.domain.medicine;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USER_MEDICINE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMedicine {
    // 복용기록 식별자
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_MEDICINE_ID", nullable = false)
    private Long userMedicineId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRESCRIPTION_ID", nullable = false)
    private Prescription prescription;

    @Column(name="KDCODE", nullable = false)
    private String kdCode;

    @Column (name="SUPPLEMENT_ID")
    private Long supplementId;

    

}
