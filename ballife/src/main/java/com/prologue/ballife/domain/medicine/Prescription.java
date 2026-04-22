package com.prologue.ballife.domain.medicine;

import java.time.LocalDate;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;


@Entity 
@Table(name = "PRESCRIPTION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRESCRIPTION_ID", nullable = false)
    private Long prescriptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    public enum Pcategory {
        MEDICINE,
        SUPPLEMENT
    }

    @Enumerated(EnumType.STRING)
    @Column(name="P_CATEGORY", nullable = false)
    private Pcategory pCategory;

    @Column(name = "PRESCRIPTION_NAME", length = 30, nullable = false)
    private String prescriptionName;

    @Column(name = "PRESCRIPTION_DATE")
    private LocalDate prescriptionDate;

    @Column (name="SUPPLEMENT_ID")
    private Long supplementId;

    @Column (name = "MEMO", length = 300)
    private String memo;

    

}
