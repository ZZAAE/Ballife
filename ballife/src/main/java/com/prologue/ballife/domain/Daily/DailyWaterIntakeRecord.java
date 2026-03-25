package com.prologue.ballife.domain.Daily;

import java.sql.Date;
import java.time.*;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Daily_Water_Intake_Record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyWaterIntakeRecord {
    
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

    @Column(name="WATER_INTAKE_CUP", nullable = false)
    private Integer waterIntakeCup;
}
