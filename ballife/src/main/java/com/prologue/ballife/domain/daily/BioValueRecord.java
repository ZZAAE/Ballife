package com.prologue.ballife.domain.daily;

import java.time.*;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "BIO_VALUE_RECORD")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BioValueRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="RECORD_ID", nullable = false)
    private Long recordId;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name="RECORD_TIME", nullable = false)
    private LocalDateTime recordTime;

    @Column(name="CATEGORY", nullable = false, length = 10)
    private String category;

    @Column(name="BLOODSUGAR", nullable = true)
    private Integer bloodSugar;

    @Column(name="SYSTOLIC_BP", nullable = true)
    private Integer systolicBP;

    @Column(name="DIASTOLIC_BP", nullable = true)
    private Integer diastolicBP;

    @Column(name="WEIGHT", nullable = true)
    private Double weight;

    @Column(name="WATER_INTAKE_CUP", nullable = true)
    private Integer waterIntakeCup;
}
