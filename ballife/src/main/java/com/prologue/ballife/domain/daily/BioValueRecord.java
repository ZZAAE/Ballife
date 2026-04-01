package com.prologue.ballife.domain.daily;

import java.math.BigInteger;
import java.sql.Date;
import java.time.*;

import com.prologue.ballife.domain.user.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Daily_Calorie")
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
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name="DATE", nullable = false)
    private LocalDate date;

    @Column(name="TIME", nullable = false)
    private LocalTime time;

    @Column(name="CATEGORY", nullable = false, length = 10)
    private String category;

    @Column(name="BLOODSUGAR", nullable = false)
    private Integer bloodSugar;

    @Column(name="SYSTOLIC_BP", nullable = false)
    private Integer systolicBP;

    @Column(name="DIASTOLIC_BP", nullable = false)
    private Integer diastolicBP;

    @Column(name="WEIGHT", nullable = false)
    private Integer weight;

    @Column(name="WATER_INTAKE_CUP", nullable = false)
    private Integer waterIntakeCup;
}
