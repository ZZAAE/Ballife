package com.prologue.ballife.domain.Daily;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Daliy_BP_Record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DaliyBPRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="RECORD_ID", nullable = false)
    private Long recordId;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name="DATE", nullable = false)
    private LocalDate date;

    @Column(name="TIME", nullable = false)
    private LocalTime time;

    @Column(name="SYSTOLIC_BP", nullable = false)
    private Integer systolicBP;

    @Column(name="DIASTOLIC_PB", nullable = false)
    private Integer diastolicBP;

}
