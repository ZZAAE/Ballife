package com.prologue.ballife.domain.medicine;

import java.time.LocalDate;

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

    @Column(name = "PRESCRIPTION_DATE", nullable = false)
    private LocalDate prescriptionDate;

    
}
